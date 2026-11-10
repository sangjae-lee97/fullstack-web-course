from pydantic import (
    BaseModel,
    ConfigDict,
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
            raise ValueError("Explicit null is not allowed")
        return value


class MemberOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    member_id: int
    name: str
    email: str
    age: int