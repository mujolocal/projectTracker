from contextlib import asynccontextmanager
import sys
from fastapi import FastAPI, HTTPException, Depends, Body, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from routers import lists, tasks, auth
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
app.include_router(auth.router)

@app.middleware("http")
async def auth_middleware(request: Request, call_next):
    print(request.url.path)
    if request.url.path in ["/auth/login", "/auth/create"]:
        print("here")
        return await call_next(request)

    token = request.headers.get("Authorization")
    if not token or not compareToken(token):
        return JSONResponse({"detail": "Unauthorized"}, status_code=401)

    return await call_next(request)


def compareToken(token: str) -> bool:
    conn = getDbConnection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT auth_id FROM token WHERE key = ?", [token])
        row = cursor.fetchone()
        return bool(row)  # True if token exists, False otherwise
    except Exception:
        type_, value, tb = sys.exc_info()
        raise HTTPException(status_code=500, detail=f"Error: {type_}\n{value}\n{tb}")
    finally:
        cursor.close()
        conn.close()

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