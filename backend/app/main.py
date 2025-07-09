from datetime import datetime

from fastapi import FastAPI,Request, Depends
from app.api import predict,auth,patients
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from app.utils.error_logger import log_error_to_db
from app.dependencies import get_db
import traceback
from app.db_schema.patient_related import FollowUp

app = FastAPI()
app.include_router(predict.router)
app.include_router(auth.router)
app.include_router(patients.router)

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
@app.patch("/internal/update-missed-followups")
def update_missed_followups(
    db: Session = Depends(get_db),
):
    updated = (
        db.query(FollowUp)
        .filter(FollowUp.status == "upcoming", FollowUp.follow_up_date < datetime.utcnow())
        .update({FollowUp.status: "pending"})
    )
    db.commit()
    return {"updated_rows": updated}
