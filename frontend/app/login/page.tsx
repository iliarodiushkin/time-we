"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authApi } from "@/lib/api";

const P = "#6C5CE7", B = "#E8E6F0", M = "#636E72", T = "#2D3436";

export default function LoginPage() {
  const router = useRouter();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);

  async function handleSubmit() {
    setError("");
    setLoading(true);
    try {
      const res = await authApi.login(email, password);
      localStorage.setItem("token", res.data.access_token);
      router.replace("/feed");
    } catch {
      setError("Неверный email или пароль");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100dvh", background: "#F8F7FF", display: "flex", flexDirection: "column", alignItems: "center" }}>

      {/* Верхняя часть с градиентом */}
      <div style={{ width: "100%", maxWidth: 480 }}>
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
            Добро пожаловать
          </h1>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.85)" }}>
            Войди, чтобы найти своё идеальное время
          </p>
        </div>
      </div>

      {/* Форма */}
      <div style={{ flex: 1, padding: "32px 24px 24px", display: "flex", flexDirection: "column", gap: 16, maxWidth: 480, width: "100%" }}>

        {/* Email */}
        <div>
          <label style={{ fontSize: 13, fontWeight: 500, color: M, display: "block", marginBottom: 6 }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            style={{ width: "100%", padding: "14px 16px", borderRadius: 16, border: `1.5px solid ${B}`, background: "white", fontSize: 15, color: T, outline: "none", boxSizing: "border-box" }}
            onFocus={e => (e.target as HTMLInputElement).style.borderColor = P}
            onBlur={e => (e.target as HTMLInputElement).style.borderColor = B}
          />
        </div>

        {/* Пароль */}
        <div>
          <label style={{ fontSize: 13, fontWeight: 500, color: M, display: "block", marginBottom: 6 }}>Пароль</label>
          <div style={{ position: "relative" }}>
            <input
              type={showPass ? "text" : "password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Введите пароль"
              required
              style={{ width: "100%", padding: "14px 48px 14px 16px", borderRadius: 16, border: `1.5px solid ${B}`, background: "white", fontSize: 15, color: T, outline: "none", boxSizing: "border-box" }}
              onFocus={e => (e.target as HTMLInputElement).style.borderColor = P}
              onBlur={e => (e.target as HTMLInputElement).style.borderColor = B}
            />
            <button onClick={() => setShowPass(!showPass)}
              style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16, color: M }}>
              {showPass ? "🙈" : "👁"}
            </button>
          </div>
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
          disabled={loading || !email || !password}
          style={{
            width: "100%", padding: 15, borderRadius: 16, border: "none",
            cursor: loading || !email || !password ? "not-allowed" : "pointer",
            background: !email || !password ? "#E8E6F0" : `linear-gradient(135deg, ${P}, #A29BFE)`,
            color: !email || !password ? "#B2BEC3" : "white",
            fontSize: 15, fontWeight: 700, transition: "all 0.2s",
          }}>
          {loading ? "Входим..." : "Войти"}
        </button>

        {/* Ссылка на регистрацию */}
        <p style={{ textAlign: "center", fontSize: 14, color: M, marginTop: 4 }}>
          Нет аккаунта?{" "}
          <Link href="/register" style={{ color: P, fontWeight: 600, textDecoration: "none" }}>
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </div>
  );
}
