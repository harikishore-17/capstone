from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models.user import User
from app.dependencies import get_db
from passlib.context import CryptContext
from app.schema.user import UserCreate,TokenResponse
from app.utils.jwt import create_access_token,decode_access_token
from app.services.auth_middleware import get_current_admin_user
from fastapi.security import OAuth2PasswordRequestForm

router = APIRouter(prefix="/auth", tags=["Auth"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

@router.post("/register")
def register_user(data:UserCreate , db: Session = Depends(get_db),current_user: User = Depends(get_current_admin_user)):
    user = db.query(User).filter_by(username=data.username).first()
    if user:
        raise HTTPException(status_code=400, detail="Username already exists")

    hashed_pw = pwd_context.hash(data.password)
    new_user = User(username=data.username, hashed_password=hashed_pw, role=data.role,email=data.email)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"id": new_user.id, "username": new_user.username}

@router.post("/login", response_model=TokenResponse)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not  pwd_context.verify(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    access_token = create_access_token(data={"sub": str(user.id), "role": user.role, "username": user.username})
    return {"access_token": access_token, "token_type": "bearer"}
