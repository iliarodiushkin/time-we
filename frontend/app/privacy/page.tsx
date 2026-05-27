"use client";
import { useRouter } from "next/navigation";
import AppHeader from "@/components/AppHeader";

const M = "#636E72", T = "#2D3436", B = "#E8E6F0";

export default function PrivacyPage() {
  const router = useRouter();

  return (
    <div style={{ minHeight: "100dvh", background: "#F8F7FF" }}>
      <AppHeader />
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 24px 80px" }}>
        <button onClick={() => router.back()} style={{ background: "none", border: "none", cursor: "pointer", color: "#6C5CE7", fontSize: 14, marginBottom: 24, display: "flex", alignItems: "center", gap: 6 }}>
          ← Назад
        </button>

        <h1 style={{ fontSize: 24, fontWeight: 800, color: T, marginBottom: 8 }}>
          Политика конфиденциальности
        </h1>
        <p style={{ fontSize: 13, color: M, marginBottom: 32 }}>
          Последнее обновление: май 2026 г.
        </p>

        {[
          {
            title: "1. Какие данные мы собираем",
            text: "При регистрации мы собираем адрес электронной почты и имя пользователя (по желанию). В процессе использования сервиса фиксируются взаимодействия с событиями (лайки, дизлайки, просмотры) — они необходимы для формирования персональных рекомендаций. Данные о платёжных картах не собираются и не хранятся.",
          },
          {
            title: "2. Как используются данные",
            text: "Собранные данные используются исключительно для: формирования персонализированных рекомендаций событий; сохранения настроек и предпочтений пользователя; обеспечения работы сервиса. Данные не передаются третьим лицам, не используются для рекламных целей и не продаются.",
          },
          {
            title: "3. Хранение данных",
            text: "Данные хранятся на серверах платформы Railway (США) с шифрованием в транзите (HTTPS/TLS). Аутентификационные токены JWT хранятся в localStorage браузера пользователя и не передаются на сторонние серверы. Пароли хранятся в хэшированном виде (bcrypt).",
          },
          {
            title: "4. Права пользователя",
            text: "В соответствии с Федеральным законом №152-ФЗ «О персональных данных» вы вправе: запросить информацию об обрабатываемых персональных данных; потребовать исправления неточных данных; потребовать удаления данных и аккаунта. Для реализации прав обратитесь через форму удаления аккаунта в настройках профиля.",
          },
          {
            title: "5. Файлы cookie",
            text: "Сервис не использует сторонние файлы cookie и счётчики аналитики. Данные сессии хранятся в localStorage браузера.",
          },
          {
            title: "6. Изменения политики",
            text: "При существенных изменениях политики конфиденциальности пользователи будут уведомлены при следующем входе в сервис. Продолжение использования сервиса после уведомления означает согласие с обновлёнными условиями.",
          },
        ].map(section => (
          <div key={section.title} style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: T, marginBottom: 10 }}>{section.title}</h2>
            <p style={{ fontSize: 14, color: M, lineHeight: 1.7 }}>{section.text}</p>
          </div>
        ))}

        <div style={{ padding: "16px 20px", background: "white", borderRadius: 16, border: `1px solid ${B}`, marginTop: 8 }}>
          <p style={{ fontSize: 13, color: M, lineHeight: 1.6 }}>
            По вопросам обработки персональных данных: TimeWe, Москва. Настоящая политика распространяется на сервис TimeWe, доступный по адресу{" "}
            <span style={{ color: "#6C5CE7" }}>time-we.vercel.app</span>
          </p>
        </div>
      </div>
    </div>
  );
}
