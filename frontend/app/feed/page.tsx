"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { feedApi, eventsApi, FeedResponse, Event, interactionsApi } from "@/lib/api";
import EventCard from "@/components/EventCard";
import EventModal from "@/components/EventModal";
import DayPlanSidebar from "@/components/DayPlanSidebar";
import AppHeader from "@/components/AppHeader";
import ResetModal from "@/components/ResetModal";
import DayPlanFAB from "@/components/DayPlanFAB";
import PremiumModal from "@/components/PremiumModal";

const CATS = [
  { id: null,       label: "Для тебя 🎯" },
  { id: "today",    label: "Сегодня"      },
  { id: "tomorrow", label: "Завтра"       },
  { id: "music",    label: "Концерты"     },
  { id: "art",      label: "Выставки"     },
  { id: "cinema",   label: "Кино"         },
  { id: "sport",    label: "Спорт"        },
  { id: "walk",     label: "Природа"      },
  { id: "food",     label: "Еда"          },
  { id: "game",     label: "Игры"         },
  { id: "lecture",  label: "Лекции"       },
  { id: "other",    label: "Другое"       },
];

const TIME_CATS = new Set(["today", "tomorrow"]);

function getDateForCat(cat: string | null): Date | undefined {
  if (cat === "today") return new Date();
  if (cat === "tomorrow") {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d;
  }
  return undefined;
}
const P="#6C5CE7", B="#E8E6F0", M="#636E72", T="#2D3436";

