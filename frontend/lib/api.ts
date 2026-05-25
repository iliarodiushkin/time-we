import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;

// ── Типы ──────────────────────────────────────────────────────────────────

export interface Event {
  id: number;
  title: string;
  description: string | null;
  category: string | null;
  image_url: string | null;
  price_min: number | null;
  price_max: number | null;
  mood_tags: string | null;
  location: string | null;
  group_size_min: number | null;
  group_size_max: number | null;
  duration_hours: number | null;
  start_time: string | null;
}

export interface FeedResponse {
  events: Event[];
  cold_start: boolean;
}

export interface User {
  id: number;
  email: string;
  name: string | null;
  onboarding_categories: string | null;
}

export interface Interaction {
  id: number;
  event_id: number;
  action: "like" | "dislike";
  created_at: string;
}

export interface FavoriteItem {
  id: number;
  event_id: number;
  event: Event;
}

export interface DayPlanItem {
  id: number;
  event_id: number;
  event: Event;
  added_at: string;
}

// ── API функции ───────────────────────────────────────────────────────────

export const authApi = {
  register: (email: string, password: string, name?: string) =>
    api.post<{ access_token: string }>("/auth/register", { email, password, name }),
  login: (email: string, password: string) =>
    api.post<{ access_token: string }>("/auth/login", { email, password }),
  me: () => api.get<User>("/auth/me"),
  onboarding: (categories: string[]) =>
    api.post("/onboarding", { categories }),
};

export const feedApi = {
  getFeed: (n = 20) => api.get<FeedResponse>(`/feed?n=${n}`),
};

export const eventsApi = {
  getAll: (category?: string, price_max?: number, date_filter?: string) =>
    api.get<Event[]>("/events", { params: { category, price_max, date_filter } }),
  getOne: (id: number) => api.get<Event>(`/events/${id}`),
};

export const interactionsApi = {
  like:    (event_id: number) => api.post<Interaction>("/interactions", { event_id, action: "like" }),
  dislike: (event_id: number) => api.post<Interaction>("/interactions", { event_id, action: "dislike" }),
  my:      ()                 => api.get<Interaction[]>("/interactions/my"),
  reset:   ()                 => api.delete("/interactions/reset"),
};

export const favoritesApi = {
  add:    (event_id: number) => api.post<FavoriteItem>("/favorites", { event_id }),
  remove: (event_id: number) => api.delete(`/favorites/${event_id}`),
  my:     ()                 => api.get<FavoriteItem[]>("/favorites/my"),
};

export const dayPlanApi = {
  add:      (event_id: number) => api.post<DayPlanItem>("/day-plan", { event_id }),
  remove:   (event_id: number) => api.delete(`/day-plan/${event_id}`),
  getToday: ()                 => api.get<DayPlanItem[]>("/day-plan/today"),
};
