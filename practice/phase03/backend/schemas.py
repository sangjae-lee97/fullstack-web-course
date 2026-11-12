
from pydantic import (
    BaseModel,
    ConfigDict,
    EmailStr,
    Field,
    field_validator,
)


# ========================================
# Existing Member Schemas
# ========================================

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


# ========================================
# Chapter 09 - Product Schema
# ========================================

class ProductResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    price: int
    category: str
    stock: int


# ========================================
# Chapter 09 - Order Schemas
# ========================================

class OrderItemCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    product_id: int = Field(ge=1)
    quantity: int = Field(ge=1)


class OrderCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    items: list[OrderItemCreate] = Field(
        min_length=1
    )


class OrderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    total_price: int
    status: str
