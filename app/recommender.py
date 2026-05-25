"""
ML-модуль рекомендаций TimeWe
──────────────────────────────────────────────────────────────────
Алгоритм: content-based filtering на основе TF-IDF + cosine similarity.

Логика get_recommendations:
  1. Есть лайки → строим профиль из лайков → cosine similarity
  2. Нет лайков, но есть onboarding_categories → фильтруем по ним + популярность
  3. Нет ничего → топ по популярности (глобальный cold start)
"""

from typing import List, Optional
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sqlalchemy.orm import Session
from sqlalchemy import func

import models


# ── Helpers ────────────────────────────────────────────────────────────────

def _price_bucket(price_min: Optional[int], price_max: Optional[int]) -> str:
    avg = ((price_min or 0) + (price_max or 0)) / 2
    if avg == 0:    return "бесплатно"
    if avg < 500:   return "дёшево"
    if avg < 1500:  return "средняя_цена"
    if avg < 3000:  return "дорого"
    return "премиум"

def _duration_bucket(hours: Optional[float]) -> str:
    h = hours or 1.0
    if h <= 1:   return "короткое"
    if h <= 2.5: return "среднее"
    return "долгое"

def _build_feature_string(event: models.Event) -> str:
    """Собирает строку фич для TF-IDF из полей события."""
    parts = []
    if event.category:
        parts.append(event.category)
    if event.mood_tags:
        tags = [t.strip().lower().replace(" ", "_")
                for t in event.mood_tags.split(",")]
        parts.extend(tags)
    parts.append(_price_bucket(event.price_min, event.price_max))
    parts.append(_duration_bucket(event.duration_hours))
    return " ".join(parts)


# ── Основная функция ────────────────────────────────────────────────────────

def get_recommendations(
    user_id: int,
    db: Session,
    n: int = 20,
) -> tuple[List[models.Event], bool]:
    """
    Возвращает (список событий, cold_start_flag).
    cold_start=True когда у пользователя нет лайков.
    """
    all_events: List[models.Event] = db.query(models.Event).all()
    if not all_events:
        return [], True

    # ── Строим матрицу TF-IDF ─────────────────────────────────────────────
    event_ids       = [e.id for e in all_events]
    feature_strings = [_build_feature_string(e) for e in all_events]

    vectorizer   = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform(feature_strings)

    id_to_idx = {eid: i for i, eid in enumerate(event_ids)}

    # ── Лайкнутые пользователем события ──────────────────────────────────
    liked_interactions = (
        db.query(models.Interaction)
        .filter(
            models.Interaction.user_id == user_id,
            models.Interaction.action  == "like",
        )
        .all()
    )
    liked_event_ids = {i.event_id for i in liked_interactions}

    # ── Дизлайкнутые — исключаем из выдачи полностью ─────────────────────
    disliked_event_ids = {
        i.event_id
        for i in db.query(models.Interaction).filter(
            models.Interaction.user_id == user_id,
            models.Interaction.action  == "dislike",
        ).all()
    }
    seen_ids = disliked_event_ids

    # ── Популярность (нужна для обоих режимов cold start) ────────────────
    like_counts = (
        db.query(
            models.Interaction.event_id,
            func.count(models.Interaction.id).label("cnt")
        )
        .filter(models.Interaction.action == "like")
        .group_by(models.Interaction.event_id)
        .all()
    )
    popularity = {row.event_id: row.cnt for row in like_counts}

    # ── Cold start ────────────────────────────────────────────────────────
    if not liked_event_ids:
        user = db.query(models.User).filter(models.User.id == user_id).first()
        onboarding_cats = []
        if user and user.onboarding_categories:
            onboarding_cats = [
                c.strip() for c in user.onboarding_categories.split(",")
                if c.strip()
            ]

        if onboarding_cats:
            # Фильтруем события по категориям онбординга
            # Дополнительно добавляем вес через TF-IDF по категориям
            cat_events = [e for e in all_events if e.category in onboarding_cats]
            other_events = [e for e in all_events if e.category not in onboarding_cats]

            # Внутри каждой группы сортируем по популярности
            cat_events_sorted = sorted(
                cat_events,
                key=lambda e: popularity.get(e.id, 0),
                reverse=True
            )
            other_events_sorted = sorted(
                other_events,
                key=lambda e: popularity.get(e.id, 0),
                reverse=True
            )

            # Берём сначала из нужных категорий, добиваем остальными
            result = cat_events_sorted + other_events_sorted
            result = [e for e in result if e.id not in seen_ids]
            return result[:n], True
        else:
            # Нет ни лайков ни онбординга — глобальная популярность
            sorted_events = sorted(
                all_events,
                key=lambda e: popularity.get(e.id, 0),
                reverse=True
            )
            result = [e for e in sorted_events if e.id not in seen_ids]
            return result[:n], True

    # ── Есть лайки → профиль вкусов → cosine similarity ──────────────────
    liked_indices = [
        id_to_idx[eid] for eid in liked_event_ids if eid in id_to_idx
    ]
    user_profile = np.asarray(
        tfidf_matrix[liked_indices].mean(axis=0)
    )

    similarities = cosine_similarity(user_profile, tfidf_matrix).flatten()

    scored = sorted(
        zip(event_ids, similarities),
        key=lambda x: x[1],
        reverse=True
    )

    result_ids = [
        eid for eid, score in scored
        if eid not in seen_ids
    ][:n]

    id_to_event = {e.id: e for e in all_events}
    return [id_to_event[eid] for eid in result_ids if eid in id_to_event], False
