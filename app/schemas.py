from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import time, datetime


# ───────── Auth ─────────

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    email: str
    name: Optional[str]
    onboarding_categories: Optional[str]

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ───────── Onboarding ─────────

class OnboardingIn(BaseModel):
    # список категорий: ["art", "music", "sport"]
    categories: List[str]


# ───────── Events ─────────

class EventOut(BaseModel):
    id:             int
    title:          str
    description:    Optional[str]
    category:       Optional[str]
    image_url:      Optional[str]
    price_min:      Optional[int]
    price_max:      Optional[int]
    mood_tags:      Optional[str]
    location:       Optional[str]
    group_size_min: Optional[int]
    group_size_max: Optional[int]
    duration_hours: Optional[float]
    start_time:     Optional[time]
    lat:            Optional[float]
    lon:            Optional[float]

    class Config:
        from_attributes = True


# ───────── Interactions ─────────

class InteractionIn(BaseModel):
    event_id:     int
    action:       str          # "like" | "dislike"
    time_on_card: Optional[int] = 0

class InteractionOut(BaseModel):
    id:       int
    event_id: int
    action:   str

    class Config:
        from_attributes = True


# ───────── Favorites ─────────

class FavoriteIn(BaseModel):
    event_id: int

class FavoriteOut(BaseModel):
    id:       int
    event_id: int
    event:    EventOut

    class Config:
        from_attributes = True


# ───────── Feed ─────────

class FeedResponse(BaseModel):
    events:    List[EventOut]
    # cold_start=True когда рекомендаций ещё нет — фронт может показать
    # плашку "Оцени несколько событий, чтобы лента стала точнее"
    cold_start: bool = False


# ───────── Day Plan ─────────

class DayPlanIn(BaseModel):
    event_id: int

class DayPlanOut(BaseModel):
    id:       int
    event_id: int
    event:    EventOut
    added_at: datetime

    class Config:
        from_attributes = True
