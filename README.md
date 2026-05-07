# Collaborative Task Management System

A simple full-stack collaborative task management system built using **FastAPI**, **PostgreSQL**, and **HTML/CSS/JavaScript**.

The system allows supervisors to create employees, assign tasks, upload supporting files, monitor progress, and confirm task completion. Employees can log in, view assigned tasks, access uploaded files, update task progress, and submit tasks for supervisor review.

This project was developed as a technical interview task to demonstrate practical full-stack development, API design, role-based access, database persistence, file handling, and frontend API consumption.

---

## Project Overview

Many organisations manage tasks informally through chats and spreadsheets, which can lead to poor visibility, lost assignments, and unclear progress tracking.

This system provides a centralized platform where supervisors and employees can collaborate around task assignment and completion.

The application supports two main user roles:

- **Supervisor**
- **Employee**

Each role has different access and permissions.

---

## Features

### Supervisor Features

- Login as supervisor
- Create employee accounts
- Create and assign tasks to employees
- Upload supporting files when assigning tasks
- View all tasks
- Monitor task progress
- Review tasks marked as resolved/completed
- Confirm final completion by marking tasks as done
- View notification-style alerts for tasks awaiting review

### Employee Features

- Login as employee
- View only assigned tasks
- View/download supporting files
- Start assigned tasks
- Mark tasks as resolved/completed
- Wait for supervisor confirmation
- View notification-style alerts for assigned tasks

---

## Task Workflow

Tasks move through a controlled workflow:

```text
Assigned → In Progress → Resolved/Completed → Done
```

The backend prevents invalid task status transitions. For example, a task cannot move directly from `Assigned` to `Done`.

---

## Tech Stack

### Backend

- Python
- FastAPI
- SQLAlchemy
- PostgreSQL
- Passlib password hashing
- Uvicorn
- Python multipart for file uploads

### Frontend

- HTML
- CSS
- JavaScript
- Fetch API
- Browser localStorage for simple session handling

### Tools Used

- VS Code
- Postman
- PostgreSQL / pgAdmin
- Git and GitHub

---

## Project Structure

```text
task-management-system/
│
├── main.py
├── database.py
├── models.py
├── schemas.py
├── requirements.txt
├── .env
├── uploads/
│
└── frontend/
    ├── login.html
    ├── supervisor.html
    ├── employee.html
    ├── style.css
    ├── login.js
    ├── supervisor.js
    └── employee.js
```

---

## File Descriptions

| File | Purpose |
|---|---|
| `main.py` | Contains FastAPI routes/endpoints and main application logic |
| `database.py` | Handles PostgreSQL database connection and sessions |
| `models.py` | Defines database tables using SQLAlchemy models |
| `schemas.py` | Validates request and response data using Pydantic |
| `.env` | Stores the database connection string |
| `requirements.txt` | Stores installed Python dependencies |
| `uploads/` | Stores uploaded supporting files |
| `frontend/login.html` | Login page |
| `frontend/supervisor.html` | Supervisor dashboard |
| `frontend/employee.html` | Employee dashboard |
| `frontend/login.js` | Handles login requests and redirects |
| `frontend/supervisor.js` | Handles supervisor actions and API calls |
| `frontend/employee.js` | Handles employee dashboard actions |
| `frontend/style.css` | Styles the frontend pages |

---

## Database Models

### User

Stores supervisor and employee accounts.

```text
id
full_name
email
password
role
```

### Task

Stores task information.

```text
id
title
description
status
file_path
created_at
employee_id
```

### TaskHistory

Stores task status change history.

```text
id
task_id
old_status
new_status
changed_by
changed_at
```

---

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/login` | Authenticates a user |

### Users

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/users` | Creates a supervisor or employee |
| `GET` | `/employees` | Retrieves all employees |

