from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from backend.models import Member
from backend.schemas import (
    MemberCreate,
    MemberUpdate,
    MemberPatch,
)
from backend.repositories import member_repository


def get_members_service(db: Session) -> list[Member]:
    return member_repository.find_all(db)


def get_member_service(
    db: Session,
    member_id: int,
) -> Member:
    member = member_repository.find_by_id(db, member_id)

    if member is None:
        raise HTTPException(
            status_code=404,
            detail="Member not found",
        )

    return member


def _raise_unique_conflict(exc: IntegrityError) -> None:
    if getattr(exc.orig, "sqlstate", None) == "23505":
        raise HTTPException(
            status_code=409,
            detail="Email already exists",
        ) from exc

    raise exc


def create_member_service(
    db: Session,
    payload: MemberCreate,
) -> Member:
    existing = member_repository.find_by_email(
        db, str(payload.email)
    )

    if existing is not None:
        raise HTTPException(
            status_code=409,
            detail="Email already exists",
        )

    try:
        return member_repository.create_member(
            db,
            payload.name,
            str(payload.email),
            payload.age,
        )
    except IntegrityError as exc:
        _raise_unique_conflict(exc)
        raise


def update_member_service(
    db: Session,
    member_id: int,
    payload: MemberUpdate,
) -> Member:
    member = get_member_service(db, member_id)

    if member.email != str(payload.email):
        existing = member_repository.find_by_email(
            db, str(payload.email)
        )

        if existing is not None:
            raise HTTPException(
                status_code=409,
                detail="Email already exists",
            )

    try:
        return member_repository.update_member(
            db, member, payload
        )
    except IntegrityError as exc:
        _raise_unique_conflict(exc)
        raise


def patch_member_service(
    db: Session,
    member_id: int,
    payload: MemberPatch,
) -> Member:
    changes = payload.model_dump(exclude_unset=True)

    if not changes:
        raise HTTPException(
            status_code=400,
            detail="At least one field is required",
        )

    member = get_member_service(db, member_id)

    if "email" in changes:
        new_email = str(changes["email"])

        if member.email != new_email:
            existing = member_repository.find_by_email(
                db, new_email
            )

            if existing is not None:
                raise HTTPException(
                    status_code=409,
                    detail="Email already exists",
                )

    try:
        return member_repository.patch_member(
            db, member, payload
        )
    except IntegrityError as exc:
        _raise_unique_conflict(exc)
        raise


def delete_member_service(
    db: Session,
    member_id: int,
) -> None:
    member = get_member_service(db, member_id)

    member_repository.delete_member(db, member)