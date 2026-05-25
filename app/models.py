from sqlalchemy import (
    Column, Integer, String, Text, Float, Time,
    ForeignKey, DateTime, Boolean
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class User(Base):
    __tablename__ = "users"

    id            = Column(Integer, primary_key=True, index=True)
    email         = Column(String(200), unique=True, nullable=False, index=True)
    hashed_password = Column(String(200), nullable=False)
    name          = Column(String(100), nullable=True)
    # категории выбранные на онбординге, через запятую
    onboarding_categories = Column(String(300), nullable=True)
    created_at    = Column(DateTime(timezone=True), server_default=func.now())

    interactions  = relationship("Interaction", back_populates="user")
    favorites     = relationship("Favorite",    back_populates="user")


class Event(Base):
    __tablename__ = "events"

    id             = Column(Integer, primary_key=True, index=True)
    title          = Column(String(200), nullable=False)
    description    = Column(Text, nullable=True)
    category       = Column(String(50),  nullable=True, index=True)
    image_url      = Column(String(500), nullable=True)

    price_min      = Column(Integer, nullable=True, default=0)
    price_max      = Column(Integer, nullable=True, default=0)
    mood_tags      = Column(String(200), nullable=True)   # "спокойный, романтичный"
    location       = Column(String(100), nullable=True)
    group_size_min = Column(Integer, nullable=True, default=1)
    group_size_max = Column(Integer, nullable=True, default=10)
    start_time     = Column(Time,    nullable=True)
    duration_hours = Column(Float,   nullable=True, default=1.0)
    lat            = Column(Float,   nullable=True)
    lon            = Column(Float,   nullable=True)

    interactions   = relationship("Interaction", back_populates="event")
    favorites      = relationship("Favorite",    back_populates="event")


class Interaction(Base):
    """Лайки и дизлайки — главный сигнал для ML."""
    __tablename__ = "interactions"

    id           = Column(Integer, primary_key=True, index=True)
    user_id      = Column(Integer, ForeignKey("users.id"),  nullable=False, index=True)
    event_id     = Column(Integer, ForeignKey("events.id"), nullable=False, index=True)
    # "like" | "dislike"
    action       = Column(String(10), nullable=False)
    # сколько секунд карточка была видна — опциональный сигнал
    time_on_card = Column(Integer,  nullable=True, default=0)
    created_at   = Column(DateTime(timezone=True), server_default=func.now())

    user  = relationship("User",  back_populates="interactions")
    event = relationship("Event", back_populates="interactions")


class Favorite(Base):
    __tablename__ = "favorites"

    id       = Column(Integer, primary_key=True, index=True)
    user_id  = Column(Integer, ForeignKey("users.id"),  nullable=False, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False, index=True)

    user  = relationship("User",  back_populates="favorites")
    event = relationship("Event", back_populates="favorites")


class DayPlan(Base):
    __tablename__ = "day_plans"

    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    event_id   = Column(Integer, ForeignKey("events.id"), nullable=False, index=True)
    date       = Column(DateTime(timezone=True), server_default=func.now())
    added_at   = Column(DateTime(timezone=True), server_default=func.now())

    user  = relationship("User",  foreign_keys=[user_id])
    event = relationship("Event", foreign_keys=[event_id])
