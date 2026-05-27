"use client";
import { useState } from "react";
import { createPortal } from "react-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { dayPlanApi, DayPlanItem } from "@/lib/api";

const P = "#6C5CE7", B = "#E8E6F0", M = "#636E72", T = "#2D3436";

export default function DayPlanFAB() {
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();

  const { data: dayPlan = [], isLoading } = useQuery<DayPlanItem[]>({
    queryKey: ["day-plan"],
    queryFn: () => dayPlanApi.getToday().then(r => r.data),
  });

  async function remove(eventId: number) {
    await dayPlanApi.remove(eventId);
    qc.invalidateQueries({ queryKey: ["day-plan"] });
  }

  const now = new Date();
  const count = dayPlan.length;

  // Определяем прошедшие события по start_time
  function isPast(item: DayPlanItem) {
    if (!item.event.start_time) return false;
    const [h, m] = String(item.event.start_time).split(":").map(Number);
    const eventTime = new Date();
    eventTime.setHours(h, m, 0, 0);
    return eventTime < now;
  }

  const drawer = open ? (
    <div style={{ position: "fixed", inset: 0, zIndex: 9998 }}>
      {/* Оверлей */}
      <div onClick={() => setOpen(false)} style={{
        position: "absolute", inset: 0,
        background: "rgba(0,0,0,0.4)", backdropFilter: "blur(2px)"
      }} />

      {/* Drawer снизу */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        background: "white", borderRadius: "24px 24px 0 0",
        padding: "0 0 calc(24px + env(safe-area-inset-bottom))",
        maxHeight: "80dvh", display: "flex", flexDirection: "column",
        boxShadow: "0 -8px 40px rgba(0,0,0,0.15)",
      }}>
        {/* Хэндл */}
        <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 4px" }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: B }} />
        </div>

        {/* Заголовок */}
        <div style={{ padding: "8px 20px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${B}` }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 17, color: T }}>📅 Мой день</div>
            <div style={{ fontSize: 12, color: M, marginTop: 2 }}>
              {now.toLocaleDateString("ru", { day: "numeric", month: "long" })}
            </div>
          </div>
          <button onClick={() => setOpen(false)} style={{ width: 32, height: 32, borderRadius: "50%", border: "none", background: "#F8F7FF", cursor: "pointer", fontSize: 14, color: M }}>✕</button>
        </div>

        {/* Список */}
        <div style={{ overflowY: "auto", flex: 1, padding: "12px 20px" }}>
          {isLoading && (
            <div style={{ height: 60, background: "#F8F7FF", borderRadius: 12 }} />
          )}

          {!isLoading && dayPlan.length === 0 && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "32px 0", gap: 12 }}>
              <div style={{ fontSize: 48 }}>📅</div>
              <p style={{ fontSize: 14, color: M, textAlign: "center", lineHeight: 1.5 }}>
                Нажми «Добавить в Мой день»<br />в карточке события
              </p>
            </div>
          )}

          {!isLoading && dayPlan.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {dayPlan.map(item => {
                const past = isPast(item);
                return (
                  <div key={item.id} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "10px 12px", borderRadius: 14,
                    background: past ? "#F5F5F5" : "#F8F7FF",
                    opacity: past ? 0.6 : 1,
                    transition: "all 0.2s",
                  }}>
                    {item.event.image_url && (
                      <img src={item.event.image_url} alt="" style={{
                        width: 44, height: 44, borderRadius: 10,
                        objectFit: "cover", flexShrink: 0,
                        filter: past ? "grayscale(100%)" : "none",
                      }} />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: past ? M : T, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {past && <span style={{ marginRight: 4 }}>✓</span>}
                        {item.event.title}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
                        {item.event.start_time && (
                          <span style={{ fontSize: 11, color: past ? "#B2BEC3" : M }}>
                            🕐 {String(item.event.start_time).slice(0, 5)}
                          </span>
                        )}
                        {item.event.location && (
                          <span style={{ fontSize: 11, color: past ? "#B2BEC3" : M, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            📍 {item.event.location}
                          </span>
                        )}
                      </div>
                    </div>
                    <button onClick={() => remove(item.event_id)} style={{
                      flexShrink: 0, width: 24, height: 24, borderRadius: "50%",
                      border: "none", background: "#E8E6F0", cursor: "pointer",
                      fontSize: 11, color: M, display: "flex", alignItems: "center", justifyContent: "center"
                    }}>✕</button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      {/* FAB кнопка */}
      <div className="day-plan-fab">
        <button onClick={() => setOpen(true)} style={{
          width: 56, height: 56, borderRadius: "50%",
          background: "linear-gradient(135deg, #6C5CE7, #A29BFE)",
          border: "none", cursor: "pointer",
          boxShadow: "0 4px 20px rgba(108,92,231,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center",
          position: "relative",
        }}>
          <span style={{ fontSize: 24 }}>📅</span>
          {count > 0 && (
            <div style={{
              position: "absolute", top: -2, right: -2,
              width: 20, height: 20, borderRadius: "50%",
              background: "#FF7675", border: "2px solid white",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 10, fontWeight: 700, color: "white",
            }}>
              {count}
            </div>
          )}
        </button>
      </div>

      {typeof window !== "undefined" && drawer
        ? createPortal(drawer, document.body)
        : null}
    </>
  );
}
