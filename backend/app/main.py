from fastapi import FastAPI
from dotenv import load_dotenv
from app.api import predict
load_dotenv()

app = FastAPI()
app.include_router(predict.router)