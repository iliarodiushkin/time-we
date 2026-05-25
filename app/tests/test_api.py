"""Интеграционные тесты REST API."""
import pytest


# ── Events ──────────────────────────────────────────────────────────────────

def test_get_events_empty(client):
    r = client.get("/events")
    assert r.status_code == 200
    assert r.json() == []


def test_get_events_with_data(client, seed_events):
    r = client.get("/events")
    assert r.status_code == 200
    assert len(r.json()) == 5


def test_get_events_filter_by_category(client, seed_events):
    r = client.get("/events?category=music")
    assert r.status_code == 200
    data = r.json()
    assert len(data) == 3
    assert all(e["category"] == "music" for e in data)


def test_get_events_filter_by_price(client, seed_events):
    r = client.get("/events?price_max=500")
    assert r.status_code == 200
    # Только бесплатные и события до 500р
    for e in r.json():
        assert (e["price_min"] or 0) <= 500


def test_get_event_by_id(client, seed_events):
    event_id = seed_events[0].id
    r = client.get(f"/events/{event_id}")
    assert r.status_code == 200
    assert r.json()["id"] == event_id


def test_get_event_not_found(client):
    r = client.get("/events/99999")
    assert r.status_code == 404


# ── Feed (ML) ────────────────────────────────────────────────────────────────

def test_feed_requires_auth(client):
    r = client.get("/feed")
    assert r.status_code == 401


def test_feed_cold_start(client, auth_headers, seed_events):
    r = client.get("/feed", headers=auth_headers)
    assert r.status_code == 200
    data = r.json()
    assert "events" in data
    assert "cold_start" in data
    assert data["cold_start"] is True


def test_feed_after_like(client, auth_headers, seed_events):
    # Лайкаем событие
    event_id = seed_events[0].id
    client.post("/interactions",
                json={"event_id": event_id, "action": "like"},
                headers=auth_headers)
    # Получаем ленту
    r = client.get("/feed", headers=auth_headers)
    assert r.status_code == 200
    data = r.json()
    assert data["cold_start"] is False
    assert len(data["events"]) > 0


def test_feed_n_parameter(client, auth_headers, seed_events):
    r = client.get("/feed?n=2", headers=auth_headers)
    assert r.status_code == 200
    assert len(r.json()["events"]) <= 2


# ── Interactions ─────────────────────────────────────────────────────────────

def test_like_event(client, auth_headers, seed_events):
    r = client.post("/interactions",
                    json={"event_id": seed_events[0].id, "action": "like"},
                    headers=auth_headers)
    assert r.status_code == 201
    assert r.json()["action"] == "like"


def test_dislike_event(client, auth_headers, seed_events):
    r = client.post("/interactions",
                    json={"event_id": seed_events[0].id, "action": "dislike"},
                    headers=auth_headers)
    assert r.status_code == 201
    assert r.json()["action"] == "dislike"


def test_invalid_action(client, auth_headers, seed_events):
    r = client.post("/interactions",
                    json={"event_id": seed_events[0].id, "action": "maybe"},
                    headers=auth_headers)
    assert r.status_code == 400


def test_update_interaction(client, auth_headers, seed_events):
    """Повторное взаимодействие с тем же событием обновляет action."""
    eid = seed_events[0].id
    client.post("/interactions",
                json={"event_id": eid, "action": "like"},
                headers=auth_headers)
    r = client.post("/interactions",
                    json={"event_id": eid, "action": "dislike"},
                    headers=auth_headers)
    assert r.status_code == 201
    assert r.json()["action"] == "dislike"


def test_get_my_interactions(client, auth_headers, seed_events):
    client.post("/interactions",
                json={"event_id": seed_events[0].id, "action": "like"},
                headers=auth_headers)
    r = client.get("/interactions/my", headers=auth_headers)
    assert r.status_code == 200
    assert len(r.json()) == 1


def test_reset_interactions(client, auth_headers, seed_events):
    client.post("/interactions",
                json={"event_id": seed_events[0].id, "action": "like"},
                headers=auth_headers)
    r = client.delete("/interactions/reset", headers=auth_headers)
    assert r.status_code == 204
    # После сброса лента снова cold_start
    feed = client.get("/feed", headers=auth_headers)
    assert feed.json()["cold_start"] is True


def test_interactions_requires_auth(client, seed_events):
    r = client.post("/interactions",
                    json={"event_id": seed_events[0].id, "action": "like"})
    assert r.status_code == 401


# ── Favorites ────────────────────────────────────────────────────────────────

def test_add_favorite(client, auth_headers, seed_events):
    r = client.post("/favorites",
                    json={"event_id": seed_events[0].id},
                    headers=auth_headers)
    assert r.status_code == 201


def test_add_favorite_duplicate(client, auth_headers, seed_events):
    """Повторное добавление возвращает существующую запись."""
    eid = seed_events[0].id
    r1 = client.post("/favorites", json={"event_id": eid}, headers=auth_headers)
    r2 = client.post("/favorites", json={"event_id": eid}, headers=auth_headers)
    assert r2.status_code == 201
    assert r1.json()["id"] == r2.json()["id"]


def test_get_my_favorites(client, auth_headers, seed_events):
    client.post("/favorites",
                json={"event_id": seed_events[0].id},
                headers=auth_headers)
    r = client.get("/favorites/my", headers=auth_headers)
    assert r.status_code == 200
    assert len(r.json()) == 1


def test_remove_favorite(client, auth_headers, seed_events):
    eid = seed_events[0].id
    client.post("/favorites", json={"event_id": eid}, headers=auth_headers)
    r = client.delete(f"/favorites/{eid}", headers=auth_headers)
    assert r.status_code == 204
    favs = client.get("/favorites/my", headers=auth_headers)
    assert len(favs.json()) == 0


# ── Day Plan ─────────────────────────────────────────────────────────────────

def test_add_to_day_plan(client, auth_headers, seed_events):
    r = client.post("/day-plan",
                    json={"event_id": seed_events[0].id},
                    headers=auth_headers)
    assert r.status_code == 201
    assert r.json()["event_id"] == seed_events[0].id


def test_add_duplicate_day_plan(client, auth_headers, seed_events):
    """Повторное добавление того же события в день идемпотентно."""
    eid = seed_events[0].id
    r1 = client.post("/day-plan", json={"event_id": eid}, headers=auth_headers)
    r2 = client.post("/day-plan", json={"event_id": eid}, headers=auth_headers)
    assert r2.status_code == 201
    assert r1.json()["id"] == r2.json()["id"]


def test_get_today_plan(client, auth_headers, seed_events):
    client.post("/day-plan",
                json={"event_id": seed_events[0].id},
                headers=auth_headers)
    r = client.get("/day-plan/today", headers=auth_headers)
    assert r.status_code == 200
    assert len(r.json()) == 1


def test_remove_from_day_plan(client, auth_headers, seed_events):
    eid = seed_events[0].id
    client.post("/day-plan", json={"event_id": eid}, headers=auth_headers)
    r = client.delete(f"/day-plan/{eid}", headers=auth_headers)
    assert r.status_code == 204
    plan = client.get("/day-plan/today", headers=auth_headers)
    assert len(plan.json()) == 0


def test_day_plan_event_not_found(client, auth_headers):
    r = client.post("/day-plan", json={"event_id": 99999}, headers=auth_headers)
    assert r.status_code == 404


def test_day_plan_requires_auth(client, seed_events):
    r = client.post("/day-plan", json={"event_id": seed_events[0].id})
    assert r.status_code == 401


# ── Ping ─────────────────────────────────────────────────────────────────────

def test_ping(client):
    r = client.get("/ping")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"
