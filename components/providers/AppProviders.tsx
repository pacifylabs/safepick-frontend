"use client";
import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useAuthStore } from "@/stores/auth.store";
import { getCurrentUser } from "@/services/auth.service";
import { ToastContainer } from "@/components/ui/Toast";
import { ThemeProvider } from "./ThemeProvider";

const queryClient = new QueryClient({ 
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 3,
      gcTime: 1000 * 60 * 10,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      retry: 1,
      retryDelay: 2000,
      refetchOnReconnect: false,
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});

export function AppProviders(props: { children: React.ReactNode }) {
  const [mswReady, setMswReady] = useState(false);
  const isAuthenticated = useAuthStore((state: any) => state.isAuthenticated);
  const accessToken = useAuthStore((state: any) => state.accessToken);
  const setSession = useAuthStore((state: any) => state.setSession);
  const user = useAuthStore((state: any) => state.user);

  useEffect(() => {
    const enableMsw = process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_ENABLE_MSW === "true";
    
    if (enableMsw) {
      import("@/mocks/browser")
        .then(({ worker }) => {
          if (!(globalThis as any).__mswStarted) {
            return worker
              .start({ onUnhandledRequest: "bypass" })
              .then(() => {
                (globalThis as any).__mswStarted = true;
                setMswReady(true);
              })
              .catch((err: unknown) => {
                console.warn("[MSW] Failed to start service worker:", err);
                setMswReady(true);
              });
          } else {
            setMswReady(true);
          }
        })
        .catch((err: unknown) => {
          console.warn("[MSW] Failed to import browser mock:", err);
          setMswReady(true);
        });
    } else {
      setMswReady(true);
    }
  }, []);

  useEffect(() => {
    if (mswReady && accessToken && !user) {
      getCurrentUser()
        .then((response) => {
          setSession(response.user, accessToken);
        })
        .catch((err) => {
          // Token might be invalid or /auth/me endpoint doesn't exist
          console.warn("[AppProviders] Failed to fetch current user:", err);
          // Don't clear session - let the app work with just the token
          // The user can be populated from other data sources (e.g., children response)
        });
    }
  }, [mswReady, accessToken, user, setSession]);

  if (!mswReady) {
    return (
      <div className="fixed inset-0 bg-navy flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-white/20 border-t-teal rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ToastContainer />
        {props.children}
        {process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_ENABLE_MSW === "true" ? (
          <ReactQueryDevtools initialIsOpen={false} />
        ) : null}
      </ThemeProvider>
    </QueryClientProvider>
  );
}
