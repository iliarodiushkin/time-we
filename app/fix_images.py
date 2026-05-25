"""
Запуск: docker exec timewe_api python fix_images.py
Обновляет image_url всех событий на реальные Unsplash фото.
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from database import SessionLocal
import models

# Реальные фото с Unsplash (формат ?w=600&q=80 — быстрая загрузка)
IMAGES = {
    "walk": [
        "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600&q=80",
        "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&q=80",
        "https://images.unsplash.com/photo-1455156218388-5e61b526818b?w=600&q=80",
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
        "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=80",
    ],
    "art": [
        "https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=600&q=80",
        "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=600&q=80",
        "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=600&q=80",
        "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=600&q=80",
        "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&q=80",
    ],
    "music": [
        "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600&q=80",
        "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&q=80",
        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&q=80",
        "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&q=80",
        "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&q=80",
    ],
    "food": [
        "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80",
        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80",
        "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80",
        "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80",
        "https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=600&q=80",
        "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=600&q=80",
    ],
    "cinema": [
        "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&q=80",
        "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=600&q=80",
        "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=600&q=80",
    ],
    "sport": [
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80",
        "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80",
        "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=600&q=80",
        "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&q=80",
        "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=600&q=80",
        "https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=600&q=80",
    ],
    "game": [
        "https://images.unsplash.com/photo-1632501641765-e568d28b0015?w=600&q=80",
        "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=600&q=80",
        "https://images.unsplash.com/photo-1556438064-2d7646166914?w=600&q=80",
        "https://images.unsplash.com/photo-1525286716023-a9b3e02f6c16?w=600&q=80",
    ],
    "lecture": [
        "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&q=80",
        "https://images.unsplash.com/photo-1558008258-3256797b43f3?w=600&q=80",
        "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=600&q=80",
    ],
    "other": [
        "https://images.unsplash.com/photo-1529543544282-ea669407fca3?w=600&q=80",
        "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80",
        "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&q=80",
        "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80",
    ],
}

def fix_images():
    db = SessionLocal()
    events = db.query(models.Event).all()

    # счётчики по категориям чтобы чередовать фото
    counters = {cat: 0 for cat in IMAGES}

    updated = 0
    for event in events:
        cat = event.category or "other"
        pool = IMAGES.get(cat, IMAGES["other"])
        idx = counters.get(cat, 0) % len(pool)
        event.image_url = pool[idx]
        counters[cat] = idx + 1
        updated += 1

    db.commit()
    db.close()
    print(f"Обновлено {updated} событий")

if __name__ == "__main__":
    fix_images()