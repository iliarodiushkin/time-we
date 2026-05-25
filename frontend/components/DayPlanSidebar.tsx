"use client";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { dayPlanApi, DayPlanItem, Event } from "@/lib/api";
import PremiumModal from "@/components/PremiumModal";

// Моковые данные совместных планов (заглушка Premium)
const MOCK_SHARED_PLANS = [
  {
    id: "sp1",
    name: "Выходные с Аней",
    emoji: "🌸",
    members: ["Аня", "Ты"],
    events: [
      { title: "Выставка импрессионистов", time: "15:00", location: "Третьяковка" },
      { title: "Ужин в Мodo", time: "19:30", location: "ул. Петровка, 15" },
    ],
  },
  {
    id: "sp2",
    name: "Корпоратив",
    emoji: "🎉",
    members: ["Команда (5)"],
    events: [
      { title: "Квест «Побег из офиса»", time: "18:00", location: "Китай-город" },
    ],
  },
];

interface Props {
  events: Event[];
  onEventClick: (event: Event) => void;
}

export default function DayPlanSidebar({ events, onEventClick }: Props) {
  const qc = useQueryClient();
  const [slide, setSlide]           = useState(0); // 0 = личный, 1+ = совместные
  const [showPremium, setShowPremium] = useState(false);

  const { data: dayPlan = [], isLoading } = useQuery<DayPlanItem[]>({
    queryKey: ["day-plan"],
    queryFn: () => dayPlanApi.getToday().then(r => r.data),
  });

  const totalSlides = 1 + MOCK_SHARED_PLANS.length;
  const isPersonal  = slide === 0;
  const sharedPlan  = isPersonal ? null : MOCK_SHARED_PLANS[slide - 1];

  function prev() { setSlide(s => Math.max(0, s - 1)); }
  function next() {
    if (slide === 0) {
      // Переход к совместным — показываем Premium
      setShowPremium(true);
    } else {
      setSlide(s => Math.min(totalSlides - 1, s + 1));
    }
  }

  async function removeFromPlan(eventId: number) {
    await dayPlanApi.remove(eventId);
    qc.invalidateQueries({ queryKey: ["day-plan"] });
  }

  return (
    <>
      <div style={{ background: "white", borderRadius: 20, padding: 20, boxShadow: "0 1px 12px rgba(108,92,231,0.08)" }}>

        {/* Заголовок с навигацией */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontWeight: 700, color: "#2D3436", fontSize: 15 }}>
              {isPersonal ? "Мой день" : sharedPlan!.name}
            </span>
            {!isPersonal && (
              <span style={{ fontSize: 11, background: "linear-gradient(135deg,#6C5CE7,#A29BFE)", color: "white", padding: "2px 8px", borderRadius: 999, fontWeight: 600 }}>
                Premium
              </span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {/* Точки-индикаторы */}
            <div style={{ display: "flex", gap: 4, marginRight: 8 }}>
              {Array.from({ length: totalSlides }).map((_, i) => (
                <div key={i} style={{
                  width: i === slide ? 16 : 6, height: 6, borderRadius: 3,
                  background: i === slide ? "#6C5CE7" : "#E8E6F0",
                  transition: "all 0.2s", cursor: "pointer",
                }} onClick={() => i === 0 ? setSlide(0) : setShowPremium(true)} />
              ))}
            </div>
            {slide > 0 && (
              <button onClick={prev} style={{ width: 26, height: 26, borderRadius: "50%", border: "1px solid #E8E6F0", background: "white", cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", color: "#636E72" }}>‹</button>
            )}
            <button onClick={next} style={{ width: 26, height: 26, borderRadius: "50%", border: "1px solid #E8E6F0", background: "white", cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", color: "#636E72" }}>›</button>
          </div>
        </div>

        {/* ── Личный план ── */}
        {isPersonal && (
          <>
            <div style={{ fontSize: 11, color: "#636E72", marginBottom: 12 }}>
              {new Date().toLocaleDateString("ru", { day: "numeric", month: "long" })}
            </div>

            {isLoading && <div style={{ height: 60, background: "#F8F7FF", borderRadius: 12 }} />}

            {!isLoading && dayPlan.length === 0 && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "12px 0", gap: 8 }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: "#F0EEFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>📅</div>
                <p style={{ fontSize: 12, color: "#636E72", textAlign: "center", lineHeight: 1.5 }}>
                  Нажми «Добавить в Мой день» в карточке события
                </p>
              </div>
            )}

            {!isLoading && dayPlan.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {dayPlan.map(item => (
                  <div key={item.id} onClick={() => onEventClick(item.event)}
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 12, background: "#F8F7FF", cursor: "pointer" }}
                    onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "#F0EEFF"}
                    onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "#F8F7FF"}
                  >
                    {item.event.image_url && (
                      <img src={item.event.image_url} alt="" style={{ width: 38, height: 38, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#2D3436", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {item.event.title}
                      </div>
                      {item.event.start_time && (
                        <div style={{ fontSize: 11, color: "#636E72" }}>🕐 {item.event.start_time.slice(0, 5)}</div>
                      )}
                    </div>
                    <button onClick={async e => { e.stopPropagation(); await removeFromPlan(item.event_id); }}
                      style={{ flexShrink: 0, width: 20, height: 20, borderRadius: "50%", border: "none", background: "#E8E6F0", cursor: "pointer", fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "#636E72" }}>
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Кнопка добавить + планировать вместе */}
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <button style={{ flex: 1, fontSize: 12, fontWeight: 500, color: "#6C5CE7", background: "#F0EEFF", border: "none", borderRadius: 10, padding: "8px 0", cursor: "pointer" }}>
                + Добавить вручную
              </button>
              <button onClick={() => setShowPremium(true)}
                style={{ flex: 1, fontSize: 12, fontWeight: 500, color: "white", background: "linear-gradient(135deg,#6C5CE7,#A29BFE)", border: "none", borderRadius: 10, padding: "8px 0", cursor: "pointer" }}>
                👥 Вместе
              </button>
            </div>
          </>
        )}

        {/* ── Пустое состояние при переходе (не должно быть видно) ── */}
        {!isPersonal && !sharedPlan && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 0", gap: 8 }}>
            <div style={{ fontSize: 36 }}>👥</div>
            <p style={{ fontSize: 12, color: "#636E72", textAlign: "center" }}>Совместные планы</p>
          </div>
        )}

        {/* ── Совместный план (заглушка) ── */}
        {!isPersonal && sharedPlan && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 24 }}>{sharedPlan.emoji}</span>
              <div>
                <div style={{ fontSize: 11, color: "#636E72" }}>Участники: {sharedPlan.members.join(", ")}</div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
              {sharedPlan.events.map((ev, i) => (
                <div key={i} style={{ padding: "10px 12px", borderRadius: 12, background: "#F8F7FF", cursor: "pointer" }}
                  onClick={() => setShowPremium(true)}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#2D3436", marginBottom: 2 }}>{ev.title}</div>
                  <div style={{ fontSize: 11, color: "#636E72" }}>🕐 {ev.time} · 📍 {ev.location}</div>
                </div>
              ))}
            </div>

            <button onClick={() => setShowPremium(true)}
              style={{ width: "100%", padding: "9px 0", borderRadius: 12, border: "1px dashed #A29BFE", background: "transparent", color: "#6C5CE7", fontSize: 12, fontWeight: 500, cursor: "pointer" }}>
              + Добавить событие в план
            </button>
          </>
        )}
      </div>

      {showPremium && <PremiumModal onClose={() => setShowPremium(false)} />}
    </>
  );
}
