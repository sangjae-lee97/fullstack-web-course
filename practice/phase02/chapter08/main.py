
from fastapi import FastAPI, HTTPException
from psycopg.rows import dict_row

from common.db import get_connection
from chapter08.schemas import (
    MemberUpdate,
    MemberPatch,
    MemberResponse,
)


app = FastAPI(title="Chapter 08 - PUT/PATCH UPDATE")


# ==========================================
# GET: 회원 단건 조회
# ==========================================

@app.get("/members/{member_id}", response_model=MemberResponse)
def get_member(member_id: int):

    with get_connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:

            cur.execute(
                """
                SELECT member_id, name, email, age
                FROM practice.members
                WHERE member_id = %s
                """,
                (member_id,),
            )

            member = cur.fetchone()

            if member is None:
                raise HTTPException(
                    status_code=404,
                    detail="Member not found",
                )

            return member


# ==========================================
# PUT: 전체 수정
# ==========================================

@app.put("/members/{member_id}", response_model=MemberResponse)
def update_member(member_id: int, member: MemberUpdate):

    with get_connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:

            # 회원 존재 확인
            cur.execute(
                """
                SELECT member_id
                FROM practice.members
                WHERE member_id = %s
                """,
                (member_id,),
            )

            if cur.fetchone() is None:
                raise HTTPException(
                    status_code=404,
                    detail="Member not found",
                )

            # 이메일 중복 확인
            cur.execute(
                """
                SELECT member_id
                FROM practice.members
                WHERE email = %s AND member_id <> %s
                """,
                (str(member.email), member_id),
            )

            if cur.fetchone() is not None:
                raise HTTPException(
                    status_code=409,
                    detail="Email already exists",
                )

            # 전체 UPDATE
            cur.execute(
                """
                UPDATE practice.members
                SET name = %s,
                    email = %s,
                    age = %s
                WHERE member_id = %s
                RETURNING member_id, name, email, age
                """,
                (
                    member.name,
                    str(member.email),
                    member.age,
                    member_id,
                ),
            )

            updated = cur.fetchone()
            conn.commit()

            return updated


# ==========================================
# PATCH: 부분 수정
# ==========================================

@app.patch("/members/{member_id}", response_model=MemberResponse)
def patch_member(member_id: int, member: MemberPatch):

    changes = member.model_dump(exclude_unset=True)

    if not changes:
        raise HTTPException(
            status_code=400,
            detail="At least one field is required",
        )

    with get_connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:

            # 회원 존재 확인
            cur.execute(
                """
                SELECT member_id
                FROM practice.members
                WHERE member_id = %s
                """,
                (member_id,),
            )

            if cur.fetchone() is None:
                raise HTTPException(
                    status_code=404,
                    detail="Member not found",
                )

            # 이메일 중복 검사
            if "email" in changes:
                cur.execute(
                    """
                    SELECT member_id
                    FROM practice.members
                    WHERE email = %s AND member_id <> %s
                    """,
                    (str(changes["email"]), member_id),
                )

                if cur.fetchone() is not None:
                    raise HTTPException(
                        status_code=409,
                        detail="Email already exists",
                    )

            # 허용 컬럼 지정
            allowed_fields = {
                "name": "name",
                "email": "email",
                "age": "age",
            }

            set_parts = []
            values = []

            # 실제 전달된 필드만 UPDATE
            for field, value in changes.items():
                column = allowed_fields[field]
                set_parts.append(f"{column} = %s")
                values.append(
                    str(value) if field == "email" else value
                )

            values.append(member_id)

            sql = f"""
                UPDATE practice.members
                SET {', '.join(set_parts)}
                WHERE member_id = %s
                RETURNING member_id, name, email, age
            """

            cur.execute(sql, values)

            updated = cur.fetchone()
            conn.commit()

            return updated
