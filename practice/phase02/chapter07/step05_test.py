
from uuid import uuid4

from common.db import get_connection
from chapter07.queries import INSERT_MEMBER_SQL


email = f"chapter07_{uuid4().hex[:12]}@example.com"

conn = get_connection()

try:
    with conn.cursor() as cursor:
        cursor.execute(
            INSERT_MEMBER_SQL,
            ("테스트회원", email, 27)
        )

        created = cursor.fetchone()
        print("RETURNING 결과:", created)

finally:
    conn.rollback()
    conn.close()
    print("ROLLBACK 완료: 테스트 INSERT 취소")
