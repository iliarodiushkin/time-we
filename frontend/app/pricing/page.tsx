"use client";
import { useRouter } from "next/navigation";

const P = "#6C5CE7";

const FREE_FEATURES = [
  "Персональная лента ML-рекомендаций",
  "Планировщик дня",
  "Избранное",
  "9 категорий событий",
  "Сброс и перенастройка вкусов",
];

const PREMIUM_FEATURES = [
  "Всё из Free",
  "👥 Совместные планы с друзьями",
  "🔗 Поделиться событием по ссылке",
  "🗓 Кросс-планировщик дня",
  "🔔 Уведомления о событиях",
  "📊 История и статистика досуга",
  "⚡ Приоритетные рекомендации",
];

export default function PricingPage() {
  const router = useRouter();

  return (
    <div style={{ minHeight: "100vh", background: "#F8F7FF", padding: "0 0 60px" }}>
      {/* Хедер */}
      <div style={{ background: "white", borderBottom: "1px solid #E8E6F0", padding: "16px 40px", display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={() => router.back()} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "#636E72" }}>←</button>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: P, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "white", fontWeight: 700, fontSize: 12 }}>T</span>
          </div>
          <span style={{ fontWeight: 700, color: "#2D3436" }}>TimeWe</span>
        </div>
      </div>

      {/* Hero */}
      <div style={{ textAlign: "center", padding: "56px 24px 48px" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: P, letterSpacing: 2, marginBottom: 12, textTransform: "uppercase" }}>
          Тарифы
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 800, color: "#2D3436", lineHeight: 1.2, marginBottom: 16 }}>
          Планируй досуг умнее
        </h1>
        <p style={{ fontSize: 16, color: "#636E72", maxWidth: 480, margin: "0 auto" }}>
          Начни бесплатно — подключи Premium когда захочешь планировать вместе с друзьями
        </p>
      </div>

      {/* Карточки тарифов */}
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}
        className="pricing-grid">
        
        {/* Free */}
        <div style={{ background: "white", borderRadius: 24, padding: 32, border: "2px solid #E8E6F0", display: "flex", flexDirection: "column" }}>
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#636E72", marginBottom: 8 }}>Бесплатно</div>
            <div style={{ fontSize: 42, fontWeight: 800, color: "#2D3436" }}>0 ₽</div>
            <div style={{ fontSize: 13, color: "#636E72" }}>навсегда</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1, marginBottom: 28 }}>
            {FREE_FEATURES.map(f => (
              <div key={f} style={{ display: "flex", gap: 10, fontSize: 14, color: "#2D3436", alignItems: "flex-start" }}>
                <span style={{ color: "#00B894", fontWeight: 700, flexShrink: 0 }}>✓</span>
                {f}
              </div>
            ))}
          </div>

          <button style={{ width: "100%", padding: 14, borderRadius: 14, border: "2px solid #E8E6F0", background: "white", color: "#636E72", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
            Текущий план
          </button>
        </div>

        {/* Premium */}
        <div style={{ background: "linear-gradient(145deg, #6C5CE7, #5040D0)", borderRadius: 24, padding: 32, display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
          {/* Блик */}
          <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
          <div style={{ position: "absolute", bottom: -20, left: -20, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />

          <div style={{ position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.8)" }}>Premium</div>
              <span style={{ background: "rgba(255,255,255,0.2)", color: "white", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999 }}>
                ✨ Популярный
              </span>
            </div>
            <div style={{ fontSize: 42, fontWeight: 800, color: "white" }}>299 ₽</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>в месяц</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1, margin: "24px 0 28px", position: "relative" }}>
            {PREMIUM_FEATURES.map(f => (
              <div key={f} style={{ display: "flex", gap: 10, fontSize: 14, color: "white", alignItems: "flex-start" }}>
                <span style={{ color: "#A29BFE", fontWeight: 700, flexShrink: 0 }}>✓</span>
                {f}
              </div>
            ))}
          </div>

          <button onClick={() => router.push("/checkout")}
            style={{ width: "100%", padding: 14, borderRadius: 14, border: "none", background: "white", color: P, fontSize: 15, fontWeight: 700, cursor: "pointer", position: "relative" }}>
            Подключить Premium →
          </button>
        </div>
      </div>

      {/* FAQ */}
      <div style={{ maxWidth: 600, margin: "48px auto 0", padding: "0 24px" }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#2D3436", textAlign: "center", marginBottom: 24 }}>
          Частые вопросы
        </h2>
        {[
          ["Можно ли отменить подписку?", "Да, в любой момент без штрафов. Доступ сохраняется до конца оплаченного периода."],
          ["Как работает совместный план?", "Ты создаёшь план, получаешь ссылку и отправляешь друзьям. Все участники видят план и могут добавлять события."],
          ["Сколько участников в совместном плане?", "До 10 участников в одном плане. Можно создать неограниченное количество планов."],
        ].map(([q, a]) => (
          <div key={q} style={{ background: "white", borderRadius: 16, padding: 20, marginBottom: 12, border: "1px solid #E8E6F0" }}>
            <div style={{ fontWeight: 600, color: "#2D3436", marginBottom: 6, fontSize: 14 }}>{q}</div>
            <div style={{ fontSize: 13, color: "#636E72", lineHeight: 1.6 }}>{a}</div>
          </div>
        ))}
      </div>

      <style>{`
        @media (max-width: 600px) {
          .pricing-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
