from fastapi import APIRouter
from fastapi.responses import JSONResponse
from utilities.utilities import getDbConnection
from pydantic import BaseModel
from typing import  Optional
from fastapi import  HTTPException,  APIRouter

router = APIRouter()

def init_task_tables():
    conn = getDbConnection()
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

init_task_tables()


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

@router.get("/")
async def root():
    return {"message": "Task Tracker API"}

@router.get("/task")
async def getTasks():
    conn = getDbConnection()
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

@router.get("/task/{id}")
async def getTask(id:int):
    conn = None
    try:
        conn = getDbConnection()
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

@router.put("/task", status_code=201)
async def updateTask(taskUpdate: TaskUpdate):
    conn = getDbConnection()
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
        

    
@router.post("/task", status_code=201)
async def createTask(task:Task):
    if( task.recurranceType):
        addRecurringTask(task)
    else:
        addTask(task)
     
def addRecurringTask(task:Task):
    conn = getDbConnection()
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
    conn = getDbConnection()
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