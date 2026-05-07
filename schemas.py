from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    role: str


class UserResponse(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    role: str

    class Config:
        from_attributes = True


class TaskCreate(BaseModel):
    title: str
    description: str
    employee_id: int


class TaskResponse(BaseModel):
    id: int
    title: str
    description: str
    status: str
    file_path: Optional[str]
    employee_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class StatusUpdate(BaseModel):
    status: str
    changed_by: str