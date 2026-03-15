import React from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { useAuthorizations } from "@/hooks/useAuthorizations";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe("useAuthorizations", () => {
  it("fetches authorizations for a childId", async () => {
    const { result } = renderHook(() => useAuthorizations("chd_01HXYZ"), { wrapper });
    
    expect(result.current.isLoading).toBe(true);
    
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    
    expect(result.current.authorizations).toHaveLength(2);
    expect(result.current.authorizations[0].delegate.fullName).toBe("David Mensah");
  });

  it("successfully creates a new authorization and updates cache", async () => {
    const { result } = renderHook(() => useAuthorizations("chd_01HXYZ"), { wrapper });
    
    const newAuth = {
      delegateProfileId: "dlg_NEW",
      childId: "chd_01HXYZ",
      authType: "ONE_TIME",
      allowedDays: ["SUN"],
      allowedTimeStart: "10:00",
      allowedTimeEnd: "12:00",
      validFrom: "2025-03-20",
      validUntil: "2025-03-20",
    };
    
    await result.current.createAuthorization.mutateAsync(newAuth);
    
    await waitFor(() => {
      expect(result.current.authorizations).toHaveLength(3);
    });
  });

  it("successfully revokes an authorization and updates cache", async () => {
    const { result } = renderHook(() => useAuthorizations("chd_01HXYZ"), { wrapper });
    
    await waitFor(() => {
      expect(result.current.authorizations).toHaveLength(2);
    });
    
    await result.current.revokeAuthorization.mutateAsync("auth_01HXYZ");
    
    await waitFor(() => {
      expect(result.current.authorizations).toHaveLength(1);
    });
  });
});
