"""
Парсер событий KudaGo API для TimeWe.
Загружает актуальные события Москвы и сохраняет в БД.

Запуск:
    docker exec timewe_api python kudago_import.py
    docker exec timewe_api python kudago_import.py --limit 200
"""
import requests
import time
import re
import argparse
from datetime import datetime
from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models

# ── Маппинг тегов KudaGo → наши категории ─────────────────────────────────
TAG_TO_CATEGORY = {
    # Музыка — расширенный список
    "музыка": "music", "концерт": "music", "джаз": "music",
    "рок": "music", "электронная музыка": "music", "хип-хоп": "music",
    "классическая музыка": "music", "опера": "music",
    "орган": "music", "органная музыка": "music", "симфония": "music",
    "камерная музыка": "music", "хор": "music", "фортепиано": "music",
    "скрипка": "music", "джазовый": "music", "фолк": "music",
    "поп": "music", "инди": "music", "акустика": "music",
    # Искусство
    "выставки": "art", "галерея": "art", "искусство": "art",
    "театр": "art", "перформанс": "art", "арт": "art",
    # Кино
    "кино": "cinema", "фильм": "cinema", "кинопоказ": "cinema",
    # Спорт
    "спорт": "sport", "фитнес": "sport", "йога": "sport",
    "бег": "sport", "велосипед": "sport", "танцы": "sport",
    # Природа и прогулки
    "городские": "walk", "парки": "walk", "прогулки": "walk",
    "экскурсии": "walk", "природа": "walk",
    # Еда
    "еда": "food", "гастрономия": "food", "кулинария": "food",
    "ресторан": "food", "фудтрак": "food", "маркет": "food",
    # Игры и развлечения
    "квесты": "game", "игры": "game", "развлечения": "game",
    "настольные игры": "game",
    # Лекции и образование
    "лекции": "lecture", "образование": "lecture", "наука": "lecture",
    "воркшоп": "lecture", "мастер-класс": "lecture", "семинар": "lecture",
    # Фестивали и праздники
    "фестивали": "other", "праздники": "other",
}

# ── Маппинг тегов → mood_tags ───────────────────────────────────────────────
TAG_TO_MOOD = {
    "романтика": "романтичный", "для двоих": "романтичный",
    "детям": "семейный", "детские": "семейный",
    "open air": "активный", "спорт": "активный",
    "бесплатно": "бюджетный", "free": "бюджетный",
    "вечеринка": "весёлый", "дискотека": "весёлый",
    "релакс": "спокойный", "медитация": "спокойный",
    "наука": "интеллектуальный", "лекции": "интеллектуальный",
    "еда": "гастрономический", "гастрономия": "гастрономический",
}


def strip_html(text: str) -> str:
    """Убираем HTML-теги из описания."""
    if not text:
        return ""
    clean = re.sub(r'<[^>]+>', '', text)
    clean = re.sub(r'\s+', ' ', clean).strip()
    return clean[:500] if len(clean) > 500 else clean


def parse_price(price_str: str) -> tuple[int, int]:
    """Парсим строку цены → (min, max)."""
    if not price_str or price_str.strip() in ("", "бесплатно", "free"):
        return 0, 0
    numbers = re.findall(r'\d+', price_str.replace(' ', ''))
    if not numbers:
        return 0, 0
    nums = [int(n) for n in numbers if int(n) < 100000]
    if not nums:
        return 0, 0
    return min(nums), max(nums)


# Ключевые слова в названии → категория (fallback)
TITLE_KEYWORDS = {
    "music":   ["концерт", "джаз", "рок", "опера", "симфони", "филармон",
                 "кабаре", "мюзикл", "джазов", "органн", "хор", "фортепиан",
                 "скрипк", "виолончел", "квартет", "ансамбл", "оркестр"],
    "art":     ["выставк", "галере", "музей", "экспозиц", "арт", "живопис",
                 "скульптур", "фотовыставк", "биеннале"],
    "cinema":  ["кино", "фильм", "показ", "кинопоказ", "синема"],
    "sport":   ["спорт", "фитнес", "йога", "пробежк", "заплыв", "турнир"],
    "walk":    ["прогулк", "экскурси", "парк", "набережн", "маршрут"],
    "food":    ["гастро", "дегустац", "кулинар", "шеф", "ужин", "завтрак"],
    "game":    ["квест", "квиз", "настольн", "игр", "vr", "escape"],
    "lecture": ["лекци", "семинар", "воркшоп", "мастер-класс", "тренинг",
                 "конференц", "форум"],
    "other":   ["спектакл", "театр", "шоу", "перформанс", "цирк"],
}