### Tasks

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/tasks` | Creates and assigns a task |
| `GET` | `/tasks` | Retrieves all tasks |
| `GET` | `/tasks/employee/{employee_id}` | Retrieves tasks assigned to one employee |
| `PUT` | `/tasks/{task_id}/status` | Updates task status |
| `GET` | `/tasks/{task_id}/history` | Retrieves task status history |

---

## How File Upload Works

Uploaded files are saved physically in the `uploads/` folder. The database does not store the actual file. Instead, it stores the file path.

Example:

```text
uploads/report.pdf
```

FastAPI serves uploaded files using `StaticFiles`, allowing the frontend to access them through a URL.

---

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/task-management-system.git
cd task-management-system
```

### 2. Create a Virtual Environment

```bash
python -m venv venv
```

Activate it:

#### Windows PowerShell

```bash
venv\Scripts\Activate
```

#### Git Bash

```bash
source venv/Scripts/activate
```

#### Linux/Mac

```bash
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Create PostgreSQL Database

Open PostgreSQL and create a database:

```sql
CREATE DATABASE task_management_db;
```

### 5. Create `.env` File

Create a `.env` file in the project root:

```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/task_management_db
```

Replace `your_password` with your actual PostgreSQL password.

### 6. Run the Backend

```bash
uvicorn main:app --reload
```

The backend will run on:

```text
http://127.0.0.1:8000
```

Open API documentation:

```text
http://127.0.0.1:8000/docs
```

---

## Running the Frontend

Open the `frontend` folder using VS Code Live Server.

Start with:

```text
frontend/login.html
```

Recommended URL format:

```text
http://127.0.0.1:5500/frontend/login.html
```

Avoid opening the HTML files directly using `file://` because browser storage and API requests may behave differently.

---

## Sample Test Users

You can create users using Postman or Swagger.

### Create Supervisor

Endpoint:

```text
POST /users
```

Body:

```json
{
  "full_name": "Mr Boris",
  "email": "boris@example.com",
  "password": "123456@fr",
  "role": "supervisor"
}
```

### Create Employee

Endpoint:

```text
POST /users
```

Body:

```json
{
  "full_name": "John Employee",
  "email": "john@example.com",
  "password": "123456@fr",
  "role": "employee"
}
```

---

## Sample Login Details

### Supervisor

```text
Email: boris@example.com
Password: 123456@fr
```

### Employee

```text
Email: john@example.com
Password: 123456@fr
```

---

## How to Use the System

### Supervisor Flow

1. Login as supervisor.
2. Create an employee.
3. Create and assign a task.
4. Upload a supporting file if needed.
5. View all tasks.
6. Wait for employee to mark task as resolved.
7. Confirm the task as done.

### Employee Flow

1. Login as employee.
2. View assigned tasks.
3. Open supporting file if available.
4. Start the task.
5. Mark the task as resolved/completed.
6. Wait for supervisor confirmation.

---

## Security Notes

This is an interview MVP, so authentication is simplified.

Current implementation:

- Passwords are hashed before being stored.
- Login checks user credentials.
- Frontend uses `localStorage` to remember the logged-in user.
- Frontend redirects users based on role.

Production improvements would include:

- JWT access tokens
- Refresh tokens
- Backend-enforced role-based authorization
- Password reset flow
- Stronger file validation
- File size limits
- Cloud storage for uploaded files
- Audit logs and activity tracking

---

## Important Note on localStorage

The frontend stores the currently logged-in user in browser `localStorage`.

This means if supervisor and employee accounts are opened in different tabs of the same browser, they may overwrite each other’s session data.

For testing different roles at the same time, use:

- Different browsers, or
- Normal window for one role and incognito window for another role

---

## Future Improvements

- Add JWT authentication
- Add backend middleware for role-based protection
- Add task comments
- Add email notifications
- Add due dates and priority levels
- Add supervisor-to-employee messaging
- Add better dashboard analytics
- Add file type and size validation
- Add search and filtering
- Add deployment support

---

## Author

Developed by **Emmanuel Mugambi** as a technical interview project for a Fullstack Developer role.

---

## Summary

This project demonstrates a practical full-stack task management system with authentication, role-based dashboards, task assignment, task tracking, file upload support, status workflow control, and persistent task history.

It is designed to be simple, understandable, and easy to extend into a more production-ready system.
