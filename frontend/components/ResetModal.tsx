"use client";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";

interface Props {
  onClose: () => void;
  onReset: () => void;
}

export default function ResetModal({ onClose, onReset }: Props) {
  const router = useRouter();

  function handleReset() {
    onReset();
    onClose();
  }

  function handleResetAndOnboarding() {
    onReset();
    onClose();
    router.push("/onboarding");
  }

  const content = (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }} />
      <div style={{
        position: "relative", background: "white", borderRadius: 24, padding: "32px 32px 24px",
        maxWidth: 420, width: "100%", textAlign: "center",
        boxShadow: "0 24px 60px rgba(0,0,0,0.15)",
        animation: "resetIn 0.2s ease-out",
      }}>
        <style>{`@keyframes resetIn { from { opacity:0; transform:scale(0.95); } to { opacity:1; transform:scale(1); } }`}</style>

        <div style={{ fontSize: 48, marginBottom: 16 }}>🔄</div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#2D3436", marginBottom: 8 }}>
          Сбросить вкусы?
        </h2>
        <p style={{ fontSize: 14, color: "#636E72", lineHeight: 1.6, marginBottom: 24 }}>
          Лента начнёт показывать популярные события. Хочешь сразу заново указать предпочтения чтобы лента сразу подстроилась?
        </p>

        {/* Кнопка 1 — сброс + онбординг */}
        <button onClick={handleResetAndOnboarding} style={{
          width: "100%", padding: 13, borderRadius: 14, border: "none", cursor: "pointer",
          background: "linear-gradient(135deg,#6C5CE7,#A29BFE)", color: "white",
          fontSize: 14, fontWeight: 700, marginBottom: 10,
        }}>
          ✨ Сбросить и выбрать новые интересы
        </button>

        {/* Кнопка 2 — просто сброс */}
        <button onClick={handleReset} style={{
          width: "100%", padding: 13, borderRadius: 14, border: "1px solid #E8E6F0",
          cursor: "pointer", background: "white", color: "#636E72",
          fontSize: 14, fontWeight: 500, marginBottom: 10,
        }}>
          Сбросить без изменений
        </button>

        {/* Отмена */}
        <button onClick={onClose} style={{
          background: "none", border: "none", cursor: "pointer",
          fontSize: 13, color: "#B2BEC3",
        }}>
          Отмена
        </button>
      </div>
    </div>
  );

  if (typeof window === "undefined") return null;
  return createPortal(content, document.body);
}
