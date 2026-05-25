"""Модульные тесты ML-модуля рекомендаций."""
import pytest
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from recommender import (
    _price_bucket, _duration_bucket,
    _build_feature_string, get_recommendations
)
import models


# ── Тесты ценовых бакетов ───────────────────────────────────────────────────

def test_price_bucket_free():
    assert _price_bucket(0, 0) == "бесплатно"

def test_price_bucket_none():
    assert _price_bucket(None, None) == "бесплатно"

def test_price_bucket_cheap():
    assert _price_bucket(100, 400) == "дёшево"

def test_price_bucket_medium():
    assert _price_bucket(500, 1400) == "средняя_цена"

def test_price_bucket_expensive():
    assert _price_bucket(1500, 2500) == "дорого"

def test_price_bucket_premium():
    assert _price_bucket(5000, 8000) == "премиум"


# ── Тесты бакетов длительности ──────────────────────────────────────────────

def test_duration_short():
    assert _duration_bucket(0.5) == "короткое"

def test_duration_short_boundary():
    assert _duration_bucket(1.0) == "короткое"

def test_duration_medium():
    assert _duration_bucket(2.0) == "среднее"

def test_duration_long():
    assert _duration_bucket(3.0) == "долгое"

def test_duration_none():
    assert _duration_bucket(None) == "короткое"


# ── Тесты формирования строки признаков ────────────────────────────────────

class FakeEvent:
    def __init__(self, **kwargs):
        for k, v in kwargs.items():
            setattr(self, k, v)


def test_feature_string_contains_category():
    e = FakeEvent(category="music", mood_tags="весёлый",
                  price_min=500, price_max=1000, duration_hours=2.0)
    result = _build_feature_string(e)
    assert "music" in result


def test_feature_string_contains_mood_tags():
    e = FakeEvent(category="art", mood_tags="спокойный,интеллектуальный",
                  price_min=400, price_max=800, duration_hours=1.5)
    result = _build_feature_string(e)
    assert "спокойный" in result
    assert "интеллектуальный" in result


def test_feature_string_normalizes_spaces():
    e = FakeEvent(category="walk", mood_tags="на свежем воздухе",
                  price_min=0, price_max=0, duration_hours=1.0)
    result = _build_feature_string(e)
    assert "на_свежем_воздухе" in result


def test_feature_string_no_mood_tags():
    e = FakeEvent(category="sport", mood_tags=None,
                  price_min=1000, price_max=2000, duration_hours=2.0)
    result = _build_feature_string(e)
    assert "sport" in result
    assert result  # не пустая


def test_feature_string_price_bucket_included():
    e = FakeEvent(category="food", mood_tags="уютный",
                  price_min=0, price_max=0, duration_hours=1.5)
    result = _build_feature_string(e)
    assert "бесплатно" in result


# ── Тесты алгоритма рекомендаций ────────────────────────────────────────────

def test_cold_start_no_events(db):
    """Пустая БД — возвращает пустой список."""
    user = models.User(email="u@t.ru", hashed_password="x")
    db.add(user); db.commit()
    events, cold_start = get_recommendations(user.id, db)
    assert events == []
    assert cold_start is True


def test_cold_start_returns_events(db, seed_events):
    """Нет лайков — cold_start=True, события возвращаются."""
    user = models.User(email="cold@t.ru", hashed_password="x")
    db.add(user); db.commit()
    events, cold_start = get_recommendations(user.id, db)
    assert cold_start is True
    assert len(events) > 0


def test_cold_start_sorted_by_popularity(db, seed_events):
    """Cold start: события с большим числом лайков идут первыми."""
    # Создаём двух пользователей, оба лайкают первое событие
    for i in range(2):
        u = models.User(email=f"pop{i}@t.ru", hashed_password="x")
        db.add(u); db.commit()
        like = models.Interaction(user_id=u.id,
                                   event_id=seed_events[0].id, action="like")
        db.add(like)
    db.commit()

    # Новый пользователь без лайков
    new_user = models.User(email="new@t.ru", hashed_password="x")
    db.add(new_user); db.commit()
    events, cold_start = get_recommendations(new_user.id, db)
    assert cold_start is True
    assert events[0].id == seed_events[0].id


def test_liked_music_returns_music_first(db, seed_events):
    """Лайк музыкального события — музыка поднимается в топ."""
    user = models.User(email="music@t.ru", hashed_password="x")
    db.add(user); db.commit()
    like = models.Interaction(user_id=user.id,
                               event_id=seed_events[0].id, action="like")
    db.add(like); db.commit()

    events, cold_start = get_recommendations(user.id, db)
    assert cold_start is False
    assert events[0].category == "music"


def test_disliked_event_excluded(db, seed_events):
    """Дизлайкнутое событие не попадает в рекомендации."""
    user = models.User(email="dis@t.ru", hashed_password="x")
    db.add(user); db.commit()

    # Лайкаем музыку, дизлайкаем арт
    db.add(models.Interaction(user_id=user.id,
                               event_id=seed_events[0].id, action="like"))
    db.add(models.Interaction(user_id=user.id,
                               event_id=seed_events[3].id, action="dislike"))
    db.commit()

    events, _ = get_recommendations(user.id, db)
    ids = [e.id for e in events]
    assert seed_events[3].id not in ids


def test_recommendations_respect_n(db, seed_events):
    """Параметр n ограничивает количество рекомендаций."""
    user = models.User(email="n@t.ru", hashed_password="x")
    db.add(user); db.commit()
    db.add(models.Interaction(user_id=user.id,
                               event_id=seed_events[0].id, action="like"))
    db.commit()
    events, _ = get_recommendations(user.id, db, n=2)
    assert len(events) <= 2
