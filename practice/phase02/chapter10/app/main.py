
from fastapi import FastAPI

from chapter10.app.routers import members


app = FastAPI()

app.include_router(members.router)
