from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.models import Member
from backend.schemas import MemberUpdate, MemberPatch


def find_all(db: Session) -> list[Member]:
    stmt = select(Member).order_by(Member.member_id)
    return list(db.scalars(stmt).all())


def find_by_id(
    db: Session,
    member_id: int,
) -> Member | None:
    return db.get(Member, member_id)


def find_by_email(
    db: Session,
    email: str,
) -> Member | None:
    stmt = select(Member).where(Member.email == email)
    return db.scalar(stmt)


def create_member(
    db: Session,
    name: str,
    email: str,
    age: int,
) -> Member:
    member = Member(
        name=name,
        email=email,
        age=age,
    )

    try:
        db.add(member)
        db.commit()
        db.refresh(member)
        return member
    except Exception:
        db.rollback()
        raise


def update_member(
    db: Session,
    member: Member,
    payload: MemberUpdate,
) -> Member:
    member.name = payload.name
    member.email = str(payload.email)
    member.age = payload.age

    try:
        db.commit()
        db.refresh(member)
        return member
    except Exception:
        db.rollback()
        raise


def patch_member(
    db: Session,
    member: Member,
    payload: MemberPatch,
) -> Member:
    changes = payload.model_dump(exclude_unset=True)

    for field, value in changes.items():
        setattr(member, field, value)

    try:
        db.commit()
        db.refresh(member)
        return member
    except Exception:
        db.rollback()
        raise


def delete_member(
    db: Session,
    member: Member,
) -> None:
    try:
        db.delete(member)
        db.commit()
    except Exception:
        db.rollback()
        raise