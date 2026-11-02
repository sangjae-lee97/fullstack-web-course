
import logging

import psycopg
from fastapi import APIRouter, HTTPException

from common.db import get_connection
from chapter07.schemas import MemberCreate, MemberCreatedResponse
from chapter07.queries import INSERT_MEMBER_SQL


router = APIRouter()


@router.post(
    "/members",
    response_model=MemberCreatedResponse,
    status_code=201
)
def create_member(member: MemberCreate):
    conn = None

    try:
        # 1. DB 연결
        conn = get_connection()

        with conn.cursor() as cursor:

            # 2. 이메일 중복 검사
            cursor.execute(
                """
                SELECT 1
                FROM practice.members
                WHERE email = %s
                LIMIT 1
                """,
                (str(member.email),)
            )

            if cursor.fetchone():
                raise HTTPException(
                    status_code=409,
                    detail="이미 등록된 이메일입니다."
                )

            # 3. 회원 INSERT
            cursor.execute(
                INSERT_MEMBER_SQL,
                (
                    member.name,
                    str(member.email),
                    member.age
                )
            )

            # 4. 생성된 회원 정보 받기
            row = cursor.fetchone()

        # 5. DB 변경 확정
        conn.commit()

        # 6. 생성 결과 반환
        return MemberCreatedResponse(
            id=row[0],
            name=row[1],
            email=row[2],
            age=row[3]
        )

    except HTTPException:
        if conn is not None:
            conn.rollback()
        raise

    except psycopg.errors.UniqueViolation:
        if conn is not None:
            conn.rollback()
        raise HTTPException(
            status_code=409,
            detail="이미 등록된 이메일입니다."
        )

    except Exception:
        if conn is not None:
            conn.rollback()

        logging.exception("회원 등록 중 DB 오류")

        raise HTTPException(
            status_code=500,
            detail="회원 등록 중 오류가 발생했습니다."
        )

    finally:
        if conn is not None:
            conn.close()
