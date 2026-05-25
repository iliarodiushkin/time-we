"""Тесты аутентификации: регистрация, логин, защита эндпоинтов."""
import pytest


def test_register_success(client):
    r = client.post("/auth/register", json={
        "email": "user@test.ru",
        "password": "password123"
    })
    assert r.status_code == 201
    data = r.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_register_duplicate_email(client):
    client.post("/auth/register", json={"email": "dup@test.ru", "password": "pass"})
    r = client.post("/auth/register", json={"email": "dup@test.ru", "password": "other"})
    assert r.status_code == 400
    assert "занят" in r.json()["detail"]


def test_login_success(client):
    client.post("/auth/register", json={"email": "u@test.ru", "password": "mypass"})
    r = client.post("/auth/login", json={"email": "u@test.ru", "password": "mypass"})
    assert r.status_code == 200
    assert "access_token" in r.json()


def test_login_wrong_password(client):
    client.post("/auth/register", json={"email": "u2@test.ru", "password": "correct"})
    r = client.post("/auth/login", json={"email": "u2@test.ru", "password": "wrong"})
    assert r.status_code == 401


def test_login_unknown_email(client):
    r = client.post("/auth/login", json={"email": "nobody@test.ru", "password": "x"})
    assert r.status_code == 401


def test_get_me_success(client, auth_headers):
    r = client.get("/auth/me", headers=auth_headers)
    assert r.status_code == 200
    data = r.json()
    assert data["email"] == "test@timewe.ru"


def test_get_me_without_token(client):
    r = client.get("/auth/me")
    assert r.status_code == 401


def test_get_me_invalid_token(client):
    r = client.get("/auth/me", headers={"Authorization": "Bearer invalid.token.here"})
    assert r.status_code == 401


def test_onboarding(client, auth_headers):
    r = client.post("/onboarding",
                    json={"categories": ["music", "art", "sport"]},
                    headers=auth_headers)
    assert r.status_code == 200
    assert "music" in r.json()["onboarding_categories"]
