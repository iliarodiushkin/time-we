"use client";
import { useRouter, usePathname } from "next/navigation";

const P = "#6C5CE7", B = "#E8E6F0", M = "#636E72", T = "#2D3436";

const NAV = [
  {
    href: "/feed",
    label: "Лента",
    icon: (active: boolean, size = 22) => (
      <svg width={size} height={size} viewBox="0 0 24 24"
        fill={active ? P : "none"} stroke={active ? P : "#B2BEC3"}
        strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    href: "/favorites",
    label: "Сохранённое",
    icon: (active: boolean, size = 22) => (
      <svg width={size} height={size} viewBox="0 0 24 24"
        fill={active ? P : "none"} stroke={active ? P : "#B2BEC3"}
        strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
      </svg>
    ),
  },
  {
    href: "/shared-plans",
    label: "Планы",
    icon: (active: boolean, size = 22) => (
      <svg width={size} height={size} viewBox="0 0 24 24"
        fill="none" stroke={active ? P : "#B2BEC3"}
        strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    href: "/profile",
    label: "Профиль",
    icon: (active: boolean, size = 22) => (
      <svg width={size} height={size} viewBox="0 0 24 24"
        fill="none" stroke={active ? P : "#B2BEC3"}
        strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
];

interface Props {
  rightSlot?: React.ReactNode;
  showSearch?: boolean;
  onSearch?: (q: string) => void;
  searchValue?: string;
}

export default function AppHeader({ rightSlot, showSearch, onSearch, searchValue }: Props) {
  const router   = useRouter();
  const pathname = usePathname();

  return (
    <>
      {/* ── ДЕСКТОПНЫЙ ХЕДЕР (≥768px) ── */}
      <header className="header-desktop" style={{
        position: "sticky", top: 0, zIndex: 40,
        background: "white", borderBottom: `1px solid ${B}`
      }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 40px", height: 58, display: "flex", alignItems: "center", gap: 16 }}>
          <div onClick={() => router.push("/feed")}
            style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0, cursor: "pointer" }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: P, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "white", fontWeight: 700, fontSize: 14 }}>T</span>
            </div>
            <span style={{ fontWeight: 700, color: T, fontSize: 15 }}>TimeWe</span>
          </div>

          {showSearch && (
            <div style={{ flex: 1, maxWidth: 480, margin: "0 20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#F8F7FF", border: `1px solid ${B}`, borderRadius: 12, padding: "8px 14px" }}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#B2BEC3" strokeWidth={2}>
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <input
                  placeholder="Поиск мероприятий..."
                  value={searchValue || ""}
                  onChange={e => onSearch?.(e.target.value)}
                  style={{ background: "transparent", border: "none", outline: "none", fontSize: 13, color: T, width: "100%" }}
                />
                {searchValue && (
                  <button onClick={() => onSearch?.("")}
                    style={{ background: "none", border: "none", cursor: "pointer", color: M, fontSize: 16, lineHeight: 1, padding: 0 }}>✕</button>
                )}
              </div>
            </div>
          )}

          {!showSearch && <div style={{ flex: 1 }} />}

          <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
            {NAV.map(item => {
              const active = pathname.startsWith(item.href);
              return (
                <button key={item.href} onClick={() => router.push(item.href)}
                  style={{
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                    padding: "5px 14px", borderRadius: 10, border: "none", cursor: "pointer",
                    background: active ? "#F0EEFF" : "transparent", transition: "background 0.2s",
                  }}>
                  {item.icon(active)}
                  <span style={{ fontSize: 10, fontWeight: active ? 600 : 400, color: active ? P : "#B2BEC3" }}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>

          {rightSlot && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 8 }}>
              {rightSlot}
            </div>
          )}
        </div>
      </header>

      {/* ── МОБИЛЬНЫЙ ХЕДЕР (< 768px) ── */}
      <header className="app-header-mobile" style={{
        position: "sticky", top: 0, zIndex: 40,
        background: "rgba(248,247,255,0.97)", backdropFilter: "blur(8px)",
        borderBottom: `1px solid ${B}`,
        padding: "10px 16px", display: "flex", alignItems: "center",
        justifyContent: "space-between",
      }}>
        {/* Лого */}
        <div onClick={() => router.push("/feed")}
          style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: P, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "white", fontWeight: 800, fontSize: 12 }}>T</span>
          </div>
          <span style={{ fontWeight: 700, color: T, fontSize: 15 }}>TimeWe</span>
        </div>
        {/* Навигация */}
        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
          {NAV.map(item => {
            const active = pathname.startsWith(item.href);
            return (
              <button key={item.href} onClick={() => router.push(item.href)}
                style={{
                  width: 32, height: 32, borderRadius: 8, border: "none",
                  background: active ? "#F0EEFF" : "transparent",
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                {item.icon(active, 18)}
              </button>
            );
          })}
          {rightSlot && (
            <div style={{ display: "flex", alignItems: "center", gap: 4, marginLeft: 4 }}>
              {rightSlot}
            </div>
          )}
        </div>
      </header>


    </>
  );
}
