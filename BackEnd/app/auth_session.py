from __future__ import annotations

from collections.abc import Generator

from fastapi import Request
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import get_settings

_engine = None
_session_factory: sessionmaker[Session] | None = None


def get_engine():
    global _engine
    if _engine is None:
        settings = get_settings()
        _engine = create_engine(settings.database_url, pool_pre_ping=True)
    return _engine


def get_session_factory() -> sessionmaker[Session]:
    global _session_factory
    if _session_factory is None:
        _session_factory = sessionmaker(bind=get_engine(), autoflush=False, autocommit=False)
    return _session_factory


def create_session() -> Session:
    return get_session_factory()()


def get_db(request: Request) -> Generator[Session, None, None]:
    request_scoped_session = getattr(request.state, "db", None)
    if request_scoped_session is not None:
        yield request_scoped_session
        return

    session = create_session()
    try:
        yield session
    finally:
        session.close()
