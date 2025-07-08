from fastapi import FastAPI
from dotenv import load_dotenv
from app.api import predict
from app.api import auth
load_dotenv()

app = FastAPI()
app.include_router(predict.router)
app.include_router(auth.router)
