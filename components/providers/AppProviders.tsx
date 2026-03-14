"use client";
import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useAuthStore } from "@/stores/auth.store";
import { getCurrentUser } from "@/services/auth.service";

const queryClient = new QueryClient();

export function AppProviders(props: { children: React.ReactNode }) {
  const [mswReady, setMswReady] = useState(false);
  const isAuthenticated = useAuthStore((state: any) => state.isAuthenticated);
  const accessToken = useAuthStore((state: any) => state.accessToken);
  const setSession = useAuthStore((state: any) => state.setSession);
  const user = useAuthStore((state: any) => state.user);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      import("@/mocks/browser").then(({ worker }) => {
        if (!(globalThis as any).__mswStarted) {
          worker.start({
            onUnhandledRequest: "bypass",
          }).then(() => {
            (globalThis as any).__mswStarted = true;
            setMswReady(true);
          });
        } else {
          setMswReady(true);
        }
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
        .catch(() => {
          // Token might be invalid
          useAuthStore.getState().clearSession();
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
      {props.children}
      {process.env.NODE_ENV !== "production" ? (
        <ReactQueryDevtools initialIsOpen={false} />
      ) : null}
    </QueryClientProvider>
  );
}
