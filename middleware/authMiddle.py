from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from utilities.utilities import getDbConnection

class AuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        path = request.url.path.lower()

        # Skip auth for login and create-user routes
        if path in ["/auth/login", "/auth/create"] or request.method == "OPTIONS":
            return await call_next(request)


        username = request.headers.get("username")
        token = request.headers.get("token")

        if not username or not token:
            return JSONResponse(status_code=401, content={"detail": "Missing credentials"})
        conn = getDbConnection()
        cursor = conn.cursor()

        try:
            
            cursor.execute("SELECT key FROM token WHERE auth_id=?", [username])
            result = cursor.fetchone()
        except Exception:
            return JSONResponse(status_code=500, content={"detail": "Database error"})
        finally:
            conn.close()

        # Check that token exists and matches
        if not result or result[0] != token:
            return JSONResponse(status_code=403, content={"detail": "Invalid or mismatched token"})

        response = await call_next(request)
        return response
