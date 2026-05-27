"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { usePathname } from "next/navigation";
import "./globals.css";
import DayPlanFAB from "@/components/DayPlanFAB";

// Страницы где FAB не нужен
const NO_FAB_PATHS = ["/login", "/register", "/onboarding", "/privacy"];

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showFAB = !NO_FAB_PATHS.some(p => pathname.startsWith(p));

  return (
    <>
      {children}
      {showFAB && <DayPlanFAB />}
    </>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
  }));

  return (
    <html lang="ru">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" content="#6C5CE7" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="TimeWe" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="description" content="Персональные рекомендации событий Москвы" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/icon-192.png" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <title>TimeWe — планируй досуг</title>
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          <LayoutContent>
            {children}
          </LayoutContent>
        </QueryClientProvider>
      </body>
    </html>
  );
}
