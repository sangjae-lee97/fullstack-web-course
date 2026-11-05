
from pydantic import (
    BaseModel,
    EmailStr,
    field_validator,
)


class MemberCreate(BaseModel):
    name: str
    email: EmailStr
    age: int


class MemberUpdate(BaseModel):
    name: str
    email: EmailStr
    age: int


class MemberPatch(BaseModel):
    name: str | None = None
    email: EmailStr | None = None
    age: int | None = None

    @field_validator(
        "name", "email", "age", mode="before"
    )
    @classmethod
    def reject_explicit_null(cls, value):
        if value is None:
            raise ValueError(
                "Explicit null is not allowed"
            )
        return value
