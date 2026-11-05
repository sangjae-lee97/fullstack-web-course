
from sqlalchemy import text

from common.db import engine
from chapter12.app.models import Member


TEST_SCHEMA = "chapter13_test"


def main():
    # 기존 ORM 모델이 기대한 테이블인지 확인
    if Member.__table__.schema != "practice":
        raise RuntimeError(
            "예상한 모델 Schema가 아닙니다."
        )

    if Member.__table__.name != "members":
        raise RuntimeError(
            "예상한 테이블 이름이 아닙니다."
        )

    with engine.begin() as conn:
        db_name = conn.execute(
            text("SELECT current_database()")
        ).scalar_one()

        print("현재 DB:", db_name)

        # 테스트 전용 Schema 생성
        conn.execute(
            text(
                "CREATE SCHEMA IF NOT EXISTS chapter13_test"
            )
        )

        # practice → chapter13_test 로 ORM Schema 변환
        test_conn = conn.execution_options(
            schema_translate_map={
                "practice": TEST_SCHEMA
            }
        )

        # 테스트용 members 테이블만 생성
        Member.__table__.create(
            bind=test_conn,
            checkfirst=True,
        )

        # 각 Schema의 회원 수 확인
        original_count = conn.execute(
            text("SELECT COUNT(*) FROM practice.members")
        ).scalar_one()

        test_count = conn.execute(
            text(
                "SELECT COUNT(*) "
                "FROM chapter13_test.members"
            )
        ).scalar_one()

        print("기존 회원 수:", original_count)
        print("테스트 회원 수:", test_count)
        print("테스트 Schema 준비: PASS")


if __name__ == "__main__":
    main()
