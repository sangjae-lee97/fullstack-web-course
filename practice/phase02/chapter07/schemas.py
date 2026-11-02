
from pydantic import BaseModel, EmailStr, Field


class MemberCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    age: int = Field(ge=0, le=150)


class MemberCreatedResponse(MemberCreate):
    id: int
