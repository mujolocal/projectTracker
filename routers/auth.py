import sys
import secrets
import bcrypt
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
import routers
from utilities.utilities import getDbConnection
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

def init_auth_tables():
    conn = getDbConnection()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS auth (
            name STRING PRIMARY KEY ,
            email STRING,
            password TEXT,
            active INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS token(
            key STRING,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            auth_id string,
            FOREIGN KEY (auth_id) REFERENCES auth (id) ON DELETE CASCADE
            )
    """)
    conn.commit()
    conn.close()

init_auth_tables()

class Auth(BaseModel):
    name: str
    password: str
    email: Optional[str]


@router.post("/auth/login", status_code=200)
def login(auth: Auth):
    if doesUsernameMatchPass(auth):
        token = getToken(auth.name)
        return JSONResponse({"token": token}, 201)
    raise HTTPException(status_code=401, detail="Invalid credentials")


@router.post("/auth/create", status_code=201)
def create(auth: Auth):
    conn = getDbConnection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT id FROM auth WHERE id = ?", [auth.id])
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="User already exists")

        # hash password before storing
        hashed_pw = bcrypt.hashpw(auth.password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

        cursor.execute(
            "INSERT INTO auth (id, email, password, active) VALUES (?, ?, ?, ?)",
            (auth.name, auth.email, hashed_pw, 1)
        )
        conn.commit()

        token = getToken(auth.name)
        return JSONResponse({"id": auth.name, "token": token}, 201)

    except HTTPException:
        raise
    except Exception:
        type_, value, tb = sys.exc_info()
        raise HTTPException(status_code=500, detail=f"Error: {type_}\n{value}\n{tb}")
    finally:
        cursor.close()
        conn.close()
    
        

    

def doesUsernameMatchPass(auth: Auth):
    conn = getDbConnection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT password FROM auth WHERE id = ?", [auth.name])
        row = cursor.fetchone()
        if not row:
            return False

        stored_hash = row[0]
        return bcrypt.checkpw(auth.password.encode("utf-8"), stored_hash.encode("utf-8"))

    except Exception:
        type_, value, tb = sys.exc_info()
        raise HTTPException(status_code=500, detail=f"Error: {type_}\n{value}\n{tb}")
    finally:
        cursor.close()
        conn.close()

def getToken(auth_id: str):
    conn = getDbConnection()
    cursor = conn.cursor()
    try:
        # check if token already exists
        cursor.execute("SELECT key FROM token WHERE auth_id = ?", [auth_id])
        row = cursor.fetchone()
        if row:
            return row[0]  # return existing token

        # otherwise, create a new token
        token = secrets.token_hex(32)
        cursor.execute("INSERT INTO token (key, auth_id) VALUES (?, ?)", (token, auth_id))
        conn.commit()
        return token

    except Exception:
        type_, value, tb = sys.exc_info()
        raise HTTPException(status_code=500, detail=f"Error: {type_}\n{value}\n{tb}")
    finally:
        cursor.close()
        conn.close()


# def compareToken(auth: Auth):
#     conn = getDbConnection()
#     cursor = conn.cursor()
#     try:
#         cursor.execute("SELECT key FROM token WHERE auth_id = ?", [auth.id])
#         row = cursor.fetchone()
#         if not row:
#             return False
#         return str(auth.token) == str(row[0])
#     except Exception:
#         type_, value, tb = sys.exc_info()
#         raise HTTPException(status_code=500, detail=f"Error: {type_}\n{value}\n{tb}")
#     finally:
#         cursor.close()
#         conn.close()