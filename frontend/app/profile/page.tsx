"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { authApi, interactionsApi, favoritesApi, dayPlanApi } from "@/lib/api";
import AppHeader from "@/components/AppHeader";

const P = "#6C5CE7", B = "#E8E6F0", M = "#636E72", T = "#2D3436";

const CAT_LABELS: Record<string, string> = {
  music: "🎵 Концерты", art: "🎨 Выставки", cinema: "🎬 Кино",
  sport: "⚽ Спорт", walk: "🌿 Природа", food: "🍕 Еда",
  game: "🎮 Игры", lecture: "📚 Лекции", other: "✨ Другое",
};

export default function ProfilePage() {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name,    setName]    = useState("");
  const [saved,   setSaved]   = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("token")) router.replace("/login");
  }, [router]);

  const { data: user } = useQuery({
    queryKey: ["me"],
    queryFn:  () => authApi.me().then(r => r.data),
  });
  const { data: interactions = [] } = useQuery({
    queryKey: ["interactions"],
    queryFn:  () => interactionsApi.my().then(r => r.data),
  });
  const { data: favorites = [] } = useQuery({
    queryKey: ["favorites"],
    queryFn:  () => favoritesApi.my().then(r => r.data),
  });
  const { data: dayPlan = [] } = useQuery({
    queryKey: ["day-plan"],
    queryFn:  () => dayPlanApi.getToday().then(r => r.data),
  });

  useEffect(() => {
    if (user?.name) setName(user.name);
  }, [user]);

  const likes    = interactions.filter((i: any) => i.action === "like").length;
  const dislikes = interactions.filter((i: any) => i.action === "dislike").length;
  const categories = user?.onboarding_categories
    ? user.onboarding_categories.split(",").filter(Boolean)
    : [];

  const initials = (user?.name || user?.email || "U")
    .split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);

  function handleSave() {
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 2000);
  }

  const stats = [
    { label: "Лайков",    value: likes,            icon: "❤️" },
    { label: "Сохранено", value: favorites.length, icon: "🔖" },
    { label: "В плане",   value: dayPlan.length,   icon: "📅" },
    { label: "Дизлайков", value: dislikes,          icon: "👎" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#F8F7FF" }}>
      <AppHeader
        rightSlot={
          <button onClick={() => { localStorage.removeItem("token"); router.replace("/login"); }}
            style={{ fontSize: 12, color: M, background: "white", border: `1px solid ${B}`, borderRadius: 8, padding: "6px 14px", cursor: "pointer" }}>
            Выйти
          </button>
        }
      />

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 24px" }}>

        {/* Hero */}
        <div style={{ background: "linear-gradient(135deg, #6C5CE7, #A29BFE)", borderRadius: 24, padding: "36px 40px", display: "flex", alignItems: "center", gap: 28, marginBottom: 24, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -30, right: -30, width: 140, height: 140, borderRadius: "50%", background: "rgba(255,255,255,0.1)" }} />
          <div style={{ position: "absolute", bottom: -20, left: "40%", width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.07)" }} />
          <div style={{ width: 80, height: 80, borderRadius: 22, flexShrink: 0, background: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 800, color: "white", border: "2px solid rgba(255,255,255,0.4)" }}>
            {initials}
          </div>
          <div style={{ flex: 1, position: "relative" }}>
            {editing ? (
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input value={name} onChange={e => setName(e.target.value)}
                  style={{ fontSize: 20, fontWeight: 700, background: "rgba(255,255,255,0.2)", border: "2px solid rgba(255,255,255,0.4)", borderRadius: 10, padding: "6px 12px", color: "white", outline: "none", flex: 1 }} autoFocus />
                <button onClick={handleSave} style={{ background: "rgba(255,255,255,0.3)", border: "none", borderRadius: 8, padding: "6px 14px", color: "white", fontWeight: 600, cursor: "pointer", fontSize: 13 }}>
                  Сохранить
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <h1 style={{ fontSize: 22, fontWeight: 800, color: "white", margin: 0 }}>{name || "Пользователь"}</h1>
                <button onClick={() => setEditing(true)} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 6, padding: "3px 8px", cursor: "pointer", fontSize: 11, color: "white" }}>✏️</button>
              </div>
            )}
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", marginTop: 4 }}>{user?.email}</div>
            {saved && <div style={{ fontSize: 12, color: "rgba(255,255,255,0.9)", marginTop: 6, background: "rgba(0,184,148,0.3)", borderRadius: 6, padding: "2px 10px", display: "inline-block" }}>✓ Сохранено</div>}
          </div>
        </div>

        {/* Статистика */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
          {stats.map(s => (
            <div key={s.label} style={{ background: "white", borderRadius: 16, padding: "18px 16px", textAlign: "center", boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
              <div style={{ fontSize: 26, marginBottom: 6 }}>{s.icon}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: T, marginBottom: 2 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: M }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Категории */}
        <div style={{ background: "white", borderRadius: 20, padding: "24px 28px", marginBottom: 24, boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: T, margin: 0 }}>Мои предпочтения</h2>
            <button onClick={() => router.push("/onboarding")} style={{ fontSize: 12, color: P, background: "#F0EEFF", border: "none", borderRadius: 8, padding: "5px 12px", cursor: "pointer", fontWeight: 500 }}>
              Изменить
            </button>
          </div>
          {categories.length > 0 ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {categories.map((cat: string) => (
                <span key={cat} style={{ fontSize: 13, padding: "6px 14px", borderRadius: 999, background: "#F0EEFF", color: P, fontWeight: 500 }}>
                  {CAT_LABELS[cat] || cat}
                </span>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <p style={{ fontSize: 13, color: M, marginBottom: 12 }}>Категории не выбраны</p>
              <button onClick={() => router.push("/onboarding")} style={{ fontSize: 13, color: P, background: "#F0EEFF", border: "none", borderRadius: 10, padding: "8px 18px", cursor: "pointer" }}>
                Настроить предпочтения
              </button>
            </div>
          )}
        </div>

        {/* Быстрые ссылки */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            { icon: "🔖", label: "Избранное", sub: `${favorites.length} событий`, href: "/favorites", color: "#FFF3CD" },
            { icon: "👥", label: "Совместные планы", sub: "Premium", href: "/shared-plans", color: "#F0EEFF" },
          ].map(item => (
            <div key={item.label} onClick={() => router.push(item.href)}
              style={{ background: "white", borderRadius: 16, padding: "20px", cursor: "pointer", boxShadow: "0 1px 8px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: 14, transition: "transform 0.15s" }}
              onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)"}
              onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: item.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                {item.icon}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: T }}>{item.label}</div>
                <div style={{ fontSize: 12, color: M }}>{item.sub}</div>
              </div>
              <span style={{ marginLeft: "auto", color: M, fontSize: 18 }}>›</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
