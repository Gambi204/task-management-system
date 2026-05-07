from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from typing import List
import shutil
import os

import models
from database import engine, get_db
from schemas import LoginRequest, UserCreate, UserResponse, TaskResponse, StatusUpdate

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Collaborative Task Management System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")


def hash_password(password: str):
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)


def create_history(db: Session, task_id: int, old_status: str, new_status: str, changed_by: str):
    history = models.TaskHistory(
        task_id=task_id,
        old_status=old_status,
        new_status=new_status,
        changed_by=changed_by
    )
    db.add(history)
    db.commit()


@app.get("/")
def home():
    return {"message": "Task Management API is running"}


@app.post("/users", response_model=UserResponse)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(models.User).filter(models.User.email == user.email).first()

    if existing_user:
        raise HTTPException(status_code=400, detail="Email already exists")

    if user.role not in ["supervisor", "employee"]:
        raise HTTPException(status_code=400, detail="Role must be supervisor or employee")

    new_user = models.User(
        full_name=user.full_name,
        email=user.email,
        password=hash_password(user.password),
        role=user.role
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


@app.post("/login")
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == login_data.email).first()

    if not user or not verify_password(login_data.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    return {
        "message": "Login successful",
        "user_id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        "role": user.role
    }


@app.get("/employees", response_model=List[UserResponse])
def get_employees(db: Session = Depends(get_db)):
    return db.query(models.User).filter(models.User.role == "employee").all()


@app.post("/tasks", response_model=TaskResponse)
def create_task(
    title: str = Form(...),
    description: str = Form(...),
    employee_id: int = Form(...),
    file: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    employee = db.query(models.User).filter(
        models.User.id == employee_id,
        models.User.role == "employee"
    ).first()

    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    file_path = None

    if file:
        file_location = f"uploads/{file.filename}"
        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        file_path = file_location

    new_task = models.Task(
        title=title,
        description=description,
        employee_id=employee_id,
        status="Assigned",
        file_path=file_path
    )

    db.add(new_task)
    db.commit()
    db.refresh(new_task)

    create_history(db, new_task.id, "Created", "Assigned", "Supervisor")

    return new_task


@app.get("/tasks", response_model=List[TaskResponse])
def get_all_tasks(db: Session = Depends(get_db)):
    return db.query(models.Task).all()


@app.get("/tasks/employee/{employee_id}", response_model=List[TaskResponse])
def get_employee_tasks(employee_id: int, db: Session = Depends(get_db)):
    return db.query(models.Task).filter(models.Task.employee_id == employee_id).all()


@app.put("/tasks/{task_id}/status")
def update_task_status(
    task_id: int,
    status_data: StatusUpdate,
    db: Session = Depends(get_db)
):
    allowed_statuses = ["Assigned", "In Progress", "Resolved/Completed", "Done"]

    if status_data.status not in allowed_statuses:
        raise HTTPException(status_code=400, detail="Invalid status")

    task = db.query(models.Task).filter(models.Task.id == task_id).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    old_status = task.status

    valid_transitions = {
        "Assigned": ["In Progress"],
        "In Progress": ["Resolved/Completed"],
        "Resolved/Completed": ["Done"],
        "Done": []
    }

    if status_data.status not in valid_transitions.get(old_status, []):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid transition from {old_status} to {status_data.status}"
        )

    task.status = status_data.status
    db.commit()
    db.refresh(task)

    create_history(db, task.id, old_status, status_data.status, status_data.changed_by)

    return {
        "message": "Task status updated successfully",
        "task_id": task.id,
        "old_status": old_status,
        "new_status": task.status
    }


@app.get("/tasks/{task_id}/history")
def get_task_history(task_id: int, db: Session = Depends(get_db)):
    return db.query(models.TaskHistory).filter(models.TaskHistory.task_id == task_id).all()