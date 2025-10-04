import sys
import secrets
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from utilities.utilities import getDbConnection
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

def init_auth_tables():
    conn = getDbConnection()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS auth (
            id STRING PRIMARY KEY ,
            email STRING,
            password TEXT,
            active INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS token(
            key STRING,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            auth_id string,
            FOREIGN KEY (auth_id) REFERENCES auth (id) ON DELETE CASCADE
            )
    """)
    conn.commit()
    conn.close()

init_auth_tables()

class Auth(BaseModel):
    id: str
    password: str
    token: Optional[str]


@router.post("/login", status_code=200)
def login(auth: Auth):
    if doesUsernameMatchPass(auth):
        token = createToken(auth.id)
        return JSONResponse({"token": token}, 201)
    raise HTTPException(status_code=401, detail="Invalid credentials")
        

    

def doesUsernameMatchPass(auth: Auth):
    conn = getDbConnection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT password FROM auth WHERE id = ?", [auth.id])
        row = cursor.fetchone()
        if not row:
            return False
        return str(auth.password) == str(row[0])
    except Exception:
        type_, value, tb = sys.exc_info()
        raise HTTPException(status_code=500, detail=f"Error: {type_}\n{value}\n{tb}")
    finally:
        cursor.close()
        conn.close()

def createToken(auth_id: str):
    conn = getDbConnection()
    cursor = conn.cursor()
    try:
        token = secrets.token_hex(32)  # 256-bit secure token
        cursor.execute("INSERT INTO token (key, auth_id) VALUES (?, ?)", (token, auth_id))
        conn.commit()
        return token
    except Exception:
        type_, value, tb = sys.exc_info()
        raise HTTPException(status_code=500, detail=f"Error: {type_}\n{value}\n{tb}")
    finally:
        cursor.close()
        conn.close()


def compareToken(auth: Auth):
    conn = getDbConnection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT key FROM token WHERE auth_id = ?", [auth.id])
        row = cursor.fetchone()
        if not row:
            return False
        return str(auth.token) == str(row[0])
    except Exception:
        type_, value, tb = sys.exc_info()
        raise HTTPException(status_code=500, detail=f"Error: {type_}\n{value}\n{tb}")
    finally:
        cursor.close()
        conn.close()



        