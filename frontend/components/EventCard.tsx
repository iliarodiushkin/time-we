"use client";
import { useState, useEffect } from "react";
import { Event, interactionsApi } from "@/lib/api";

const CAT_LABEL: Record<string, string> = {
  music: "Концерт", art: "Выставка", cinema: "Кино", sport: "Спорт",
  walk: "Природа", food: "Еда", game: "Игры", lecture: "Лекция", other: "Другое",
};
const CAT_BG: Record<string, string> = {
  music: "#9B59B6", art: "#E91E63", cinema: "#2196F3", sport: "#4CAF50",
  walk: "#009688", food: "#FF9800", game: "#F39C12", lecture: "#3F51B5", other: "#607D8B",
};
const CAT_EMOJI: Record<string, string> = {
  music: "🎵", art: "🎨", cinema: "🎬", sport: "⚽",
  walk: "🌿", food: "🍕", game: "🎮", lecture: "📚", other: "✨",
};

interface Props {
  event: Event;
  onDetails?: () => void;
  onLike?: () => void;
  compact?: boolean;
  isLiked?: boolean;
  dateOverride?: Date; // внешний стейт лайка
}

export default function EventCard({ event, onDetails, onLike, compact, isLiked = false, dateOverride }: Props) {
  const displayDate = dateOverride || new Date();
  const [liked,   setLiked]   = useState(isLiked);
  const [loading, setLoading] = useState(false);

  // Синхронизируем с внешним стейтом
  useEffect(() => { setLiked(isLiked); }, [isLiked]);

  const cat      = event.category || "other";
  const catLabel = CAT_LABEL[cat] || cat;
  const catBg    = CAT_BG[cat]    || "#607D8B";
  const catEmoji = CAT_EMOJI[cat] || "✨";

  const priceText =
    event.price_min === 0 && event.price_max === 0 ? "Бесплатно"
    : event.price_min ? `от ${event.price_min.toLocaleString("ru")} ₽`
    : null;

  async function handleLike(e: React.MouseEvent) {
    e.stopPropagation();
    if (loading) return;
    setLoading(true);
    const next = !liked;
    setLiked(next);
    try {
      await (next ? interactionsApi.like(event.id) : interactionsApi.dislike(event.id));
      onLike?.();
    } catch { setLiked(!next); }
    finally { setLoading(false); }
  }

  return (
    <div onClick={onDetails}
      style={{
        background: "white", borderRadius: 16, overflow: "hidden", cursor: "pointer",
        boxShadow: "0 1px 8px rgba(0,0,0,0.07)", display: "flex", flexDirection: "column",
        transition: "transform 0.15s, box-shadow 0.15s",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 6px 20px rgba(0,0,0,0.11)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 8px rgba(0,0,0,0.07)";
      }}
    >
      {/* Фото */}
      <div style={{ position: "relative", width: "100%", aspectRatio: "16/9", overflow: "hidden", flexShrink: 0 }}>
        {event.image_url
          ? <img src={event.image_url} alt={event.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          : <div style={{ width: "100%", height: "100%", background: "#F0EEFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 }}>{catEmoji}</div>
        }
        <span style={{ position: "absolute", bottom: 8, left: 8, background: catBg, color: "white", fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 999 }}>
          {catLabel}
        </span>
      </div>

      {/* Контент */}
      <div style={{ padding: "10px 12px 12px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 6 }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: "#2D3436", lineHeight: 1.3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", flex: 1 }}>
            {event.title}
          </h3>
          <button onClick={handleLike}
            style={{ flexShrink: 0, width: 28, height: 28, borderRadius: "50%", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", background: liked ? "#6C5CE7" : "transparent", transition: "all 0.15s" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill={liked ? "white" : "none"} stroke={liked ? "white" : "#C8D0D8"} strokeWidth={2}>
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {event.start_time && (
            <span style={{ fontSize: 11, color: "#8E99A4" }}>
              {displayDate.toLocaleDateString("ru", { day: "numeric", month: "long" })}, {String(event.start_time).slice(0,5)}
            </span>
          )}
          {event.location && (
            <span style={{ fontSize: 11, color: "#8E99A4", display: "flex", alignItems: "center", gap: 3 }}>
              <span style={{ color: "#6C5CE7", fontSize: 10 }}>📍</span>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{event.location}</span>
            </span>
          )}
          {priceText && (
            <span style={{ fontSize: 12, fontWeight: 600, color: priceText === "Бесплатно" ? "#00B894" : "#2D3436", marginTop: 2 }}>
              {priceText}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}





