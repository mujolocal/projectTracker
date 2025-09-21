from fastapi import FastAPI, HTTPException, Depends, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List, Optional
import sqlite3
import json
from datetime import datetime
import os

app = FastAPI(title="Task Tracker API")

# Enable CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database setup
DATABASE = "projects.db"

def init_db():
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    
    # Projects table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS project (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            date_started TEXT,
            date_complete TEXT,
            completion_status TEXT DEFAULT 'not_started',
            date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # tasks table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS task (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id INTEGER,
            name TEXT NOT NULL,
            description TEXT,
            start_date TEXT,
            end_date TEXT,
            status TEXT DEFAULT 'not_started',
            is_scheduled_task BOLLEAN DEFAULT 0 
        )
    """)
    
    # Updates table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS note (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            task_id INTEGER,
            body TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (task_id) REFERENCES task (id) ON DELETE CASCADE
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS occurances (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            day_of_week INTEGER,
            day_of_month INTEGER,
            hour_of_day INTEGER,
            task_id INTEGER,
            FOREIGN KEY (task_id) REFERENCES task (id) ON DELETE CASCADE
        )
    """)
    
    conn.commit()
    conn.close()

init_db()

class Task(BaseModel):
    project_id: Optional[int] = None
    name: str
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    description: Optional[str] = None
    status: str = "not_started"

class TaskUpdate(BaseModel):
    taskId: int
    status: str
    newNote: str

class Project(BaseModel):
    name: str
    date_created: str
    status: str = "not_started"
    description: str 
    tasks: List[Task] = []


class ProjectResponse(BaseModel):
    id: int
    name: str
    date_started: str
    completion_status: str
    tasks: List[Task] = []
    created_at: str
    updated_at: str

# Database connection helper
def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

# API Routes

@app.get("/")
async def root():
    return {"message": "Project Tracker API"}

@app.get("/independenttask")
async def getIndependentTasks():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT * FROM task WHERE project_id IS NULL AND status NOT IN ('cancelled', 'completed')
        ORDER BY 
            CASE 
                WHEN status = 'in_progress' THEN 1
                WHEN status = 'not_started' THEN 2
                WHEN status = 'on_hold' THEN 3
                ELSE 4
            END;""")
    tasks = [dict(task) for task in cursor.fetchall()]
    return tasks

@app.get("/task/{id}")
async def get_task(id:int):
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""SELECT task.id as id, task.name, task.description, task.start_date, task.status
                       FROM task 
                       WHERE  task.id=:id""",{"id":id})
        task = cursor.fetchone()
        columns = [col[0] for col in cursor.description]
        task_dict = dict(zip(columns, task))

        cursor.execute("""SELECT id, body, created_at, task_id
                       FROM note
                       WHERE task_id=:id
                       ORDER BY id DESC""",{"id":id})
        notes = [dict(row) for row in cursor.fetchall()]
        print(notes)
        task_dict['notes'] = notes
        print(task_dict)
        return JSONResponse(content=task_dict, status_code=200)
    except Exception as e:
        if conn != None:
            conn.rollback()
        return JSONResponse(content={"error": str(e)}, status_code=500)
    finally:
        if conn != None:
            conn.close()

@app.put("/task", status_code=201)
async def update_task(taskUpdate: TaskUpdate):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            UPDATE task SET status = ? WHERE id = ?;
        """, [taskUpdate.status, taskUpdate.taskId])
        if(taskUpdate.newNote):
            cursor.execute("""INSERT INTO note(task_id, body) 
                       VALUES(?,?)""",[taskUpdate.taskId, taskUpdate.newNote])
        conn.commit()

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Error: {e}")
    finally:
        cursor.close()
        conn.close()
        

    
@app.post("/task", status_code=201)
async def add_task(task:Task):
    if(task.project_id == None):
        addIndependentTask(task)
    return task 


def addIndependentTask(task:Task):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO task ( name, start_date, end_date, status, description)
            VALUES (?, ?, ?, ?, ?)
        """, (task.name, task.start_date, task.end_date, task.status, task.description))
        conn.commit()
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {e}")
    finally:
        cursor.close()
        conn.close()
        
@app.get("/schedule")
async def check_schedule():
    # get schedules
    # see which schedules are about to come up
    # get incomplete scheduled tasks
    # set Those tasks to failed
    # generate new recurring tasks
    pass



if os.path.exists("static"):
    app.mount("/", StaticFiles(directory="static", html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)