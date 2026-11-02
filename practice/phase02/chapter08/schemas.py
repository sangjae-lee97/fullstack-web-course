
from pydantic import BaseModel, EmailStr, Field, model_validator


# PUT: 모든 수정 필드 필수
class MemberUpdate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    age: int = Field(ge=0, le=150)


# PATCH: 필드 생략 가능, 명시적 null 금지
class MemberPatch(BaseModel):
    name: str | None = Field(
        default=None, min_length=1, max_length=100
    )
    email: EmailStr | None = None
    age: int | None = Field(
        default=None, ge=0, le=150
    )

    @model_validator(mode="after")
    def reject_explicit_null(self):
        for field in self.model_fields_set:
            if getattr(self, field) is None:
                raise ValueError(f"{field} cannot be null")
        return self


# 수정 결과 반환
class MemberResponse(BaseModel):
    member_id: int
    name: str
    email: EmailStr
    age: int
