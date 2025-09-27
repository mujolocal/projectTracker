import sys
from fastapi import APIRouter
from fastapi.responses import JSONResponse
from utilities.utilities import getDbConnection
from pydantic import BaseModel
from typing import  List, Optional
from fastapi import  HTTPException,  APIRouter

router = APIRouter()

def init_list_tables():
    conn = getDbConnection()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS list_item_collection (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name STRING,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS list_item (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            list_collection_id INTEGER,
            name STRING,
            is_active int DEFAULT 1, 
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (list_collection_id) REFERENCES list_item_collection (id) ON DELETE CASCADE
        )
    """)
    conn.commit()
    conn.close()

init_list_tables()

class ListItem(BaseModel):
    list_item_collection_key: Optional[int]
    name: str



class ListItemCollection(BaseModel):
    name: str
    listItems: List[ListItem]

@router.post("/create_list", status_code=201)
def createList(list_item_collection:ListItemCollection):
    print(list_item_collection)
    conn = getDbConnection()
    cursor = conn.cursor()
    try:
        cursor.execute(""" INSERT INTO list_item_collection(name) VALUES(?)""",[list_item_collection.name])
        listItemCollectionKey = cursor.lastrowid
        if(list_item_collection.listItems):
            listItems = list_item_collection.listItems
            for listItem in listItems:
                cursor.execute("""INSERT INTO list_item(name, list_collection_id) VALUES(?,?)""",[listItem.name, listItemCollectionKey] )
        conn.commit()
    except Exception:
        type, value, traceback = sys.exc_info()
        raise HTTPException(status_code=500, detail=f"Error: {type} \n{value} \n{traceback}")
    finally:
        cursor.close()
        conn.close()
    
    
@router.get("/get_list",  status_code=200)
def getLists():
    conn = getDbConnection()
    cursor = conn.cursor()
    try:
        cursor.execute(""" SELECT list_item_collection.name as [list name], list_item_collection.id as [list id], list_item.name as [name], list_item.id as [id]  FROM list_item_collection LEFT JOIN list_item ON list_item_collection.id=list_item.list_collection_id """,)
        lists = [dict(row) for row in cursor.fetchall()]
        return JSONResponse(content=lists, status_code=200)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {e}")
    finally:
        cursor.close()
        conn.close()


        