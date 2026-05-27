"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authApi } from "@/lib/api";

const P = "#6C5CE7", B = "#E8E6F0", M = "#636E72", T = "#2D3436";

export default function RegisterPage() {
  const router = useRouter();
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [agreed,   setAgreed]   = useState(false);
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);

  async function handleSubmit() {
    if (!agreed) { setError("Необходимо согласиться с условиями"); return; }
    setError("");
    setLoading(true);
    try {
      const res = await authApi.register(email, password, name);
      localStorage.setItem("token", res.data.access_token);
      router.replace("/onboarding");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Ошибка регистрации");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = (focused?: boolean) => ({
    width: "100%", padding: "14px 16px", borderRadius: 16,
    border: `1.5px solid ${focused ? P : B}`,
    background: "white", fontSize: 15, color: T,
    outline: "none", transition: "border 0.15s",
  });

  return (
    <div style={{ minHeight: "100dvh", background: "#F8F7FF", display: "flex", flexDirection: "column" }}>

      {/* Верхняя часть с фоном */}
      <div style={{
        background: `linear-gradient(135deg, ${P}, #A29BFE)`,
        padding: "60px 32px 40px",
        borderRadius: "0 0 32px 32px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "white", fontWeight: 800, fontSize: 18 }}>T</span>
          </div>
          <span style={{ color: "white", fontWeight: 700, fontSize: 18 }}>TimeWe</span>
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "white", marginBottom: 8 }}>
          Создай аккаунт
        </h1>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.85)" }}>
          Планируй досуг умнее
        </p>
      </div>

      {/* Форма */}
      <div style={{ flex: 1, padding: "32px 24px 24px", display: "flex", flexDirection: "column", gap: 16, maxWidth: 480, width: "100%", margin: "0 auto" }}>

        {/* Имя */}
        <div>
          <label style={{ fontSize: 13, fontWeight: 500, color: M, display: "block", marginBottom: 6 }}>
            Имя
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Как тебя зовут?"
            style={inputStyle()}
            onFocus={e => (e.target as HTMLInputElement).style.borderColor = P}
            onBlur={e => (e.target as HTMLInputElement).style.borderColor = B}
          />
        </div>

        {/* Email */}
        <div>
          <label style={{ fontSize: 13, fontWeight: 500, color: M, display: "block", marginBottom: 6 }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            style={inputStyle()}
            onFocus={e => (e.target as HTMLInputElement).style.borderColor = P}
            onBlur={e => (e.target as HTMLInputElement).style.borderColor = B}
          />
        </div>

        {/* Пароль */}
        <div>
          <label style={{ fontSize: 13, fontWeight: 500, color: M, display: "block", marginBottom: 6 }}>
            Пароль
          </label>
          <div style={{ position: "relative" }}>
            <input
              type={showPass ? "text" : "password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Минимум 6 символов"
              minLength={6}
              required
              style={{ ...inputStyle(), paddingRight: 48 }}
              onFocus={e => (e.target as HTMLInputElement).style.borderColor = P}
              onBlur={e => (e.target as HTMLInputElement).style.borderColor = B}
            />
            <button
              onClick={() => setShowPass(!showPass)}
              style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16, color: M }}
            >
              {showPass ? "🙈" : "👁"}
            </button>
          </div>
        </div>

        {/* Оферта / согласие */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "12px 14px", background: "white", borderRadius: 14, border: `1px solid ${B}` }}>
          <div
            onClick={() => setAgreed(!agreed)}
            style={{
              width: 20, height: 20, borderRadius: 6, flexShrink: 0, cursor: "pointer",
              border: `2px solid ${agreed ? P : B}`,
              background: agreed ? P : "white",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.15s", marginTop: 1,
            }}
          >
            {agreed && <span style={{ color: "white", fontSize: 11, fontWeight: 700 }}>✓</span>}
          </div>
          <p style={{ fontSize: 12, color: M, lineHeight: 1.5 }}>
            Регистрируясь, вы соглашаетесь с{" "}
            <Link href="/privacy" style={{ color: P, textDecoration: "underline" }}>
              политикой конфиденциальности
            </Link>{" "}
            и даёте согласие на обработку персональных данных в соответствии с ФЗ-152. Ваши данные используются исключительно для работы сервиса и не передаются третьим лицам.
          </p>
        </div>

        {/* Ошибка */}
        {error && (
          <div style={{ padding: "10px 14px", borderRadius: 12, background: "#FFF0F0", border: "1px solid #FFB8B8" }}>
            <p style={{ fontSize: 13, color: "#E17055", textAlign: "center" }}>{error}</p>
          </div>
        )}

        {/* Кнопка */}
        <button
          onClick={handleSubmit}
          disabled={loading || !email || !password || !agreed}
          style={{
            width: "100%", padding: 15, borderRadius: 16, border: "none",
            cursor: loading || !email || !password || !agreed ? "not-allowed" : "pointer",
            background: !email || !password || !agreed
              ? "#E8E6F0"
              : "linear-gradient(135deg, #6C5CE7, #A29BFE)",
            color: !email || !password || !agreed ? "#B2BEC3" : "white",
            fontSize: 15, fontWeight: 700, transition: "all 0.2s",
          }}
        >
          {loading ? "Создаём аккаунт..." : "Зарегистрироваться"}
        </button>

        {/* Ссылка на вход */}
        <p style={{ textAlign: "center", fontSize: 14, color: M, marginTop: 4 }}>
          Уже есть аккаунт?{" "}
          <Link href="/login" style={{ color: P, fontWeight: 600, textDecoration: "none" }}>
            Войти
          </Link>
        </p>
      </div>
    </div>
  );
}
