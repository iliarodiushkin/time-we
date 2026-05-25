"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const P = "#6C5CE7";

export default function CheckoutPage() {
  const router = useRouter();
  const [step, setStep]       = useState<"form" | "success">("form");
  const [loading, setLoading] = useState(false);
  const [form, setForm]       = useState({ card: "", expiry: "", cvv: "", name: "" });

  function formatCard(val: string) {
    return val.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  }
  function formatExpiry(val: string) {
    const digits = val.replace(/\D/g, "").slice(0, 4);
    return digits.length > 2 ? digits.slice(0, 2) + "/" + digits.slice(2) : digits;
  }

  function handleSubmit() {
    if (!form.card || !form.expiry || !form.cvv || !form.name) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); setStep("success"); }, 1800);
  }

  if (step === "success") {
    return (
      <div style={{ minHeight: "100vh", background: "#F8F7FF", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ background: "white", borderRadius: 24, padding: 48, maxWidth: 400, width: "100%", textAlign: "center", boxShadow: "0 8px 40px rgba(108,92,231,0.12)" }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg,#6C5CE7,#A29BFE)", margin: "0 auto 24px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36 }}>
            ✓
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: "#2D3436", marginBottom: 12 }}>Premium активирован!</h2>
          <p style={{ fontSize: 14, color: "#636E72", lineHeight: 1.6, marginBottom: 32 }}>
            Теперь тебе доступны совместные планы, уведомления и вся мощь TimeWe Premium.
          </p>
          <button onClick={() => router.push("/feed")}
            style={{ width: "100%", padding: 14, borderRadius: 14, border: "none", background: "linear-gradient(135deg,#6C5CE7,#A29BFE)", color: "white", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
            Перейти в приложение →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F8F7FF", padding: "0 0 60px" }}>
      {/* Хедер */}
      <div style={{ background: "white", borderBottom: "1px solid #E8E6F0", padding: "16px 40px", display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={() => router.back()} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "#636E72" }}>←</button>
        <span style={{ fontWeight: 700, color: "#2D3436" }}>Оформление подписки</span>
      </div>

      <div style={{ maxWidth: 480, margin: "40px auto", padding: "0 24px" }}>
        {/* Что покупаем */}
        <div style={{ background: "linear-gradient(135deg,#6C5CE7,#A29BFE)", borderRadius: 20, padding: 24, marginBottom: 24, color: "white" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 4 }}>TimeWe Premium</div>
              <div style={{ fontSize: 24, fontWeight: 800 }}>299 ₽ / мес</div>
            </div>
            <span style={{ fontSize: 40 }}>✨</span>
          </div>
          <div style={{ marginTop: 16, fontSize: 13, opacity: 0.85, lineHeight: 1.5 }}>
            👥 Совместные планы · 🔔 Уведомления · 📊 Статистика
          </div>
        </div>

        {/* Форма */}
        <div style={{ background: "white", borderRadius: 20, padding: 28, boxShadow: "0 1px 12px rgba(108,92,231,0.08)" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#2D3436", marginBottom: 20 }}>Данные карты</div>

          {/* Номер карты */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: "#636E72", display: "block", marginBottom: 6 }}>Номер карты</label>
            <div style={{ position: "relative" }}>
              <input
                value={form.card}
                onChange={e => setForm(f => ({ ...f, card: formatCard(e.target.value) }))}
                placeholder="0000 0000 0000 0000"
                style={{ width: "100%", padding: "12px 44px 12px 14px", borderRadius: 12, border: "1px solid #E8E6F0", fontSize: 15, outline: "none", boxSizing: "border-box", letterSpacing: 1 }}
              />
              <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", fontSize: 18 }}>💳</span>
            </div>
          </div>

          {/* Срок и CVV */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            <div>
              <label style={{ fontSize: 12, color: "#636E72", display: "block", marginBottom: 6 }}>Срок действия</label>
              <input
                value={form.expiry}
                onChange={e => setForm(f => ({ ...f, expiry: formatExpiry(e.target.value) }))}
                placeholder="ММ/ГГ"
                style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "1px solid #E8E6F0", fontSize: 15, outline: "none", boxSizing: "border-box" }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "#636E72", display: "block", marginBottom: 6 }}>CVV</label>
              <input
                value={form.cvv}
                onChange={e => setForm(f => ({ ...f, cvv: e.target.value.replace(/\D/g, "").slice(0, 3) }))}
                placeholder="•••"
                type="password"
                style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "1px solid #E8E6F0", fontSize: 15, outline: "none", boxSizing: "border-box" }}
              />
            </div>
          </div>

          {/* Имя */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 12, color: "#636E72", display: "block", marginBottom: 6 }}>Имя держателя</label>
            <input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value.toUpperCase() }))}
              placeholder="IVAN IVANOV"
              style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "1px solid #E8E6F0", fontSize: 14, outline: "none", boxSizing: "border-box", letterSpacing: 1 }}
            />
          </div>

          <button onClick={handleSubmit} disabled={loading}
            style={{ width: "100%", padding: 14, borderRadius: 14, border: "none", background: loading ? "#A29BFE" : "linear-gradient(135deg,#6C5CE7,#A29BFE)", color: "white", fontSize: 15, fontWeight: 700, cursor: loading ? "default" : "pointer", transition: "all 0.2s" }}>
            {loading ? "Обрабатываем..." : "Оплатить 299 ₽"}
          </button>

          <p style={{ fontSize: 11, color: "#B2BEC3", textAlign: "center", marginTop: 14, lineHeight: 1.5 }}>
            🔒 Демо-режим. Данные карты не сохраняются и не передаются.<br />
            Это учебный прототип без реальной оплаты.
          </p>
        </div>
      </div>
    </div>
  );
}