export default function FeedPage() {
  const router = useRouter();
  const qc     = useQueryClient();
  const [cat,        setCat]        = useState<string|null>(null);
  const [modal,      setModal]      = useState<Event|null>(null);
  const [resetting,  setResetting]  = useState(false);
  const [showReset,  setShowReset]  = useState(false);
  const [likedIds,   setLikedIds]   = useState<Set<number>>(new Set());
  const [searchQ,    setSearchQ]    = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("token")) router.replace("/login");
  }, [router]);

  // Загружаем лайки пользователя при старте — чтобы они сохранялись после перехода
  const { data: myInteractions = [] } = useQuery({
    queryKey: ["interactions"],
    queryFn:  () => interactionsApi.my().then(r => r.data),
  });

  useEffect(() => {
    if (!myInteractions.length) return;
    const ids = new Set(
      myInteractions
        .filter((i: any) => i.action === "like")
        .map((i: any) => i.event_id as number)
    );
    // Сравниваем по содержимому чтобы не вызывать лишний ререндер
    setLikedIds(prev => {
      const prevArr = Array.from(prev).sort().join(",");
      const nextArr = Array.from(ids).sort().join(",");
      return prevArr === nextArr ? prev : ids;
    });
  }, [myInteractions.length, myInteractions.map((i: any) => i.event_id).join(",")]);

  const feedQ = useQuery<FeedResponse>({
    queryKey: ["feed"],
    queryFn:  () => feedApi.getFeed(20).then(r => r.data),
    enabled:  cat === null,
  });

  const catQ = useQuery<Event[]>({
    queryKey: ["events", cat],
    queryFn:  () => {
      if (TIME_CATS.has(cat!)) {
        return eventsApi.getAll(undefined, undefined, cat!).then(r => r.data);
      }
      return eventsApi.getAll(cat!).then(r => r.data);
    },
    enabled:  cat !== null,
  });

  // onLike — только добавляет в likedIds (не удаляет)
  const onLike = useCallback((id?: number) => {
    if (id) {
      setLikedIds(prev => {
        const next = new Set(prev);
        next.add(id); // только добавляем, никогда не удаляем через этот колбэк
        return next;
      });
    }
    setTimeout(() => {
      qc.invalidateQueries({ queryKey: ["feed"] });
      qc.invalidateQueries({ queryKey: ["interactions"] });
    }, 600);
  }, [qc]);

  // onDislike — удаляет из likedIds и обновляет ленту
  const onDislike = useCallback((id?: number) => {
    if (id) {
      setLikedIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
    setTimeout(() => {
      qc.invalidateQueries({ queryKey: ["feed"] });
      qc.invalidateQueries({ queryKey: ["interactions"] });
    }, 600);
  }, [qc]);

  const onAddToDay = useCallback(() => {
    qc.invalidateQueries({ queryKey: ["day-plan"] });
  }, [qc]);

  async function doReset() {
    setResetting(true);
    try {
      await interactionsApi.reset();
      setLikedIds(new Set());
      qc.invalidateQueries({ queryKey: ["feed"] });
      qc.invalidateQueries({ queryKey: ["interactions"] });
    } finally { setResetting(false); }
  }

  const isFeedMode = cat === null;
  const isLoading  = isFeedMode ? feedQ.isLoading : catQ.isLoading;
  const isError    = isFeedMode ? feedQ.isError   : catQ.isError;
  const coldStart  = isFeedMode ? feedQ.data?.cold_start : false;

  let baseEvents: Event[] = [];
  if (isFeedMode) baseEvents = feedQ.data?.events || [];
  else            baseEvents = catQ.data || [];

  // Локальный поиск по загруженным событиям
  const events = useMemo(() => {
    if (!searchQ.trim()) return baseEvents;
    const q = searchQ.toLowerCase();
    return baseEvents.filter(e =>
      e.title?.toLowerCase().includes(q) ||
      e.location?.toLowerCase().includes(q) ||
      e.description?.toLowerCase().includes(q)
    );
  }, [baseEvents, searchQ]);

  const chip = (id: string|null, label: string) => (
    <button key={label} onClick={() => { setCat(id); setSearchQ(""); }} style={{
      flexShrink:0, padding:"6px 18px", borderRadius:999, fontSize:13,
      fontWeight:500, cursor:"pointer", whiteSpace:"nowrap", transition:"all .15s",
      border:`1px solid ${cat===id ? P : B}`,
      background: cat===id ? P : "white",
      color:       cat===id ? "white" : M,
    }}>{label}</button>
  );

  const resetBtn = (
    <button onClick={() => setShowReset(true)} disabled={resetting}
      style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:M, background:"white", border:`1px solid ${B}`, borderRadius:999, padding:"6px 16px", cursor:"pointer", opacity:resetting?0.5:1, whiteSpace:"nowrap" }}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
        <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.5"/>
      </svg>
      {resetting ? "Сброс..." : "Сбросить вкусы"}
    </button>
  );

  return (
    <div style={{minHeight:"100vh", background:"#F8F7FF"}}>

      {/* Общий хедер */}
      <div className="header-desktop">
        <AppHeader
          showSearch
          searchValue={searchQ}
          onSearch={setSearchQ}
          rightSlot={
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {coldStart && <span style={{ fontSize:11, color:M, background:"#F8F7FF", border:`1px solid ${B}`, borderRadius:999, padding:"5px 12px", whiteSpace:"nowrap" }}>💡 Оцени события</span>}
              {resetBtn}
              <button onClick={() => { localStorage.removeItem("token"); router.replace("/login"); }}
                style={{ fontSize:12, color:M, background:"white", border:`1px solid ${B}`, borderRadius:8, padding:"6px 14px", cursor:"pointer" }}>
                Выйти
              </button>
            </div>
          }
        />
        {/* Категории + кнопка фильтров */}
        <div style={{ background:"white", borderBottom:`1px solid ${B}` }}>
          <div style={{ maxWidth:1280, margin:"0 auto", padding:"8px 40px", display:"flex", gap:8, alignItems:"center" }}>
            <div style={{ display:"flex", gap:8, overflowX:"auto", flex:1 }}>
              {CATS.map(c => chip(c.id, c.label))}
            </div>
            <button onClick={() => setShowFilters(true)}
              style={{ flexShrink:0, display:"flex", alignItems:"center", gap:6, padding:"6px 14px", borderRadius:999, fontSize:13, fontWeight:500, cursor:"pointer", border:`1px solid ${B}`, background:"white", color:M, transition:"all .15s", marginLeft:4 }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#6C5CE7"; (e.currentTarget as HTMLButtonElement).style.color = "#6C5CE7"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = B; (e.currentTarget as HTMLButtonElement).style.color = M; }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="10" y1="18" x2="14" y2="18"/>
              </svg>
              Фильтры ✨
            </button>
          </div>
        </div>
      </div>

      {/* Мобильный хедер ленты */}
      <header className="app-header-mobile" style={{
        position:"sticky", top:0, zIndex:40,
        background:"rgba(248,247,255,0.97)", backdropFilter:"blur(8px)",
        borderBottom:`1px solid ${B}`
      }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 16px 8px" }}>
          {/* Лого */}
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <div style={{ width:28, height:28, borderRadius:8, background:P, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <span style={{ color:"white", fontWeight:800, fontSize:12 }}>T</span>
            </div>
            <span style={{ fontSize:15, fontWeight:700, color:T }}>TimeWe</span>
          </div>
          {/* Навигация + сброс */}
          <div style={{ display:"flex", alignItems:"center", gap:2 }}>
            {[
              { href:"/feed",         icon:"🏠", label:"Лента"      },
              { href:"/favorites",    icon:"🔖", label:"Сохранённое" },
              { href:"/shared-plans", icon:"👥", label:"Планы"      },
              { href:"/profile",      icon:"👤", label:"Профиль"    },
            ].map(item => (
              <button key={item.href} onClick={() => router.push(item.href)}
                style={{ width:32, height:32, borderRadius:8, border:"none", background:"transparent", cursor:"pointer", fontSize:16, display:"flex", alignItems:"center", justifyContent:"center" }}>
                {item.icon}
              </button>
            ))}
            <button onClick={() => setShowReset(true)}
              style={{ width:32, height:32, borderRadius:8, border:`1px solid ${B}`, background:"white", cursor:"pointer", fontSize:14, display:"flex", alignItems:"center", justifyContent:"center", marginLeft:2 }}>
              🔄
            </button>
          </div>
        </div>
        <div style={{ display:"flex", gap:8, overflowX:"auto", padding:"0 16px 10px" }}>
          {CATS.map(c => chip(c.id, c.label))}
        </div>
      </header>

      {/* Контент */}
      <div style={{ maxWidth:1280, margin:"0 auto", padding:"28px 40px 48px" }}>
        <div className="feed-layout">

          <div style={{ flex:1, minWidth:0 }}>
            <div className="header-desktop" style={{ fontSize:18, fontWeight:700, color:T, marginBottom:20 }}>
              {searchQ ? `Поиск: «${searchQ}»` : isFeedMode ? "Для тебя" : CATS.find(c=>c.id===cat)?.label || "Лента"}
            </div>

            {isLoading && <div className="feed-desktop">{[1,2,3,4,5,6,7,8].map(i=><div key={i} style={{background:"white",borderRadius:16,height:240}}/>)}</div>}

            {isError && (
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",marginTop:80,gap:12}}>
                <span style={{fontSize:40}}>😕</span>
                <p style={{color:M}}>Не удалось загрузить события</p>
                <button onClick={() => isFeedMode ? feedQ.refetch() : catQ.refetch()} style={{background:P,color:"white",border:"none",borderRadius:14,padding:"8px 24px",cursor:"pointer",fontSize:13}}>Попробовать снова</button>
              </div>
            )}

            {!isLoading && !isError && events.length===0 && (
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",marginTop:80,gap:12}}>
                <span style={{fontSize:48}}>{searchQ ? "🔍" : TIME_CATS.has(cat!) ? "📅" : "🎉"}</span>
                <p style={{fontWeight:600,color:T}}>
                  {searchQ ? `По запросу «${searchQ}» ничего не найдено` : TIME_CATS.has(cat!) ? "Событий на эту дату пока нет" : "Событий не найдено"}
                </p>
                {searchQ
                  ? <button onClick={() => setSearchQ("")} style={{marginTop:4,background:"#F0EEFF",color:P,border:"none",borderRadius:12,padding:"8px 18px",cursor:"pointer",fontSize:13}}>Очистить поиск</button>
                  : isFeedMode && <button onClick={() => setShowReset(true)} style={{marginTop:4,background:"#F0EEFF",color:P,border:"none",borderRadius:12,padding:"8px 18px",cursor:"pointer",fontSize:13}}>Сбросить вкусы</button>
                }
              </div>
            )}

            {!isLoading && events.length>0 && (<>
              <div className="feed-mobile">
                {events.map(e=><EventCard key={e.id} event={e} onDetails={()=>setModal(e)} onLike={()=>onLike(e.id)} isLiked={likedIds.has(e.id)} dateOverride={getDateForCat(cat)}/>)}
              </div>
              <div className="feed-desktop">
                {events.map(e=><EventCard key={`d-${e.id}`} event={e} compact onDetails={()=>setModal(e)} onLike={()=>onLike(e.id)} isLiked={likedIds.has(e.id)} dateOverride={getDateForCat(cat)}/>)}
              </div>
            </>)}
          </div>

          <aside className="feed-sidebar">
            <div style={{position:"sticky",top:16,display:"flex",flexDirection:"column",gap:16}}>
              <DayPlanSidebar events={events} onEventClick={(e)=>setModal(e)}/>
              {events[0] && (
                <div style={{borderRadius:20,padding:16,background:"linear-gradient(135deg,#6C5CE7,#A29BFE)",cursor:"pointer"}} onClick={()=>setModal(events[0])}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                    <span>✨</span><span style={{fontWeight:600,fontSize:13,color:"white"}}>Идея дня</span>
                  </div>
                  <p style={{fontSize:13,color:"rgba(255,255,255,0.9)",lineHeight:1.5,marginBottom:10}}>{events[0].title}</p>
                  <span style={{fontSize:11,color:"white",background:"rgba(255,255,255,0.2)",borderRadius:8,padding:"4px 10px"}}>Подробнее →</span>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      {modal && (
        <EventModal
          event={modal}
          isLiked={likedIds.has(modal.id)}
          onClose={()=>setModal(null)}
          onLike={()=>onLike(modal.id)}
          onDislike={()=>{ onDislike(modal.id); setModal(null); }}
          onAddToDay={onAddToDay}
        />
      )}

      <DayPlanFAB />

      {showReset && (
        <ResetModal
          onClose={() => setShowReset(false)}
          onReset={doReset}
        />
      )}

      {showFilters && (
        <PremiumModal
          feature="Расширенные фильтры"
          onClose={() => setShowFilters(false)}
        />
      )}
    </div>
  );
}
