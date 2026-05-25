"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authApi } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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

  return (
    <div className="flex flex-col min-h-screen px-6 pt-16 pb-8">
      <div className="mb-10">
        <div className="w-12 h-12 rounded-2xl bg-[#6C5CE7] flex items-center justify-center mb-4">
          <span className="text-white text-xl font-bold">T</span>
        </div>
        <h1 className="text-2xl font-bold text-[#2D3436]">Создай аккаунт</h1>
        <p className="text-[#636E72] mt-1">Планируй досуг умнее</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="text-sm text-[#636E72] mb-1 block">Имя</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Как тебя зовут?"
            className="w-full px-4 py-3 rounded-2xl border border-[#E8E6F0] bg-white text-[#2D3436] outline-none focus:border-[#6C5CE7] transition"
          />
        </div>
        <div>
          <label className="text-sm text-[#636E72] mb-1 block">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="w-full px-4 py-3 rounded-2xl border border-[#E8E6F0] bg-white text-[#2D3436] outline-none focus:border-[#6C5CE7] transition"
          />
        </div>
        <div>
          <label className="text-sm text-[#636E72] mb-1 block">Пароль</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Минимум 6 символов"
            minLength={6}
            required
            className="w-full px-4 py-3 rounded-2xl border border-[#E8E6F0] bg-white text-[#2D3436] outline-none focus:border-[#6C5CE7] transition"
          />
        </div>

        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-2xl bg-[#6C5CE7] text-white font-semibold text-base mt-2 disabled:opacity-60 transition active:scale-95"
        >
          {loading ? "Создаём аккаунт..." : "Зарегистрироваться"}
        </button>
      </form>

      <p className="text-center text-[#636E72] text-sm mt-6">
        Уже есть аккаунт?{" "}
        <Link href="/login" className="text-[#6C5CE7] font-medium">
          Войти
        </Link>
      </p>
    </div>
  );
}
