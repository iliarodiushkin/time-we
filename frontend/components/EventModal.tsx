"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Event, interactionsApi, favoritesApi, dayPlanApi } from "@/lib/api";

const CAT_LABEL: Record<string, string> = {
  music: "Концерт", art: "Выставка", cinema: "Кино", sport: "Спорт",
  walk: "Природа", food: "Еда", game: "Игры", lecture: "Лекция", other: "Другое",
};
const CAT_BG: Record<string, string> = {
  music: "#9B59B6", art: "#E91E63", cinema: "#2196F3", sport: "#4CAF50",
  walk: "#009688", food: "#FF9800", game: "#F39C12", lecture: "#3F51B5", other: "#607D8B",
};

interface Props {
  event: Event;
  onClose: () => void;
  onLike?: () => void;       // вызывается только при лайке
  onDislike?: () => void;    // вызывается только при дизлайке
  onAddToDay?: () => void;
  isLiked?: boolean;
}

export default function EventModal({ event, onClose, onLike, onDislike, onAddToDay, isLiked = false }: Props) {
  const [liked,      setLiked]      = useState(isLiked);
  const [saved,      setSaved]      = useState(false);
  const [disliked,   setDisliked]   = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [addedToDay, setAddedToDay] = useState(false);

  useEffect(() => {
    setLiked(isLiked);
    setDisliked(false); // сбрасываем дизлайк при открытии новой карточки
  }, [isLiked, event.id]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const cat      = event.category || "other";
  const catLabel = CAT_LABEL[cat] || cat;
  const catBg    = CAT_BG[cat]    || "#607D8B";

  const priceText =
    event.price_min === 0 && event.price_max === 0 ? "Бесплатно"
    : event.price_min != null && event.price_max != null && event.price_max > 0
    ? `${event.price_min.toLocaleString("ru")} — ${event.price_max.toLocaleString("ru")} ₽`
    : event.price_min ? `от ${event.price_min.toLocaleString("ru")} ₽`
    : null;

  async function handleLike() {
    if (loading) return;
    setLoading(true);
    const next = !liked;
    setLiked(next);
    if (next) setDisliked(false);
    try {
      await (next ? interactionsApi.like(event.id) : interactionsApi.dislike(event.id));
      onLike?.(); // только при лайке — обновляет likedIds в родителе
    } catch { setLiked(!next); }
    finally { setLoading(false); }
  }

  async function handleDislike() {
    if (loading) return;
    setLoading(true);
    setDisliked(true);
    setLiked(false);
    try {
      await interactionsApi.dislike(event.id);
      onDislike?.(); // отдельный колбэк — НЕ добавляет в likedIds
      setTimeout(onClose, 300);
    } catch { setDisliked(false); }
    finally { setLoading(false); }
  }

  async function handleSave() {
    const next = !saved;
    setSaved(next);
    try {
      await (next ? favoritesApi.add(event.id) : favoritesApi.remove(event.id));
    } catch { setSaved(!next); }
  }

  async function handleAddToDay() {
    if (addedToDay) return;
    try {
      await dayPlanApi.add(event.id);
      setAddedToDay(true);
      onAddToDay?.();
      setTimeout(() => setAddedToDay(false), 3000);
    } catch {
      setAddedToDay(true);
      setTimeout(() => setAddedToDay(false), 2000);
    }
  }

  const content = (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }} />

      <div className="modal-panel" style={{ display: "flex", flexDirection: "column", maxHeight: "90dvh" }}>

        {/* Фото */}
        <div style={{ position: "relative", width: "100%", height: 180, flexShrink: 0, overflow: "hidden", borderRadius: "24px 24px 0 0" }}>
          {event.image_url
            ? <img src={event.image_url} alt={event.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : <div style={{ width: "100%", height: "100%", background: "#F0EEFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 64 }}>🎉</div>
          }
          <button onClick={onClose} style={{ position: "absolute", top: 12, left: 12, width: 32, height: 32, borderRadius: "50%", background: "rgba(0,0,0,0.45)", border: "none", cursor: "pointer", color: "white", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
          <button onClick={handleSave} style={{ position: "absolute", top: 12, right: 12, width: 32, height: 32, borderRadius: "50%", background: "rgba(0,0,0,0.45)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill={saved ? "white" : "none"} stroke="white" strokeWidth={2}>
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
          </button>
          <span style={{ position: "absolute", bottom: 10, left: 12, background: catBg, color: "white", fontSize: 11, fontWeight: 600, padding: "3px 12px", borderRadius: 999 }}>{catLabel}</span>
        </div>

        {/* Заголовок + ключевая инфа */}
        <div style={{ padding: "12px 20px 10px", flexShrink: 0, borderBottom: "1px solid #F0EEFF" }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#2D3436", marginBottom: 10, lineHeight: 1.25 }}>
            {event.title}
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {event.start_time && (
              <div style={{ display: "flex", alignItems: "center", gap: 5, background: "#F8F7FF", borderRadius: 8, padding: "6px 12px" }}>
                <span>🕐</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#2D3436" }}>{String(event.start_time).slice(0,5)}</span>
              </div>
            )}
            {event.location && (
              <div style={{ display: "flex", alignItems: "center", gap: 5, background: "#F8F7FF", borderRadius: 8, padding: "6px 12px", maxWidth: 200 }}>
                <span>📍</span>
                <span style={{ fontSize: 13, fontWeight: 500, color: "#2D3436", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{event.location}</span>
              </div>
            )}
            {priceText && (
              <div style={{ display: "flex", alignItems: "center", gap: 5, background: priceText === "Бесплатно" ? "#EDFCF5" : "#F0EEFF", borderRadius: 8, padding: "6px 12px" }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: priceText === "Бесплатно" ? "#00B894" : "#6C5CE7" }}>{priceText}</span>
              </div>
            )}
            {event.duration_hours && (
              <div style={{ display: "flex", alignItems: "center", gap: 5, background: "#F8F7FF", borderRadius: 8, padding: "6px 12px" }}>
                <span>⏱</span>
                <span style={{ fontSize: 13, color: "#636E72" }}>{event.duration_hours} ч.</span>
              </div>
            )}
          </div>
        </div>

        {/* Скролл-контент */}
        <div style={{ overflowY: "auto", flex: 1, padding: "14px 20px 12px", minHeight: 80 }}>
          {event.description && (
            <p style={{ fontSize: 14, color: "#636E72", lineHeight: 1.6, marginBottom: 12 }}>
              {event.description}
            </p>
          )}
          {event.mood_tags && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {event.mood_tags.split(",").map(tag => (
                <span key={tag} style={{ fontSize: 12, padding: "4px 12px", borderRadius: 999, background: "#F0EEFF", color: "#6C5CE7" }}>
                  {tag.trim()}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Действия */}
        <div style={{ padding: "12px 20px 20px", flexShrink: 0 }}>
          <button onClick={handleAddToDay} style={{
            width: "100%", padding: 13, borderRadius: 14, border: "none", cursor: "pointer",
            fontSize: 15, fontWeight: 600, marginBottom: 10, transition: "all 0.2s",
            background: addedToDay ? "#00B894" : "#6C5CE7", color: "white",
          }}>
            {addedToDay ? "✓ Добавлено в Мой день!" : "📅 Добавить в Мой день"}
          </button>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={handleLike} disabled={loading} style={{
              flex: 1, padding: "11px 0", borderRadius: 12, border: "none", cursor: "pointer",
              fontSize: 14, fontWeight: 600, transition: "all 0.15s",
              background: liked ? "#6C5CE7" : "#F0EEFF",
              color: liked ? "white" : "#6C5CE7",
            }}>
              {liked ? "❤️ Нравится" : "🤍 Нравится"}
            </button>
            <button onClick={handleDislike} disabled={loading} style={{
              flex: 1, padding: "11px 0", borderRadius: 12, border: "none", cursor: "pointer",
              fontSize: 14, fontWeight: 600, transition: "all 0.15s",
              background: disliked ? "#FF7675" : "#FFF0F0",
              color: disliked ? "white" : "#FF7675",
            }}>
              ✕ Не интересно
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (typeof window === "undefined") return null;
  return createPortal(content, document.body);
}
