
from fastapi import FastAPI

from chapter07.member_create import router as member_create_router


app = FastAPI(
    title="Chapter 07 - Member API",
    description="POST /members + INSERT + Transaction",
    version="1.0.0"
)

# 회원 생성 API 등록
app.include_router(member_create_router)
