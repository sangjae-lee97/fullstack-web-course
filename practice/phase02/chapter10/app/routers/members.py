
from fastapi import APIRouter, status

from chapter10.app.schemas import MemberCreate, MemberResponse
from chapter10.app.services import member_service


router = APIRouter(prefix="/members", tags=["members"])


@router.get("", response_model=list[MemberResponse])
def get_members():
    return member_service.get_members()


@router.get("/{member_id}", response_model=MemberResponse)
def get_member(member_id: int):
    return member_service.get_member(member_id)


@router.post(
    "",
    response_model=MemberResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_member(member: MemberCreate):
    return member_service.create_member(member)
