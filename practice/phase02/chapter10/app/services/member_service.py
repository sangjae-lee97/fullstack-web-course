
from fastapi import HTTPException

from chapter10.app.repositories import member_repository


def get_members():
    return member_repository.find_all()


def get_member(member_id: int):
    member = member_repository.find_by_id(member_id)

    if member is None:
        raise HTTPException(
            status_code=404,
            detail="Member not found"
        )

    return member


def create_member(data):
    if member_repository.exists_by_email(str(data.email)):
        raise HTTPException(
            status_code=409,
            detail="Email already exists"
        )

    return member_repository.create(data)
