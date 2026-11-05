
from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from chapter12.app.models import Member
from chapter12.app.schemas import (
    MemberCreate,
    MemberUpdate,
    MemberPatch,
)
from chapter12.app.repositories import member_repository


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

    except IntegrityError as e:
        # PostgreSQL unique_violation
        if getattr(e.orig, "sqlstate", None) == "23505":
            raise HTTPException(
                status_code=409,
                detail="Email already exists",
            ) from e

        raise


def update_member_service(
    db: Session,
    member_id: int,
    payload: MemberUpdate,
) -> Member:
    member = member_repository.find_by_id(
        db, member_id
    )

    if member is None:
        raise HTTPException(
            status_code=404,
            detail="Member not found",
        )

    if member.email != str(payload.email):
        existing = member_repository.find_by_email(
            db, str(payload.email)
        )

        if existing is not None:
            raise HTTPException(
                status_code=409,
                detail="Email already exists",
            )

    return member_repository.update_member(
        db, member, payload
    )


def patch_member_service(
    db: Session,
    member_id: int,
    payload: MemberPatch,
) -> Member:
    changes = payload.model_dump(
        exclude_unset=True
    )

    if not changes:
        raise HTTPException(
            status_code=400,
            detail="At least one field is required",
        )

    member = member_repository.find_by_id(
        db, member_id
    )

    if member is None:
        raise HTTPException(
            status_code=404,
            detail="Member not found",
        )

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

    return member_repository.patch_member(
        db, member, payload
    )


def delete_member_service(
    db: Session,
    member_id: int,
) -> None:
    member = member_repository.find_by_id(
        db, member_id
    )

    if member is None:
        raise HTTPException(
            status_code=404,
            detail="Member not found",
        )

    member_repository.delete_member(db, member)
