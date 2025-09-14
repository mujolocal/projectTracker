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

app = FastAPI(title="Project Tracker API")

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
            occurances_id INTEGER
        )
    """)
    
    # Updates table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS project_update (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id INTEGER,
            note TEXT NOT NULL,
            date TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS occurances (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            day_of_week INTEGER,
            day_of_month INTEGER,
            hour_of_day INTEGER
        )
    """)
    
    conn.commit()
    conn.close()

# Initialize database on startup
init_db()

# Pydantic models
class Task(BaseModel):
    name: str
    start_date: Optional[str] = None
    description: str
    status: str = "not_started"

class Update(BaseModel):
    note: str
    date: str

class Project(BaseModel):
    name: str
    date_created: str
    status: str = "not_started"
    description: str 
    tasks: List[Task] = []
    updates: List[Update] = []

class ProjectResponse(BaseModel):
    id: int
    name: str
    date_started: str
    completion_status: str
    tasks: List[Task] = []
    updates: List[Update] = []
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

@app.get("/projects", response_model=List[ProjectResponse])
async def get_projects():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Get all projects
    cursor.execute("SELECT * FROM projects ORDER BY updated_at DESC")
    projects = cursor.fetchall()
    
    result = []
    for project in projects:
        project_dict = dict(project)
        
        # Get tasks for this project
        cursor.execute("SELECT * FROM tasks WHERE project_id = ?", (project['id'],))
        tasks = [dict(task) for task in cursor.fetchall()]
        
        # Get updates for this project
        cursor.execute("SELECT * FROM updates WHERE project_id = ? ORDER BY date DESC", (project['id'],))
        updates = [dict(update) for update in cursor.fetchall()]
        
        project_dict['tasks'] = tasks
        project_dict['updates'] = updates
        result.append(project_dict)
    
    conn.close()
    return result

