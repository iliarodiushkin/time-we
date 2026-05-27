"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import PremiumModal from "@/components/PremiumModal";

const P = "#6C5CE7", B = "#E8E6F0", M = "#636E72", T = "#2D3436";

const MOCK_PLANS = [
  {
    id: "sp1",
    name: "Выходные с Аней",
    emoji: "🌸",
    color: "#FFE8F0",
    members: [
      { name: "Аня", initials: "АС", color: "#FF6B9D" },
      { name: "Ты", initials: "ТЫ", color: P },
    ],
    events: [
      { title: "Выставка импрессионистов", time: "15:00", location: "Третьяковка", category: "art" },
      { title: "Ужин в Modo", time: "19:30", location: "ул. Петровка, 15", category: "food" },
    ],
    date: "Сб, 24 мая",
  },
  {
    id: "sp2",
    name: "Корпоратив",
    emoji: "🎉",
    color: "#FFF3CD",
    members: [
      { name: "Команда", initials: "К1", color: "#F39C12" },
      { name: "+4", initials: "+4", color: "#636E72" },
    ],
    events: [
      { title: "Квест «Побег из офиса»", time: "18:00", location: "Китай-город", category: "game" },
      { title: "Бар после квеста", time: "21:00", location: "Центр", category: "food" },
    ],
    date: "Пт, 30 мая",
  },
];

const CAT_COLOR: Record<string, string> = {
  art: "#E91E63", food: "#FF9800", game: "#F39C12",
  music: "#9B59B6", cinema: "#2196F3", sport: "#4CAF50",
  walk: "#009688", lecture: "#3F51B5", other: "#607D8B",
};

