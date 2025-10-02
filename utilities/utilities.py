import sqlite3
DATABASE = "taskTracker.db"

def getDbConnection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn