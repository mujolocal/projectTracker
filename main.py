from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Depends, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from routers import lists, tasks
import sqlite3
import os
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

from utilities.utilities import DATABASE, getDbConnection

# lists.init_list_tables()
# tasks.init_task_tables()


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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(tasks.router)
app.include_router(lists.router)


async def check_schedule():
    conn = getDbConnection()
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
    pass



if os.path.exists("static"):
    app.mount("/", StaticFiles(directory="static", html=True), name="static")
    

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)