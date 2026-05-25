from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime, date, timedelta
from typing import Optional

from database import engine, get_db
import models, schemas
from auth import (
    hash_password, verify_password,
    create_access_token, get_current_user
)
from recommender import get_recommendations

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="TimeWe API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Health ─────────────────────────────────────────────────────────────────

@app.get("/ping")
def ping():
    return {"status": "ok"}


# ── Auth ───────────────────────────────────────────────────────────────────

@app.post("/auth/register", response_model=schemas.Token, status_code=201)
def register(data: schemas.UserRegister, db: Session = Depends(get_db)):
    if db.query(models.User).filter(models.User.email == data.email).first():
        raise HTTPException(400, "Email уже занят")
    user = models.User(
        email=data.email,
        hashed_password=hash_password(data.password),
        name=data.name,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"access_token": create_access_token(user.id)}


@app.post("/auth/login", response_model=schemas.Token)
def login(data: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == data.email).first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(401, "Неверный email или пароль")
    return {"access_token": create_access_token(user.id)}


@app.get("/auth/me", response_model=schemas.UserOut)
def me(current_user: models.User = Depends(get_current_user)):
    return current_user


# ── Onboarding ─────────────────────────────────────────────────────────────

@app.post("/onboarding", response_model=schemas.UserOut)
def onboarding(
    data: schemas.OnboardingIn,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Заменяем категории полностью (не добавляем к старым)
    current_user.onboarding_categories = ",".join(data.categories)
    db.commit()
    db.refresh(current_user)
    return current_user


# ── Events ─────────────────────────────────────────────────────────────────

@app.get("/events", response_model=list[schemas.EventOut])
def get_events(
    category: Optional[str] = None,
    price_max: Optional[int] = None,
    date_filter: Optional[str] = None,  # "today" | "tomorrow"
    db: Session = Depends(get_db),
):
    q = db.query(models.Event)

    if category:
        q = q.filter(models.Event.category == category)

    if price_max is not None:
        q = q.filter(models.Event.price_min <= price_max)

    # Фильтрация по дате — смотрим на start_time события
    # KudaGo хранит время начала, дату берём из added_at парсера
    # Простое решение: фильтруем по времени суток через start_time
    if date_filter == "today":
        # Возвращаем все события — сегодня это всё что в каталоге актуальное
        # Реальная фильтрация по дате требует поля date в модели
        # Пока возвращаем события с временем в диапазоне сегодняшнего дня
        now = datetime.now()
        # Фильтр: start_time существует (не null)
        q = q.filter(models.Event.start_time.isnot(None))
        events = q.order_by(models.Event.start_time).all()
        return events[:40]

    elif date_filter == "tomorrow":
        q = q.filter(models.Event.start_time.isnot(None))
        events = q.order_by(models.Event.start_time).all()
        # Возвращаем другую выборку — со смещением
        return events[40:80]

    return q.order_by(models.Event.id.desc()).all()


@app.get("/events/{event_id}", response_model=schemas.EventOut)
def get_event(event_id: int, db: Session = Depends(get_db)):
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        raise HTTPException(404, "Событие не найдено")
    return event


# ── Feed (ML) ──────────────────────────────────────────────────────────────

@app.get("/feed", response_model=schemas.FeedResponse)
def feed(
    n: int = 20,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    events, cold_start = get_recommendations(current_user.id, db, n=n)
    return {"events": events, "cold_start": cold_start}


# ── Interactions ───────────────────────────────────────────────────────────

@app.post("/interactions", response_model=schemas.InteractionOut, status_code=201)
def add_interaction(
    data: schemas.InteractionIn,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if data.action not in ("like", "dislike"):
        raise HTTPException(400, "action должен быть 'like' или 'dislike'")

    existing = (
        db.query(models.Interaction)
        .filter(
            models.Interaction.user_id  == current_user.id,
            models.Interaction.event_id == data.event_id,
        )
        .first()
    )
    if existing:
        existing.action       = data.action
        existing.time_on_card = data.time_on_card or 0
        db.commit()
        db.refresh(existing)
        return existing

    interaction = models.Interaction(
        user_id=current_user.id,
        event_id=data.event_id,
        action=data.action,
        time_on_card=data.time_on_card or 0,
    )
    db.add(interaction)
    db.commit()
    db.refresh(interaction)
    return interaction


@app.delete("/interactions/reset", status_code=204)
def reset_interactions(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db.query(models.Interaction).filter(
        models.Interaction.user_id == current_user.id
    ).delete()
    db.commit()


@app.get("/interactions/my", response_model=list[schemas.InteractionOut])
def my_interactions(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(models.Interaction)
        .filter(models.Interaction.user_id == current_user.id)
        .all()
    )


# ── Favorites ──────────────────────────────────────────────────────────────

@app.post("/favorites", response_model=schemas.FavoriteOut, status_code=201)
def add_favorite(
    data: schemas.FavoriteIn,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    exists = (
        db.query(models.Favorite)
        .filter(
            models.Favorite.user_id  == current_user.id,
            models.Favorite.event_id == data.event_id,
        )
        .first()
    )
    if exists:
        return exists
    fav = models.Favorite(user_id=current_user.id, event_id=data.event_id)
    db.add(fav)
    db.commit()
    db.refresh(fav)
    return fav


@app.delete("/favorites/{event_id}", status_code=204)
def remove_favorite(
    event_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    fav = (
        db.query(models.Favorite)
        .filter(
            models.Favorite.user_id  == current_user.id,
            models.Favorite.event_id == event_id,
        )
        .first()
    )
    if fav:
        db.delete(fav)
        db.commit()


@app.get("/favorites/my", response_model=list[schemas.FavoriteOut])
def my_favorites(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(models.Favorite)
        .filter(models.Favorite.user_id == current_user.id)
        .all()
    )


# ── Day Plan ───────────────────────────────────────────────────────────────

@app.post("/day-plan", response_model=schemas.DayPlanOut, status_code=201)
def add_to_day_plan(
    data: schemas.DayPlanIn,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    event = db.query(models.Event).filter(models.Event.id == data.event_id).first()
    if not event:
        raise HTTPException(404, "Событие не найдено")

    today_start = datetime.combine(date.today(), datetime.min.time())
    existing = (
        db.query(models.DayPlan)
        .filter(
            models.DayPlan.user_id  == current_user.id,
            models.DayPlan.event_id == data.event_id,
            models.DayPlan.added_at >= today_start,
        )
        .first()
    )
    if existing:
        return existing

    plan = models.DayPlan(user_id=current_user.id, event_id=data.event_id)
    db.add(plan)
    db.commit()
    db.refresh(plan)
    return plan


@app.get("/day-plan/today", response_model=list[schemas.DayPlanOut])
def get_today_plan(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    today_start = datetime.combine(date.today(), datetime.min.time())
    return (
        db.query(models.DayPlan)
        .filter(
            models.DayPlan.user_id  == current_user.id,
            models.DayPlan.added_at >= today_start,
        )
        .order_by(models.DayPlan.added_at)
        .all()
    )


@app.delete("/day-plan/{event_id}", status_code=204)
def remove_from_day_plan(
    event_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    today_start = datetime.combine(date.today(), datetime.min.time())
    plan = (
        db.query(models.DayPlan)
        .filter(
            models.DayPlan.user_id  == current_user.id,
            models.DayPlan.event_id == event_id,
            models.DayPlan.added_at >= today_start,
        )
        .first()
    )
    if plan:
        db.delete(plan)
        db.commit()
