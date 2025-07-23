from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db_schema.user import User
from app.dependencies import get_db
from passlib.context import CryptContext
from app.models.user import UserCreate,TokenResponse,UserPasswordChange
from app.utils.audit_logs import log_action
from app.utils.jwt import create_access_token
from app.services.auth_middleware import get_current_admin_user,get_current_user
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm.attributes import flag_modified

router = APIRouter(prefix="/auth", tags=["Auth"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

@router.post("/register")
def register_user(data:UserCreate , db: Session = Depends(get_db),current_user: User = Depends(get_current_admin_user)):
    user = db.query(User).filter_by(username=data.username).first()
    if user:
        raise HTTPException(status_code=400, detail="Username already exists")

    hashed_pw = pwd_context.hash(data.password)
    new_user = User(username=data.username, hashed_password=hashed_pw, role=data.role,email=data.email,must_change_password=True)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    log_action(db,user_id=new_user.id,action="user_registered",endpoint="/auth/register",payload={"username": new_user.username})
    return {"id": new_user.id, "username": new_user.username}

@router.post("/login", response_model=TokenResponse)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not  pwd_context.verify(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    log_action(db, user_id=user.id, action="login_success", endpoint="/auth/login",
               payload={"username": user.username})
    access_token = create_access_token(data={"sub": str(user.id), "role": user.role, "username": user.username,'must_change_password':user.must_change_password})
    return {"access_token": access_token, "token_type": "bearer"}

@router.put('/changePassword')
def change_password(payload:UserPasswordChange,db:Session = Depends(get_db),current_user:User = Depends(get_current_user)):
    user = db.query(User).filter(User.id == current_user.id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found in session.")

    if not pwd_context.verify(payload.oldPassword, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect current password")
    user.hashed_password = pwd_context.hash(payload.newPassword)
    user.must_change_password = False
    db.commit()
    db.refresh(user)

    return {"message": "Password updated successfully!"}


@router.post("/delete")
def delete_user(request: dict, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can delete users.")

    username = request.get("username")
    user = db.query(User).filter(User.username == username).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    db.delete(user)
    db.commit()
    log_action(db,current_user.id,action="user deleted",endpoint="/auth/delete",payload={"deleted user":str(user)});
    return {"message": f"User '{username}' deleted successfully."}