export default function SharedPlansPage() {
  const router = useRouter();
  const [showPremium, setShowPremium] = useState(false);
  const [selected,    setSelected]    = useState<string | null>(null);

  useEffect(() => {
    if (!localStorage.getItem("token")) router.replace("/login");
  }, [router]);

  const plan = selected ? MOCK_PLANS.find(p => p.id === selected) : null;

  return (
    <div style={{ minHeight: "100vh", background: "#F8F7FF" }}>

      <AppHeader />

      {/* Мобильная панель действий под хедером */}
      <div className="app-header-mobile" style={{
        background: "white", borderBottom: "1px solid #E8E6F0",
        padding: "8px 16px", display: "flex", alignItems: "center", gap: 8
      }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#6C5CE7", background: "#F0EEFF", padding: "4px 12px", borderRadius: 999 }}>✨ Premium</span>
        {!selected && (
          <button onClick={() => setShowPremium(true)}
            style={{ padding: "6px 14px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#6C5CE7,#A29BFE)", color: "white", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            + Создать план
          </button>
        )}
      </div>

      {/* Десктопный rightSlot */}
      <div className="header-desktop" style={{ display: "none" }}>
        <AppHeader
          rightSlot={
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#6C5CE7", background: "#F0EEFF", padding: "3px 10px", borderRadius: 999 }}>Premium</span>
              {!selected && (
                <button onClick={() => setShowPremium(true)}
                  style={{ padding: "7px 16px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#6C5CE7,#A29BFE)", color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                  + Создать план
                </button>
              )}
            </div>
          }
        />
      </div>

      {/* Список планов */}
      {!selected && (
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "32px 24px 48px" }}>
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: T, marginBottom: 6 }}>👥 Совместные планы</h1>
            <p style={{ fontSize: 14, color: M }}>Планируй досуг вместе с друзьями</p>
          </div>

          {/* Баннер Premium */}
          <div style={{ background: "linear-gradient(135deg,#6C5CE7,#A29BFE)", borderRadius: 20, padding: "24px 28px", marginBottom: 28, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.8)", marginBottom: 4 }}>✨ TimeWe Premium</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "white", marginBottom: 4 }}>Планируйте вместе</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.8)" }}>Создавай планы, приглашай друзей по ссылке</div>
            </div>
            <button onClick={() => router.push("/pricing")}
              style={{ flexShrink: 0, padding: "10px 20px", borderRadius: 12, border: "none", background: "white", color: P, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              Подробнее
            </button>
          </div>

          {/* Карточки планов */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {MOCK_PLANS.map(plan => (
              <div key={plan.id}
                onClick={() => setSelected(plan.id)}
                style={{ background: "white", borderRadius: 20, padding: "20px 24px", cursor: "pointer", boxShadow: "0 1px 8px rgba(0,0,0,0.07)", transition: "all 0.15s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 24px rgba(0,0,0,0.1)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 8px rgba(0,0,0,0.07)"; }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 52, height: 52, borderRadius: 16, background: plan.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>
                      {plan.emoji}
                    </div>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: T, marginBottom: 3 }}>{plan.name}</div>
                      <div style={{ fontSize: 12, color: M }}>📅 {plan.date}</div>
                    </div>
                  </div>
                  {/* Аватары участников */}
                  <div style={{ display: "flex", gap: -4 }}>
                    {plan.members.map((m, i) => (
                      <div key={i} style={{ width: 32, height: 32, borderRadius: "50%", background: m.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "white", border: "2px solid white", marginLeft: i > 0 ? -8 : 0 }}>
                        {m.initials}
                      </div>
                    ))}
                  </div>
                </div>

                {/* События */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {plan.events.map((ev, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 10, background: "#F8F7FF" }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: CAT_COLOR[ev.category] || P, flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ fontSize: 13, fontWeight: 500, color: T }}>{ev.title}</span>
                      </div>
                      <span style={{ fontSize: 12, color: M, flexShrink: 0 }}>🕐 {ev.time}</span>
                    </div>
                  ))}
                  <button onClick={e => { e.stopPropagation(); setShowPremium(true); }}
                    style={{ width: "100%", padding: "8px 0", borderRadius: 10, border: "1px dashed #A29BFE", background: "transparent", color: P, fontSize: 12, fontWeight: 500, cursor: "pointer", marginTop: 2 }}>
                    + Добавить событие
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Создать новый */}
          <div onClick={() => setShowPremium(true)}
            style={{ marginTop: 16, background: "white", borderRadius: 20, padding: "20px 24px", cursor: "pointer", border: `2px dashed ${B}`, display: "flex", alignItems: "center", gap: 16, transition: "all 0.15s" }}
            onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = P}
            onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = B}>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: "#F0EEFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>
              +
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: P }}>Создать новый план</div>
              <div style={{ fontSize: 12, color: M }}>Пригласи друзей по ссылке</div>
            </div>
          </div>
        </div>
      )}

      {/* Детальная страница плана */}
      {selected && plan && (
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "32px 24px 48px" }}>
          {/* Hero плана */}
          <div style={{ background: plan.color, borderRadius: 20, padding: "28px 32px", marginBottom: 24, display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ fontSize: 52 }}>{plan.emoji}</div>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: T, marginBottom: 4 }}>{plan.name}</h1>
              <div style={{ fontSize: 13, color: M, marginBottom: 10 }}>📅 {plan.date}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {plan.members.map((m, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, background: "white", borderRadius: 999, padding: "4px 10px 4px 4px" }}>
                    <div style={{ width: 24, height: 24, borderRadius: "50%", background: m.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "white" }}>
                      {m.initials}
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 500, color: T }}>{m.name}</span>
                  </div>
                ))}
                <button onClick={() => setShowPremium(true)}
                  style={{ background: "white", border: "none", borderRadius: 999, padding: "4px 12px", fontSize: 12, color: P, fontWeight: 600, cursor: "pointer" }}>
                  + Пригласить
                </button>
              </div>
            </div>
          </div>

          {/* События плана */}
          <div style={{ background: "white", borderRadius: 20, padding: "24px 28px", marginBottom: 16, boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: T, margin: 0 }}>События плана</h2>
              <button onClick={() => setShowPremium(true)}
                style={{ fontSize: 12, color: P, background: "#F0EEFF", border: "none", borderRadius: 8, padding: "5px 12px", cursor: "pointer", fontWeight: 500 }}>
                + Добавить
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {plan.events.map((ev, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", borderRadius: 14, background: "#F8F7FF" }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: CAT_COLOR[ev.category] || P, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: T }}>{ev.title}</div>
                    <div style={{ fontSize: 12, color: M }}>📍 {ev.location}</div>
                  </div>
                  <div style={{ fontSize: 13, color: M, fontWeight: 500 }}>🕐 {ev.time}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Поделиться */}
          <div onClick={() => setShowPremium(true)}
            style={{ background: "white", borderRadius: 20, padding: "20px 24px", cursor: "pointer", boxShadow: "0 1px 8px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "#F0EEFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
              🔗
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: T }}>Поделиться планом</div>
              <div style={{ fontSize: 12, color: M }}>Скопировать ссылку для приглашения</div>
            </div>
            <span style={{ marginLeft: "auto", color: M, fontSize: 18 }}>›</span>
          </div>
        </div>
      )}

      {showPremium && <PremiumModal feature="Совместное планирование" onClose={() => setShowPremium(false)} />}
    </div>
  );
}
