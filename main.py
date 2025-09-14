from fastapi import FastAPI, HTTPException, Depends, Body
from fastapi.middleware.cors import CORSMiddleware
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
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Features table
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
class Feature(BaseModel):
    id: Optional[int] = None
    name: str
    start_date: Optional[str] = None
    description: str
    status: str = "not_started"

class Update(BaseModel):
    id: Optional[int] = None
    note: str
    date: str

class Project(BaseModel):
    name: str
    date_created: str
    status: str = "not_started"
    description: str 
    features: List[Feature] = []
    updates: List[Update] = []

class ProjectResponse(BaseModel):
    id: int
    name: str
    date_started: str
    completion_status: str
    features: List[Feature] = []
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
        
        # Get features for this project
        cursor.execute("SELECT * FROM features WHERE project_id = ?", (project['id'],))
        features = [dict(feature) for feature in cursor.fetchall()]
        
        # Get updates for this project
        cursor.execute("SELECT * FROM updates WHERE project_id = ? ORDER BY date DESC", (project['id'],))
        updates = [dict(update) for update in cursor.fetchall()]
        
        project_dict['features'] = features
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
    
    # Get features
    cursor.execute("SELECT * FROM features WHERE project_id = ?", (project_id,))
    features = [dict(feature) for feature in cursor.fetchall()]
    
    # Get updates
    cursor.execute("SELECT * FROM updates WHERE project_id = ? ORDER BY date DESC", (project_id,))
    updates = [dict(update) for update in cursor.fetchall()]
    
    project_dict['features'] = features
    project_dict['updates'] = updates
    
    conn.close()
    return project_dict


@app.post("/orchestrateProjects")
async def orchestrate_project(project:Project):
    print(project)
    updates = project.updates
    features = project.features
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(""""
                       INSERT INTO project(name, date_created, status, description) 
                       VALUES(:name, :date_created, :status, :description)
                       """
                       ,{'name':project.name,"date_create":project.date_created, "status":project.status, "description":project.description})
        project_id = cursor.lastrowid
        for feature in features:
            cursor.execute("INSERT INTO feature(name,start_date,status,description, project_id) VALUES(:name,:start_date,:status,:description, :project_id)"
                           , {"name":feature.name,"start_date":feature.start_date,"status":feature.status,"description":feature.description, "project_id":project_id})
        conn.commit()
    except:
        if conn != None:
            conn.rollback()
    finally:
        if conn != None:
            conn.close()
            

    # cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    # tables = cursor.fetchall()
    # for table in tables:
    #     print(table['name'])
    # create project
    # get project id
    # add features
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
#     result['features'] = []
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

# Feature routes
# @app.post("/projects/{project_id}/features")
# async def add_feature(project_id: int, feature: Feature):
#     conn = get_db_connection()
#     cursor = conn.cursor()
    
#     # Check if project exists
#     cursor.execute("SELECT id FROM projects WHERE id = ?", (project_id,))
#     if not cursor.fetchone():
#         conn.close()
#         raise HTTPException(status_code=404, detail="Project not found")
    
#     cursor.execute("""
#         INSERT INTO features (project_id, name, start_date, end_date, status)
#         VALUES (?, ?, ?, ?, ?)
#     """, (project_id, feature.name, feature.start_date, feature.end_date, feature.status))
    
#     feature_id = cursor.lastrowid
#     conn.commit()
#     conn.close()
    
#     return {"id": feature_id, "message": "Feature added successfully"}

# @app.put("/projects/{project_id}/features/{feature_id}")
# async def update_feature(project_id: int, feature_id: int, feature: Feature):
#     conn = get_db_connection()
#     cursor = conn.cursor()
    
#     cursor.execute("""
#         UPDATE features 
#         SET name = ?, start_date = ?, end_date = ?, status = ?
#         WHERE id = ? AND project_id = ?
#     """, (feature.name, feature.start_date, feature.end_date, feature.status, feature_id, project_id))
    
#     if cursor.rowcount == 0:
#         conn.close()
#         raise HTTPException(status_code=404, detail="Feature not found")
    
#     conn.commit()
#     conn.close()
    
#     return {"message": "Feature updated successfully"}

# @app.delete("/projects/{project_id}/features/{feature_id}")
# async def delete_feature(project_id: int, feature_id: int):
#     conn = get_db_connection()
#     cursor = conn.cursor()
    
#     cursor.execute("DELETE FROM features WHERE id = ? AND project_id = ?", (feature_id, project_id))
    
#     if cursor.rowcount == 0:
#         conn.close()
#         raise HTTPException(status_code=404, detail="Feature not found")
    
#     conn.commit()
#     conn.close()
    
#     return {"message": "Feature deleted successfully"}

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