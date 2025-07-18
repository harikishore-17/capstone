from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.dependencies import get_db
from app.services.auth_middleware import get_current_admin_user, get_current_user
from app.db_schema.tasks import Task
from app.db_schema.user import User
from app.models.task import TaskCreate, TaskUpdate, TaskSchema
from app.utils.audit_logs import log_action
from app.utils.notification_create import create_notification

router = APIRouter(prefix="/tasks", tags=["Tasks"])


@router.get("/me", response_model=list[TaskSchema])
def get_my_tasks(current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Task).filter(Task.assigned_to == current_user.id).order_by(Task.created_at.desc()).all()


@router.post("/create", response_model=TaskSchema)
def create_task(task: TaskCreate, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    assigned_to = db.query(User.id).filter(User.username == task.assigned_to).first()[0]
    new_task = Task(
        patient_id=task.patient_id,
        assigned_to=assigned_to,
        assigned_by=current_user.id,
        description=task.description,
        due_date=task.due_date
    )
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    create_notification(db,user_ids=[assigned_to],message="New Task assigned!")
    log_action(db,user_id=current_user.id,action="task_created",endpoint="/tasks/create",payload={"task":str(new_task)})
    return new_task


@router.patch("/{task_id}", response_model=TaskSchema)
def update_task(task_id: str, update: TaskUpdate, current_user=Depends(get_current_user),
                db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if task.assigned_to != current_user.id:
        raise HTTPException(status_code=403, detail="You can only update your own tasks")

    task.status = update.status
    db.commit()
    db.refresh(task)
    log_action(db,user_id=current_user.id,action="task_updated",endpoint=f"/tasks/{task_id}",payload={"status":update.status})
    return task
