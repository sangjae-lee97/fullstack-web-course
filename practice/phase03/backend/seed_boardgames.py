
from sqlalchemy import select, text

from backend.db import SessionLocal
from backend.models import Product


# Chapter 09 - Board Game Mini Pop-up Store
# Prices and stock are fictional practice data.

SEED_PRODUCTS = [
    {
        "name": "블러드 온 더 클락타워",
        "price": 180000,
        "category": "추리·마피아",
        "stock": 8,
    },
    {
        "name": "아발론",
        "price": 35000,
        "category": "추리·마피아",
        "stock": 15,
    },
    {
        "name": "스플렌더",
        "price": 45000,
        "category": "전략",
        "stock": 20,
    },
    {
        "name": "테라포밍 마스",
        "price": 75000,
        "category": "전략",
        "stock": 10,
    },
    {
        "name": "티켓 투 라이드",
        "price": 55000,
        "category": "가족",
        "stock": 12,
    },
    {
        "name": "윙스팬",
        "price": 65000,
        "category": "전략",
        "stock": 0,
    },
    {
        "name": "아그리콜라",
        "price": 68000,
        "category": "전략",
        "stock": 14,
    },
    {
        "name": "버라지",
        "price": 98000,
        "category": "전략",
        "stock": 7,
    },
    {
        "name": "브라스: 버밍엄",
        "price": 85000,
        "category": "전략",
        "stock": 9,
    },
    {
        "name": "혁신의 시대",
        "price": 115000,
        "category": "전략",
        "stock": 6,
    },
]


def seed_boardgames() -> None:
    added = []
    skipped = []

    # Successful transaction commits automatically.
    # Any exception causes a rollback.
    with SessionLocal.begin() as session:
        database_name = session.scalar(
            text("SELECT current_database()")
        )

        if database_name != "postgres":
            raise RuntimeError(
                f"Unexpected database: {database_name}"
            )

        for data in SEED_PRODUCTS:
            existing_id = session.scalar(
                select(Product.id).where(
                    Product.name == data["name"]
                ).limit(1)
            )

            if existing_id is not None:
                skipped.append(data["name"])
                continue

            session.add(Product(**data))
            added.append(data["name"])

    print("=== Board Game Seed Completed ===")
    print(f"Inserted: {len(added)}")
    print(f"Skipped: {len(skipped)}")

    for name in added:
        print(f"[INSERT] {name}")

    for name in skipped:
        print(f"[SKIP] {name}")


if __name__ == "__main__":
    seed_boardgames()
