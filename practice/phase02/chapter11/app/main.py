
from sqlalchemy import select

from common.db import SessionLocal
from chapter11.app.models import Member


def main():
    with SessionLocal() as session:

        # STEP 07: 전체 회원 조회
        stmt = select(Member).order_by(Member.member_id)
        members = session.scalars(stmt).all()

        print("\n=== 전체 회원 조회 ===")

        for member in members:
            print(
                member.member_id,
                member.name,
                member.email,
                member.age,
                member.joined_at,
            )

        print(f"\n총 회원 수: {len(members)}")

        # STEP 08: 특정 회원 조회
        stmt = select(Member).where(Member.member_id == 1)
        member = session.scalar(stmt)

        print("\n=== 특정 회원 조회 ===")

        if member is not None:
            print("회원 ID:", member.member_id)
            print("이름:", member.name)
            print("이메일:", member.email)
            print("나이:", member.age)
            print("가입일:", member.joined_at)
            print("객체 타입:", type(member).__name__)
        else:
            print("해당 회원이 존재하지 않습니다.")

        # STEP 09: 존재하지 않는 회원 조회
        stmt = select(Member).where(Member.member_id == 999999)
        missing_member = session.scalar(stmt)

        print("\n=== 존재하지 않는 회원 조회 ===")
        print("조회 결과:", missing_member)


if __name__ == "__main__":
    main()
