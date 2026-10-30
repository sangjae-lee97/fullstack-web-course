import os
import psycopg
from dotenv import load_dotenv

# 환경변수 로드
load_dotenv()

# PostgreSQL 연결 정보
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")


# PostgreSQL 연결 함수
def get_connection():
    return psycopg.connect(
        host=DB_HOST,
        port=DB_PORT,
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
    )


# Database와 Schema 확인
def check_connection():
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT current_database(), current_schema();"
            )
            return cur.fetchone()


# 회원 목록 조회
def fetch_members():
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT * FROM practice.members LIMIT 5;"
            )

            # 컬럼 이름 가져오기
            columns = [col.name for col in cur.description]

            # 회원 데이터 가져오기
            rows = cur.fetchall()

            return columns, rows