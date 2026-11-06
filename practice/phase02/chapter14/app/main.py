
import logging

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from sqlalchemy.orm import Session

from common.db import SessionLocal
from chapter12.app.models import Member
from chapter12.app.schemas import MemberCreate
from chapter12.app.repositories import member_repository
from chapter12.app.services.member_service import (
    create_member_service,
)


# ============================================
# 1. Logging 설정
# ============================================

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

if not logger.handlers:
    handler = logging.StreamHandler()
    handler.setFormatter(
        logging.Formatter(
            "%(asctime)s %(levelname)s %(name)s %(message)s"
        )
    )
    logger.addHandler(handler)

logger.propagate = False


# ============================================
# 2. FastAPI 앱 생성
# ============================================

app = FastAPI(title="Chapter 14 - Frontend & CORS")


# ============================================
# 3. CORS Middleware 설정 (Chapter 14)
# ============================================

allowed_origins = [
    "http://localhost:5500",
    "http://127.0.0.1:5500",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================
# 4. 공통 DB Session
# ============================================

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ============================================
# 5. 전체 회원 목록 조회
# ============================================

@app.get("/members")
def get_members(
    db: Session = Depends(get_db),
):
    logger.info("member list lookup started")

    members = db.scalars(
        select(Member).order_by(Member.member_id)
    ).all()

    logger.info(
        "member list lookup success: count=%s",
        len(members),
    )

    return [
        {
            "member_id": member.member_id,
            "name": member.name,
            "email": member.email,
            "age": member.age,
        }
        for member in members
    ]


# ============================================
# 6. 회원 상세 조회
# ============================================

@app.get("/members/{member_id}")
def get_member(
    member_id: int,
    db: Session = Depends(get_db),
):
    logger.info(
        "member lookup started: member_id=%s",
        member_id,
    )

    member = member_repository.find_by_id(
        db, member_id
    )

    if member is None:
        logger.warning(
            "member not found: member_id=%s",
            member_id,
        )

        raise HTTPException(
            status_code=404,
            detail="Member not found",
        )

    logger.info(
        "member lookup success: member_id=%s",
        member_id,
    )

    return {
        "member_id": member.member_id,
        "name": member.name,
        "email": member.email,
        "age": member.age,
    }


# ============================================
# 7. 회원 생성
# ============================================

@app.post(
    "/members",
    status_code=status.HTTP_201_CREATED,
)
def create_member(
    payload: MemberCreate,
    db: Session = Depends(get_db),
):
    logger.info("member creation started")

    try:
        member = create_member_service(
            db, payload
        )

    except HTTPException as e:
        if e.status_code == 409:
            logger.warning(
                "duplicate email detected"
            )
        raise

    except Exception:
        logger.exception(
            "unexpected error while creating member"
        )
        raise

    logger.info(
        "member created: member_id=%s",
        member.member_id,
    )

    return {
        "member_id": member.member_id,
        "name": member.name,
        "email": member.email,
        "age": member.age,
    }
