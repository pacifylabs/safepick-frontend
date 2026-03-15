import { render, screen, waitFor } from "@testing-library/react";
import { AuthorizationList } from "@/components/authorizations/AuthorizationList";
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

describe("AuthorizationList", () => {
  const childId = "chd_01HXYZ";

  it("renders correctly with active and expired authorizations", async () => {
    render(<AuthorizationList childId={childId} />, { wrapper });
    
    // Check loading state
    expect(screen.getByTestId("authorization-list-skeleton")).toBeInTheDocument();
    
    // Check for active status badge
    await waitFor(() => {
      expect(screen.getByText(/active/i)).toBeInTheDocument();
      expect(screen.getByText(/expired/i)).toBeInTheDocument();
    });
    
    // Check delegate names
    expect(screen.getByText(/david mensah/i)).toBeInTheDocument();
    expect(screen.getByText(/kofi appiah/i)).toBeInTheDocument();
  });

  it("handles empty state for new children", async () => {
    render(<AuthorizationList childId="chd_EMPTY" />, { wrapper });
    
    await waitFor(() => {
      expect(screen.getByText(/no authorizations found/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /add delegate/i })).toBeInTheDocument();
    });
  });

  it("renders error state correctly", async () => {
    // Force a failure in the handler for a specific childId
    render(<AuthorizationList childId="chd_ERROR" />, { wrapper });
    
    await waitFor(() => {
      expect(screen.getByText(/failed to load authorizations/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
    });
  });

  it("allows revoking an authorization", async () => {
    const onRevoke = jest.fn();
    render(<AuthorizationList childId={childId} onRevoke={onRevoke} />, { wrapper });
    
    await waitFor(() => {
      const revokeButton = screen.getAllByRole("button", { name: /revoke/i })[0];
      fireEvent.click(revokeButton);
    });
    
    // Check for confirmation step
    expect(screen.getByText(/are you sure you want to revoke/i)).toBeInTheDocument();
    
    fireEvent.click(screen.getByRole("button", { name: /confirm revoke/i }));
    
    await waitFor(() => {
      expect(onRevoke).toHaveBeenCalledWith("auth_01HXYZ");
    });
  });
});
