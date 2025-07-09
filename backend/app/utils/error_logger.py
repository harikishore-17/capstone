import uuid
from datetime import datetime
import traceback

from app.db_schema.error_log import ErrorLog

def log_error_to_db(db, endpoint: str, exc: Exception):
    error = ErrorLog(
        id=uuid.uuid4(),
        endpoint=endpoint,
        error_message=str(exc),
        stack_trace=traceback.format_exc(),
        timestamp=datetime.utcnow()
    )
    db.add(error)
    db.commit()
