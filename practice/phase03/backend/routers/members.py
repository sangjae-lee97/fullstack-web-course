import logging

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from backend.db import get_db
from backend.schemas import (
    MemberCreate,
    MemberUpdate,
    MemberPatch,
    MemberOut,
)
from backend.services.member_service import (
    get_members_service,
    get_member_service,
    create_member_service,
    update_member_service,
    patch_member_service,
    delete_member_service,
)


logger = logging.getLogger(__name__)

router = APIRouter(tags=["Members"])


@router.get("/members", response_model=list[MemberOut])
def get_members(db: Session = Depends(get_db)):
    logger.info("member list requested")
    return get_members_service(db)


@router.get(
    "/members/{member_id}",
    response_model=MemberOut,
)
def get_member(
    member_id: int,
    db: Session = Depends(get_db),
):
    logger.info("member requested: %s", member_id)
    return get_member_service(db, member_id)


@router.post(
    "/members",
    status_code=status.HTTP_201_CREATED,
    response_model=MemberOut,
)
def create_member(
    payload: MemberCreate,
    db: Session = Depends(get_db),
):
    logger.info("member creation requested")
    return create_member_service(db, payload)


@router.put(
    "/members/{member_id}",
    response_model=MemberOut,
)
def update_member(
    member_id: int,
    payload: MemberUpdate,
    db: Session = Depends(get_db),
):
    logger.info("member update requested: %s", member_id)
    return update_member_service(db, member_id, payload)


@router.patch(
    "/members/{member_id}",
    response_model=MemberOut,
)
def patch_member(
    member_id: int,
    payload: MemberPatch,
    db: Session = Depends(get_db),
):
    logger.info("member patch requested: %s", member_id)
    return patch_member_service(db, member_id, payload)


@router.delete(
    "/members/{member_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_member(
    member_id: int,
    db: Session = Depends(get_db),
):
    logger.info("member deletion requested: %s", member_id)
    delete_member_service(db, member_id)