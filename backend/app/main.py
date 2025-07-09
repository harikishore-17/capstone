from fastapi import FastAPI,Request
from app.api import predict
from app.api import auth
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from app.utils.error_logger import log_error_to_db
from app.dependencies import get_db
import traceback

app = FastAPI()
app.include_router(predict.router)
app.include_router(auth.router)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # Manually get DB session
    try:
        db: Session = next(get_db())
        log_error_to_db(db, request.url.path, exc)
    except Exception as logging_error:
        print("Error while logging exception:", logging_error)
        print("Original exception:", traceback.format_exc())

    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal Server Error: {str(exc)}"}
    )