def get_category(tags: list[str], title: str = "") -> str:
    """Определяем категорию по тегам KudaGo, затем по названию."""
    # 1. Сначала пробуем по тегам
    for tag in tags:
        tag_lower = tag.lower()
        if tag_lower in TAG_TO_CATEGORY:
            return TAG_TO_CATEGORY[tag_lower]

    # 2. Fallback — ищем по ключевым словам в названии
    title_lower = title.lower()
    for category, keywords in TITLE_KEYWORDS.items():
        for kw in keywords:
            if kw in title_lower:
                return category

    return "other"


def get_mood_tags(tags: list[str]) -> str:
    """Формируем mood_tags из тегов KudaGo."""
    moods = set()
    for tag in tags:
        tag_lower = tag.lower()
        if tag_lower in TAG_TO_MOOD:
            moods.add(TAG_TO_MOOD[tag_lower])
    return ",".join(moods) if moods else "интересный"


def fetch_events(page: int = 1, page_size: int = 100) -> dict:
    """Загружаем страницу событий с KudaGo API."""
    now = int(time.time())
    url = "https://kudago.com/public-api/v1.4/events/"
    params = {
        "lang": "ru",
        "page": page,
        "page_size": page_size,
        "location": "msk",
        "fields": "id,title,description,place,price,dates,tags,images",
        "expand": "place",
        "actual_since": now,  # только актуальные
        "order_by": "-publication_date",
    }
    try:
        resp = requests.get(url, params=params, timeout=15)
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        print(f"  Ошибка запроса: {e}")
        return {"results": [], "next": None}


def import_events(limit: int = 150, batch_size: int = 100) -> int:
    """Основная функция импорта. Возвращает число добавленных событий."""
    db: Session = SessionLocal()
    added = 0
    skipped = 0
    page = 1

    print(f"Импорт событий KudaGo → TimeWe (лимит: {limit})")
    print("=" * 50)

    try:
        while added < limit:
            print(f"Загружаю страницу {page}...", end=" ")
            data = fetch_events(page=page, page_size=min(batch_size, limit - added))
            results = data.get("results", [])

            if not results:
                print("пусто, завершаю.")
                break

            print(f"получено {len(results)} событий")

            for item in results:
                # Пропускаем без изображений
                images = item.get("images", [])
                if not images:
                    skipped += 1
                    continue

                image_url = images[0].get("image", "") if images else ""
                if not image_url:
                    skipped += 1
                    continue

                # Пропускаем события без дат
                dates = item.get("dates", [])
                if not dates:
                    skipped += 1
                    continue

                # Время начала ближайшего сеанса
                start_ts = dates[0].get("start", 0)
                if start_ts < time.time():
                    skipped += 1
                    continue

                start_dt = datetime.fromtimestamp(start_ts)
                start_time_str = start_dt.strftime("%H:%M:%S")

                # Проверяем дубликат по title
                title = item.get("title", "").strip()
                if not title:
                    skipped += 1
                    continue

                existing = db.query(models.Event).filter(
                    models.Event.title == title
                ).first()
                if existing:
                    skipped += 1
                    continue

                tags = item.get("tags", [])
                category = get_category(tags, title)
                mood_tags = get_mood_tags(tags)
                price_min, price_max = parse_price(item.get("price", ""))

                # Место проведения
                place = item.get("place")
                location = ""
                lat, lon = None, None
                if place and isinstance(place, dict):
                    location = place.get("title", "") or place.get("address", "")
                    coords = place.get("coords")
                    if coords:
                        try:
                            lat = float(coords.get("lat", 0)) or None
                            lon = float(coords.get("lon", 0)) or None
                        except (ValueError, TypeError):
                            pass

                description = strip_html(item.get("description", ""))

                event = models.Event(
                    title=title[:200],
                    description=description,
                    category=category,
                    image_url=image_url[:500],
                    price_min=price_min,
                    price_max=price_max,
                    mood_tags=mood_tags,
                    location=location[:100] if location else None,
                    start_time=start_time_str,
                    duration_hours=2.0,
                    lat=lat,
                    lon=lon,
                )
                db.add(event)
                added += 1

                if added % 10 == 0:
                    db.commit()
                    print(f"  Сохранено {added} событий...")

            db.commit()
            page += 1

            if not data.get("next"):
                print("Достигнут конец списка.")
                break

            time.sleep(0.3)  # чтобы не банили

    finally:
        db.close()

    print("=" * 50)
    print(f"Готово! Добавлено: {added}, пропущено: {skipped}")
    return added


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Импорт событий из KudaGo API")
    parser.add_argument("--limit", type=int, default=150,
                        help="Максимальное число событий для импорта (по умолчанию 150)")
    args = parser.parse_args()

    models.Base.metadata.create_all(bind=engine)
    import_events(limit=args.limit)
