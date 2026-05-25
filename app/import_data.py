"""
Запуск: python import_data.py
Читает moscow_events_50.xlsx и загружает события в БД.
Безопасен для повторного запуска — дубликаты по title пропускаются.
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

import pandas as pd
from datetime import time as dtime
from database import SessionLocal
import models


XLSX_PATH = os.path.join(os.path.dirname(__file__), "moscow_events_50.xlsx")


def parse_time(val) -> dtime | None:
    if pd.isna(val):
        return None
    s = str(val).strip()
    try:
        h, m = s.split(":")
        return dtime(int(h), int(m))
    except Exception:
        return None


def import_events():
    df = pd.read_excel(XLSX_PATH)
    db = SessionLocal()

    existing_titles = {e.title for e in db.query(models.Event.title).all()}
    added = 0

    for _, row in df.iterrows():
        title = str(row.get("title", "")).strip()
        if not title or title in existing_titles:
            continue

        event = models.Event(
            title          = title,
            description    = str(row.get("description", "")) or None,
            category       = str(row.get("category", "")) or None,
            image_url      = str(row.get("image_url", "")) or None,
            price_min      = int(row["price_min"])      if not pd.isna(row.get("price_min"))      else 0,
            price_max      = int(row["price_max"])      if not pd.isna(row.get("price_max"))      else 0,
            mood_tags      = str(row.get("mood_tags", "")) or None,
            location       = str(row.get("location", "")) or None,
            group_size_min = int(row["group_size_min"]) if not pd.isna(row.get("group_size_min")) else 1,
            group_size_max = int(row["group_size_max"]) if not pd.isna(row.get("group_size_max")) else 10,
            duration_hours = float(row["duration_hours"]) if not pd.isna(row.get("duration_hours")) else 1.0,
            start_time     = parse_time(row.get("start_time")),
        )
        db.add(event)
        existing_titles.add(title)
        added += 1

    db.commit()
    db.close()
    print(f"Импортировано {added} событий (пропущено дубликатов: {len(df) - added})")


if __name__ == "__main__":
    import_events()
