
from uuid import uuid4

from common.db import get_connection
from chapter07.queries import INSERT_MEMBER_SQL


email = f"chapter07_commit_{uuid4().hex[:10]}@example.com"

# 1. INSERT 실행
conn = get_connection()

try:
    with conn.cursor() as cursor:
        cursor.execute(
            INSERT_MEMBER_SQL,
            ("커밋테스트", email, 27)
        )

        created = cursor.fetchone()
        print("RETURNING 결과:", created)

    # 2. 변경 사항 확정
    conn.commit()
    print("COMMIT 완료: 회원 저장 확정")

except Exception:
    conn.rollback()
    print("오류 발생: ROLLBACK 실행")
    raise

finally:
    conn.close()


# 3. 새로운 DB 연결로 저장 여부 확인
verify_conn = get_connection()

try:
    with verify_conn.cursor() as cursor:
        cursor.execute(
            """
            SELECT member_id, name, email, age
            FROM practice.members
            WHERE email = %s
            """,
            (email,)
        )

        saved = cursor.fetchone()

    print("DB SELECT 결과:", saved)
    print("DB 저장 검증:", saved == created)

finally:
    verify_conn.close()
