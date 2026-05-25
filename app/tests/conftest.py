"""
Конфигурация тестов TimeWe.
Использует SQLite in-memory — изолировано от продакшн PostgreSQL.
"""
import pytest
from starlette.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from main import app
from database import Base, get_db
import models

SQLALCHEMY_TEST_URL = "sqlite:///./test_timewe.db"

engine = create_engine(
    SQLALCHEMY_TEST_URL,
    connect_args={"check_same_thread": False}
)
TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db():
    """Чистая БД для каждого теста."""
    Base.metadata.create_all(bind=engine)
    session = TestSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db):
    """TestClient с подменённой зависимостью get_db."""
    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    client = TestClient(app, raise_server_exceptions=True)
    yield client
    app.dependency_overrides.clear()


@pytest.fixture
def registered_user(client):
    """Зарегистрированный пользователь + токен."""
    resp = client.post("/auth/register", json={
        "email": "test@timewe.ru",
        "password": "testpass123",
        "name": "Тест Пользователь"
    })
    assert resp.status_code == 201
    token = resp.json()["access_token"]
    return {"token": token, "headers": {"Authorization": f"Bearer {token}"}}


@pytest.fixture
def auth_headers(registered_user):
    """Просто заголовки авторизации."""
    return registered_user["headers"]


@pytest.fixture
def seed_events(db):
    """5 тестовых событий двух категорий для ML-тестов."""
    events = [
        models.Event(title="Джазовый вечер", category="music",
                     mood_tags="спокойный,романтичный", price_min=800, price_max=1500,
                     duration_hours=2.5, location="Чистые пруды"),
        models.Event(title="Рок-концерт", category="music",
                     mood_tags="активный,весёлый", price_min=1500, price_max=3000,
                     duration_hours=3.0, location="Парк Горького"),
        models.Event(title="Джаз в баре", category="music",
                     mood_tags="спокойный,уютный", price_min=500, price_max=1000,
                     duration_hours=2.0, location="Центр"),
        models.Event(title="Выставка импрессионистов", category="art",
                     mood_tags="интеллектуальный,спокойный", price_min=400, price_max=800,
                     duration_hours=2.0, location="Третьяковка"),
        models.Event(title="Арт-маркет", category="art",
                     mood_tags="весёлый,творческий", price_min=0, price_max=0,
                     duration_hours=3.0, location="Флакон"),
    ]
    for e in events:
        db.add(e)
    db.commit()
    return events
