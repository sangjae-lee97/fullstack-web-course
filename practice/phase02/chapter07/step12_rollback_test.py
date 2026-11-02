
from uuid import uuid4

import psycopg

from common.db import get_connection
from chapter07.queries import INSERT_MEMBER_SQL


email = f"rollback_{uuid4().hex[:10]}@example.com"

conn = get_connection()

try:
    with conn.cursor() as cursor:

        # 1. 정상 INSERT
        cursor.execute(
            INSERT_MEMBER_SQL,
            ("롤백테스트", email, 27)
        )

        created = cursor.fetchone()
        print("INSERT 성공:", created)

        # 2. 의도적인 SQL 오류
        cursor.execute("INVALID SQL FOR ROLLBACK TEST")

except psycopg.Error as error:
    print("DB 오류 발생:", type(error).__name__)

    # 3. 트랜잭션 취소
    conn.rollback()
    print("ROLLBACK 완료")

finally:
    conn.close()


# 4. 새 연결에서 DB 저장 여부 확인
verify_conn = get_connection()

try:
    with verify_conn.cursor() as cursor:
        cursor.execute(
            """
            SELECT COUNT(*)
            FROM practice.members
            WHERE email = %s
            """,
            (email,)
        )

        count = cursor.fetchone()[0]

    print("DB에 남은 회원 수:", count)

    assert count == 0, "ROLLBACK 검증 실패"
    print("ROLLBACK 검증: PASS")

finally:
    verify_conn.close()
