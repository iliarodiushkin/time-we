"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { favoritesApi, interactionsApi } from "@/lib/api";
import EventCard from "@/components/EventCard";
import EventModal from "@/components/EventModal";
import AppHeader from "@/components/AppHeader";

const P = "#6C5CE7", B = "#E8E6F0", M = "#636E72", T = "#2D3436";

export default function FavoritesPage() {
  const router = useRouter();
  const qc     = useQueryClient();
  const [modal,    setModal]    = useState<any>(null);
  const [likedIds, setLikedIds] = useState<Set<number>>(new Set());
  const [searchQ,  setSearchQ]  = useState("");

  useEffect(() => {
    if (!localStorage.getItem("token")) router.replace("/login");
  }, [router]);

  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ["favorites"],
    queryFn:  () => favoritesApi.my().then(r => r.data),
  });

  const { data: myInteractions = [] } = useQuery({
    queryKey: ["interactions"],
    queryFn:  () => interactionsApi.my().then(r => r.data),
  });

  useEffect(() => {
    const ids = new Set(
      myInteractions
        .filter((i: any) => i.action === "like")
        .map((i: any) => i.event_id as number)
    );
    setLikedIds(ids);
  }, [myInteractions]);

  const allEvents = favorites.map((f: any) => f.event).filter(Boolean);

  const events = searchQ.trim()
    ? allEvents.filter((e: any) =>
        e.title?.toLowerCase().includes(searchQ.toLowerCase()) ||
        e.location?.toLowerCase().includes(searchQ.toLowerCase()))
    : allEvents;

  function onLike(id?: number) {
    if (id) setLikedIds(prev => { const next = new Set(prev); next.add(id); return next; });
    // Инвалидируем и ленту и взаимодействия
    setTimeout(() => {
      qc.invalidateQueries({ queryKey: ["interactions"] });
      qc.invalidateQueries({ queryKey: ["feed"] });
    }, 600);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F8F7FF" }}>
      <AppHeader
        showSearch={allEvents.length > 0}
        searchValue={searchQ}
        onSearch={setSearchQ}
      />

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 40px 48px" }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: T, marginBottom: 6 }}>🔖 Избранное</h1>
          <p style={{ fontSize: 14, color: M }}>
            {allEvents.length > 0
              ? `${allEvents.length} сохранённых ${allEvents.length === 1 ? "событие" : allEvents.length < 5 ? "события" : "событий"}`
              : "Сохраняй понравившиеся события"}
          </p>
        </div>

        {isLoading && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: 18 }}>
            {[1,2,3,4].map(i => <div key={i} style={{ background: "white", borderRadius: 16, height: 260 }} />)}
          </div>
        )}

        {!isLoading && allEvents.length === 0 && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 400, gap: 16, textAlign: "center" }}>
            <div style={{ width: 100, height: 100, borderRadius: 28, background: "#F0EEFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 44 }}>🔖</div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: T }}>Пока ничего нет</h2>
            <p style={{ fontSize: 14, color: M, maxWidth: 300, lineHeight: 1.6 }}>
              Открывай карточку события и нажимай на закладку в правом верхнем углу
            </p>
            <button onClick={() => router.push("/feed")}
              style={{ marginTop: 8, padding: "12px 28px", borderRadius: 14, border: "none", background: P, color: "white", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
              Перейти в ленту
            </button>
          </div>
        )}

        {!isLoading && allEvents.length > 0 && events.length === 0 && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 80, gap: 12 }}>
            <span style={{ fontSize: 48 }}>🔍</span>
            <p style={{ fontWeight: 600, color: T }}>Ничего не найдено</p>
            <button onClick={() => setSearchQ("")} style={{ background: "#F0EEFF", color: P, border: "none", borderRadius: 12, padding: "8px 18px", cursor: "pointer", fontSize: 13 }}>Очистить поиск</button>
          </div>
        )}

        {!isLoading && events.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: 18 }}>
            {events.map((event: any) => (
              <div key={event.id} style={{ position: "relative" }}>
                <EventCard event={event} compact
                  isLiked={likedIds.has(event.id)}
                  onDetails={() => setModal(event)}
                  onLike={() => onLike(event.id)}
                />
                {/* Кнопка удаления из избранного */}
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    await favoritesApi.remove(event.id);
                    qc.invalidateQueries({ queryKey: ["favorites"] });
                  }}
                  style={{
                    position: "absolute", top: 8, left: 8,
                    width: 28, height: 28, borderRadius: "50%",
                    background: "rgba(0,0,0,0.5)", border: "none",
                    cursor: "pointer", color: "white", fontSize: 12,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    zIndex: 2,
                  }}
                  title="Удалить из избранного"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal && (
        <EventModal event={modal} isLiked={likedIds.has(modal.id)}
          onClose={() => setModal(null)}
          onLike={() => onLike(modal.id)}
        />
      )}
    </div>
  );
}
