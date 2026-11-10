import os
from pathlib import Path
from collections.abc import Generator

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.engine import URL
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker


ENV_PATH = Path(__file__).resolve().parents[1] / ".env"
load_dotenv(ENV_PATH)


def required_env(key: str) -> str:
    value = os.getenv(key)
    if not value:
        raise RuntimeError(f"{ENV_PATH}에 {key} 설정이 없습니다.")
    return value


DATABASE_URL = URL.create(
    drivername="postgresql+psycopg",
    username=required_env("DB_USER"),
    password=required_env("DB_PASSWORD"),
    host=required_env("DB_HOST"),
    port=int(os.getenv("DB_PORT", "5432")),
    database=required_env("DB_NAME"),
)

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False,
)


class Base(DeclarativeBase):
    pass


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()