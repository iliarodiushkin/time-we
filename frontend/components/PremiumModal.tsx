"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { createPortal } from "react-dom";

interface Props {
  onClose: () => void;
  feature?: string;
}

export default function PremiumModal({ onClose, feature = "Совместное планирование" }: Props) {
  const router = useRouter();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const content = (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "80px 24px",
    }}>
      {/* Оверлей */}
      <div onClick={onClose} style={{
        position: "absolute", inset: 0,
        background: "rgba(0,0,0,0.65)",
        backdropFilter: "blur(8px)",
      }} />

      {/* Панель */}
      <div style={{
        position: "relative",
        background: "white",
        borderRadius: 28,
        padding: "44px 44px 36px",
        maxWidth: 540,
        width: "100%",
        textAlign: "center",
        boxShadow: "0 32px 80px rgba(108,92,231,0.35)",
        animation: "premiumIn 0.22s cubic-bezier(0.34,1.56,0.64,1)",
      }}>
        <style>{`
          @keyframes premiumIn {
            from { opacity: 0; transform: scale(0.92) translateY(12px); }
            to   { opacity: 1; transform: scale(1)    translateY(0);    }
          }
        `}</style>

        {/* Иконка */}
        <div style={{
          width: 72, height: 72, borderRadius: 22,
          margin: "0 auto 20px",
          background: "linear-gradient(135deg, #6C5CE7, #A29BFE)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 34, boxShadow: "0 8px 24px rgba(108,92,231,0.35)",
        }}>
          ✨
        </div>

        {/* Лейбл */}
        <div style={{
          fontSize: 11, fontWeight: 700, color: "#6C5CE7",
          letterSpacing: 2.5, marginBottom: 10,
          textTransform: "uppercase", textAlign: "center",
        }}>
          TimeWe Premium
        </div>

        {/* Заголовок */}
        <h2 style={{
          fontSize: 24, fontWeight: 800, color: "#2D3436",
          marginBottom: 12, lineHeight: 1.25,
          textAlign: "center",
        }}>
          {feature} —<br />Premium-функция
        </h2>

        {/* Подзаголовок */}
        <p style={{
          fontSize: 14, color: "#636E72", lineHeight: 1.65,
          marginBottom: 24, textAlign: "center",
          maxWidth: 380, margin: "0 auto 24px",
        }}>
          Планируй досуг вместе с друзьями, создавай совместные планы и делись событиями. Доступно в Premium-подписке.
        </p>

        {/* Фичи */}
        <div style={{
          background: "#F8F7FF", borderRadius: 16,
          padding: "14px 20px", marginBottom: 24,
          textAlign: "left",
        }}>
          {[
            "👥 Совместные планы с друзьями",
            "🔗 Поделиться событием по ссылке",
            "🗓 Кросс-планировщик дня",
            "🔔 Уведомления о событиях",
            "📊 История и статистика",
          ].map(f => (
            <div key={f} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "6px 0", fontSize: 13, color: "#2D3436",
            }}>
              <span style={{ color: "#6C5CE7", fontWeight: 700, fontSize: 14 }}>✓</span>
              {f}
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={() => { onClose(); router.push("/pricing"); }}
          style={{
            width: "100%", padding: "14px 0", borderRadius: 14,
            border: "none", cursor: "pointer",
            background: "linear-gradient(135deg, #6C5CE7, #A29BFE)",
            color: "white", fontSize: 15, fontWeight: 700,
            marginBottom: 12, textAlign: "center",
            boxShadow: "0 4px 16px rgba(108,92,231,0.4)",
            transition: "opacity 0.15s",
          }}
          onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.opacity = "0.9"}
          onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.opacity = "1"}
        >
          Попробовать Premium →
        </button>

        <button onClick={onClose} style={{
          background: "none", border: "none", cursor: "pointer",
          fontSize: 13, color: "#B2BEC3", display: "block",
          width: "100%", textAlign: "center", padding: "4px 0",
        }}>
          Может быть позже
        </button>
      </div>
    </div>
  );

  // Portal — рендерим прямо в body, поверх всего включая хедер
  if (typeof window === "undefined") return null;
  return createPortal(content, document.body);
}
