
import logging

from fastapi import Depends, FastAPI, HTTPException, status
from sqlalchemy.orm import Session

from common.db import SessionLocal
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

app = FastAPI(title="Chapter 13 - Error Handling & Logging")


# ============================================
# 3. 공통 DB Session
# ============================================

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ============================================
# 4. 회원 상세 조회
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
# 5. 회원 생성
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
