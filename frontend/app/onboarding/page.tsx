"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";

const P = "#6C5CE7";

const CATS = [
  { id: "music",   label: "Концерты",  emoji: "🎵", color: "#9B59B6", bg: "#F5EEFF" },
  { id: "art",     label: "Выставки",  emoji: "🎨", color: "#E91E63", bg: "#FFF0F5" },
  { id: "cinema",  label: "Кино",      emoji: "🎬", color: "#2196F3", bg: "#EEF7FF" },
  { id: "sport",   label: "Спорт",     emoji: "⚽", color: "#4CAF50", bg: "#F0FFF4" },
  { id: "walk",    label: "Природа",   emoji: "🌿", color: "#009688", bg: "#EDFAF8" },
  { id: "food",    label: "Еда",       emoji: "🍕", color: "#FF9800", bg: "#FFF8EE" },
  { id: "game",    label: "Игры",      emoji: "🎮", color: "#F39C12", bg: "#FFFAEE" },
  { id: "lecture", label: "Лекции",    emoji: "📚", color: "#3F51B5", bg: "#EEF0FF" },
  { id: "other",   label: "Другое",    emoji: "✨", color: "#607D8B", bg: "#F0F4F8" },
];

export default function OnboardingPage() {
  const router  = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading,  setLoading]  = useState(false);

  function toggle(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function handleSubmit() {
    setLoading(true);
    try {
      await authApi.onboarding(Array.from(selected));
    } catch {}
    router.push("/feed");
  }

  const count = selected.size;

  return (
    <div style={{ minHeight: "100vh", background: "#F8F7FF", display: "flex", flexDirection: "column" }}>

      {/* Хедер */}
      <div style={{ padding: "20px 40px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: P, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "white", fontWeight: 700, fontSize: 13 }}>T</span>
          </div>
          <span style={{ fontWeight: 700, color: "#2D3436", fontSize: 15 }}>TimeWe</span>
        </div>
        <button onClick={() => router.push("/feed")}
          style={{ fontSize: 13, color: "#636E72", background: "none", border: "none", cursor: "pointer" }}>
          Пропустить →
        </button>
      </div>

      {/* Контент */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 24px 120px" }}>

        {/* Заголовок */}
        <div style={{ textAlign: "center", marginBottom: 40, maxWidth: 480 }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🎯</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#2D3436", marginBottom: 10, lineHeight: 1.2 }}>
            Что тебе интересно?
          </h1>
          <p style={{ fontSize: 15, color: "#636E72", lineHeight: 1.6 }}>
            Выбери категории — лента подстроится под тебя
          </p>
        </div>

        {/* Сетка категорий */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, maxWidth: 540, width: "100%" }}>
          {CATS.map(cat => {
            const active = selected.has(cat.id);
            return (
              <button key={cat.id} onClick={() => toggle(cat.id)}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  gap: 10, padding: "20px 16px", borderRadius: 18, cursor: "pointer",
                  border: `2px solid ${active ? cat.color : "#E8E6F0"}`,
                  background: active ? cat.bg : "white",
                  transition: "all 0.15s",
                  position: "relative",
                  boxShadow: active ? `0 4px 16px ${cat.color}30` : "0 1px 4px rgba(0,0,0,0.06)",
                }}>
                {/* Чекмарк */}
                {active && (
                  <div style={{
                    position: "absolute", top: 8, right: 8,
                    width: 20, height: 20, borderRadius: "50%",
                    background: cat.color, display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, color: "white", fontWeight: 700,
                  }}>✓</div>
                )}
                <span style={{ fontSize: 32 }}>{cat.emoji}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: active ? cat.color : "#636E72" }}>
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Фиксированная нижняя кнопка */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        padding: "16px 24px 32px", background: "rgba(248,247,255,0.97)",
        backdropFilter: "blur(8px)", borderTop: "1px solid #E8E6F0",
      }}>
        <div style={{ maxWidth: 540, margin: "0 auto" }}>
          <button onClick={handleSubmit} disabled={loading}
            style={{
              width: "100%", padding: 15, borderRadius: 16, border: "none",
              cursor: count === 0 ? "default" : "pointer",
              background: count === 0
                ? "#E8E6F0"
                : "linear-gradient(135deg,#6C5CE7,#A29BFE)",
              color: count === 0 ? "#B2BEC3" : "white",
              fontSize: 15, fontWeight: 700, transition: "all 0.2s",
            }}>
            {loading ? "Сохраняем..." : count === 0 ? "Пропустить" : `Продолжить (${count})`}
          </button>
        </div>
      </div>
    </div>
  );
}
