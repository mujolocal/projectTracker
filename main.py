from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Depends, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import  Optional
import sqlite3
import os
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger



scheduler = AsyncIOScheduler()

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("app started")
    trigger = CronTrigger(hour=2, minute=0) 
    scheduler.add_job(check_schedule, trigger)
    scheduler.start()
    yield
    scheduler.shutdown()
    print("the app has shutdown")


app = FastAPI(title="Task Tracker API", lifespan=lifespan)

# Enable CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database setup
DATABASE = "taskTracker.db"

def init_db():
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    
    # tasks table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS task (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id INTEGER,
            name TEXT NOT NULL,
            description TEXT,
            start_date TEXT,
            end_date TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            status TEXT DEFAULT 'not_started',
            recurrance_id INTEGER,
            is_recurrance_template INTEGER DEFAULT 0
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
        CREATE TABLE IF NOT EXISTS recurrance (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type STRING NOT NULL,
            createad_as TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
    recurranceType: Optional[str] = None


class TaskUpdate(BaseModel):
    taskId: int
    status: str
    newNote: str
    description: str



# Database connection helper
def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn


@app.get("/")
async def root():
    return {"message": "Task Tracker API"}

@app.get("/task")
async def getTasks():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT * FROM task 
        WHERE project_id IS NULL 
            AND status NOT IN ('cancelled', 'completed', 'failed')
            AND is_recurrance_template=0
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
        task_dict['notes'] = notes
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
    params = [taskUpdate.status]
    sql = "UPDATE task SET status = ?"
    if taskUpdate.description:
        sql += ", description = ?"
        params.append(taskUpdate.description)
    sql += " WHERE id = ?"
    params.append(str(taskUpdate.taskId))
    try:
        cursor.execute(sql, params)
        if(taskUpdate.newNote):
            cursor.execute("""INSERT INTO note(task_id, body) 
                       VALUES(?,?)""",[taskUpdate.taskId,  taskUpdate.newNote])
        conn.commit()

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Error: {e}")
    finally:
        cursor.close()
        conn.close()
        

    
@app.post("/task", status_code=201)
async def add_task(task:Task):
    if( task.recurranceType):
        addRecurringTask(task)
    else:
        addTask(task)
     
def addRecurringTask(task:Task):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # create recurrance reccord
        cursor.execute(
            """
                INSERT INTO recurrance(type)
                values(?);
            """, [task.recurranceType]) # type: ignore
        recurranceId = cursor.lastrowid
        # create recurrance template
        cursor.execute("""
            INSERT INTO task ( name, start_date, end_date, status, description,  recurrance_id, is_recurrance_template)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (task.name, task.start_date, task.end_date, "recurrance_template", task.description, recurranceId, 1))
        # create actual instance of task
        cursor.execute("""
            INSERT INTO task ( name, start_date, end_date, status, description, recurrance_id)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (task.name, task.start_date, task.end_date, task.status, task.description, recurranceId))
        conn.commit()
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {e}")
    finally:
        cursor.close()
        conn.close()

# recurrance_id INTEGER,
# recurrance_template INTEGER DEFAULT 0
def addTask(task:Task):
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
        

async def check_schedule():
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            UPDATE task
            SET status = 'failed'
            WHERE recurrance_id IS NOT NULL
                AND is_recurrance_template=0 
                AND status NOT IN ('cancelled', 'completed', 'failed')
                AND EXISTS (
                    SELECT 1 FROM recurrance
                        WHERE recurrance.id = task.recurrance_id
                            AND recurrance.type = 'daily');
                
        """)
        cursor.execute("""
            INSERT INTO task (name, description, recurrance_id)
            SELECT task.name, task.description, recurrance.id
            FROM task
            INNER JOIN recurrance ON task.recurrance_id = recurrance.id
            WHERE task.recurrance_id IS NOT NULL
                AND task.is_recurrance_template=1
                AND recurrance.type = 'daily';
        """)
        conn.commit()
    except Exception as e:
        conn.rollback()
    finally:
        conn.close()
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