@app.get("/projects/{project_id}", response_model=ProjectResponse)
async def get_project(project_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Get project
    cursor.execute("SELECT * FROM projects WHERE id = ?", (project_id,))
    project = cursor.fetchone()
    
    if not project:
        conn.close()
        raise HTTPException(status_code=404, detail="Project not found")
    
    project_dict = dict(project)
    
    # Get tasks
    cursor.execute("SELECT * FROM tasks WHERE project_id = ?", (project_id,))
    tasks = [dict(task) for task in cursor.fetchall()]
    
    # Get updates
    cursor.execute("SELECT * FROM updates WHERE project_id = ? ORDER BY date DESC", (project_id,))
    updates = [dict(update) for update in cursor.fetchall()]
    
    project_dict['tasks'] = tasks
    project_dict['updates'] = updates
    
    conn.close()
    return project_dict


@app.post("/orchestrateProjects")
async def orchestrate_project(project:Project):
    print(project)
    updates = project.updates
    tasks = project.tasks
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
                       INSERT INTO project(name,  completion_status, description) 
                       VALUES(:name, :completion_status, :description)
                       """
                       ,{'name':project.name, "completion_status":project.status, "description":project.description})
        project_id = cursor.lastrowid
        for task in tasks:
            cursor.execute("INSERT INTO task(name,start_date,status,description, project_id) VALUES(:name,:start_date,:status,:description, :project_id)"
                           , {"name":task.name,"start_date":task.start_date,"status":task.status,"description":task.description, "project_id":project_id})
        conn.commit()
        return JSONResponse(content={"message": "Item created"}, status_code=201)
    except Exception as e:
        if conn != None:
            conn.rollback()
        return JSONResponse(content={"error": str(e)}, status_code=500)
    finally:
        if conn != None:
            conn.close()
    
            

    # cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    # tables = cursor.fetchall()
    # for table in tables:
    #     print(table['name'])
    # create project
    # get project id
    # add tasks
    # add updates
    # rollback all on failure
    # return 201 on success
    pass


# @app.post("/projects", response_model=ProjectResponse)
# async def create_project(project: Project):
#     conn = get_db_connection()
#     cursor = conn.cursor()
    
#     cursor.execute("""
#         INSERT INTO projects (name, date_started, completion_status)
#         VALUES (?, ?, ?)
#     """, (project.name, project.date_started, project.status))
    
#     project_id = cursor.lastrowid
#     conn.commit()
    
#     # Get the created project
#     cursor.execute("SELECT * FROM projects WHERE id = ?", (project_id,))
#     created_project = cursor.fetchone()
    
#     result = dict(created_project)
#     result['tasks'] = []
#     result['updates'] = []
    
#     conn.close()
#     return result

# @app.put("/projects/{project_id}", response_model=ProjectResponse)
# async def update_project(project_id: int, project: Project):
#     conn = get_db_connection()
#     cursor = conn.cursor()
    
#     cursor.execute("""
#         UPDATE projects 
#         SET name = ?, date_started = ?, completion_status = ?, updated_at = CURRENT_TIMESTAMP
#         WHERE id = ?
#     """, (project.name, project.date_started, project.status, project_id))
    
#     if cursor.rowcount == 0:
#         conn.close()
#         raise HTTPException(status_code=404, detail="Project not found")
    
#     conn.commit()
#     conn.close()
    
#     # Return updated project
#     return await get_project(project_id)

# @app.delete("/projects/{project_id}")
# async def delete_project(project_id: int):
#     conn = get_db_connection()
#     cursor = conn.cursor()
    
#     cursor.execute("DELETE FROM projects WHERE id = ?", (project_id,))
    
#     if cursor.rowcount == 0:
#         conn.close()
#         raise HTTPException(status_code=404, detail="Project not found")
    
#     conn.commit()
#     conn.close()
    
#     return {"message": "Project deleted successfully"}

# task routes
# @app.post("/projects/{project_id}/tasks")
# async def add_task(project_id: int, task: task):
#     conn = get_db_connection()
#     cursor = conn.cursor()
    
#     # Check if project exists
#     cursor.execute("SELECT id FROM projects WHERE id = ?", (project_id,))
#     if not cursor.fetchone():
#         conn.close()
#         raise HTTPException(status_code=404, detail="Project not found")
    
#     cursor.execute("""
#         INSERT INTO tasks (project_id, name, start_date, end_date, status)
#         VALUES (?, ?, ?, ?, ?)
#     """, (project_id, task.name, task.start_date, task.end_date, task.status))
    
#     task_id = cursor.lastrowid
#     conn.commit()
#     conn.close()
    
#     return {"id": task_id, "message": "task added successfully"}

# @app.put("/projects/{project_id}/tasks/{task_id}")
# async def update_task(project_id: int, task_id: int, task: task):
#     conn = get_db_connection()
#     cursor = conn.cursor()
    
#     cursor.execute("""
#         UPDATE tasks 
#         SET name = ?, start_date = ?, end_date = ?, status = ?
#         WHERE id = ? AND project_id = ?
#     """, (task.name, task.start_date, task.end_date, task.status, task_id, project_id))
    
#     if cursor.rowcount == 0:
#         conn.close()
#         raise HTTPException(status_code=404, detail="task not found")
    
#     conn.commit()
#     conn.close()
    
#     return {"message": "task updated successfully"}

# @app.delete("/projects/{project_id}/tasks/{task_id}")
# async def delete_task(project_id: int, task_id: int):
#     conn = get_db_connection()
#     cursor = conn.cursor()
    
#     cursor.execute("DELETE FROM tasks WHERE id = ? AND project_id = ?", (task_id, project_id))
    
#     if cursor.rowcount == 0:
#         conn.close()
#         raise HTTPException(status_code=404, detail="task not found")
    
#     conn.commit()
#     conn.close()
    
#     return {"message": "task deleted successfully"}

# Update routes
# @app.post("/projects/{project_id}/updates")
# async def add_update(project_id: int, update: Update):
#     conn = get_db_connection()
#     cursor = conn.cursor()
    
#     # Check if project exists
#     cursor.execute("SELECT id FROM projects WHERE id = ?", (project_id,))
#     if not cursor.fetchone():
#         conn.close()
#         raise HTTPException(status_code=404, detail="Project not found")
    
#     cursor.execute("""
#         INSERT INTO updates (project_id, note, date)
#         VALUES (?, ?, ?)
#     """, (project_id, update.note, update.date))
    
#     update_id = cursor.lastrowid
#     conn.commit()
#     conn.close()
    
#     return {"id": update_id, "message": "Update added successfully"}

# @app.delete("/projects/{project_id}/updates/{update_id}")
# async def delete_update(project_id: int, update_id: int):
#     conn = get_db_connection()
#     cursor = conn.cursor()
    
#     cursor.execute("DELETE FROM updates WHERE id = ? AND project_id = ?", (update_id, project_id))
    
#     if cursor.rowcount == 0:
#         conn.close()
#         raise HTTPException(status_code=404, detail="Update not found")
    
#     conn.commit()
#     conn.close()
    
#     return {"message": "Update deleted successfully"}

# Serve static files
if os.path.exists("static"):
    app.mount("/", StaticFiles(directory="static", html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)