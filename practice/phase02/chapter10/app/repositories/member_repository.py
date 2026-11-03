
from psycopg.rows import dict_row

from chapter10.app.db import get_connection


def find_all():
    with get_connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute(
                """
                SELECT member_id, name, email, age
                FROM practice.members
                ORDER BY member_id
                """
            )
            return cur.fetchall()


def find_by_id(member_id: int):
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
            return cur.fetchone()


def exists_by_email(email: str, exclude_member_id: int | None = None):
    with get_connection() as conn:
        with conn.cursor() as cur:
            if exclude_member_id is None:
                cur.execute(
                    "SELECT 1 FROM practice.members WHERE email = %s",
                    (email,),
                )
            else:
                cur.execute(
                    """
                    SELECT 1
                    FROM practice.members
                    WHERE email = %s AND member_id <> %s
                    """,
                    (email, exclude_member_id),
                )
            return cur.fetchone() is not None


def create(data):
    with get_connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute(
                """
                INSERT INTO practice.members (name, email, age)
                VALUES (%s, %s, %s)
                RETURNING member_id, name, email, age
                """,
                (data.name, str(data.email), data.age),
            )
            created = cur.fetchone()
            conn.commit()
            return created
