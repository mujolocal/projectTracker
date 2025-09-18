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
            status TEXT DEFAULT 'not_started'
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
            hour_of_day INTEGER
            int task_id ,
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
    description: str
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
        cursor.execute("""SELECT task.id as id, task.name, task.description, task.start_date
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
    else:
        addProjectTask(task)
    
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
        
        


def addProjectTask(task:Task):
    project_id = task.project_id
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT id FROM projects WHERE id = ?", (project_id,))
        if not cursor.fetchone():
            conn.close()
            raise HTTPException(status_code=404, detail="Project not found")
        
        cursor.execute("""
            INSERT INTO task (project_id, name, start_date, end_date, status)
            VALUES (?, ?, ?, ?, ?)
        """, (project_id, task.name, task.start_date, task.end_date, task.status))
        conn.commit()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {e}")
    finally:
        cursor.close()
        conn.close()
        


@app.get("/projects")
async def get_projects():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM project ORDER BY date_started DESC")
    projects = cursor.fetchall()
    
    result = []
    for project in projects:
        project_dict = dict(project)
        cursor.execute("SELECT * FROM task WHERE project_id = ?", (project['id'],))
        tasks = [dict(task) for task in cursor.fetchall()]
        updates = []
        
        project_dict['tasks'] = tasks
        project_dict['updates'] = updates
        result.append(project_dict)
    cursor.close()
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
    cursor.close()
    return project_dict


@app.post("/orchestrateProjects")
async def orchestrate_project(project:Project):
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