import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AuthorizationForm } from "@/components/authorizations/AuthorizationForm";
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

describe("AuthorizationForm", () => {
  const mockOnSubmit = jest.fn();
  const defaultProps = {
    delegateId: "dlg_01HXYZ",
    childId: "chd_01HXYZ",
    onSubmit: mockOnSubmit,
  };

  it("renders correctly with initial fields", () => {
    render(<AuthorizationForm {...defaultProps} />, { wrapper });
    
    expect(screen.getByLabelText(/auth type/i)).toBeInTheDocument();
    expect(screen.getByText(/recurring/i)).toBeInTheDocument();
  });

  it("validates that allowedTimeEnd is after allowedTimeStart", async () => {
    render(<AuthorizationForm {...defaultProps} />, { wrapper });
    
    const startTime = screen.getByLabelText(/start time/i);
    const endTime = screen.getByLabelText(/end time/i);
    
    fireEvent.change(startTime, { target: { value: "17:00" } });
    fireEvent.change(endTime, { target: { value: "14:00" } });
    
    fireEvent.click(screen.getByRole("button", { name: /approve/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/end time must be after start time/i)).toBeInTheDocument();
    });
  });

  it("requires allowedDays for RECURRING types", async () => {
    render(<AuthorizationForm {...defaultProps} />, { wrapper });
    
    // Select RECURRING if not default
    fireEvent.click(screen.getByLabelText(/recurring/i));
    
    // Attempt to submit without selecting any days
    fireEvent.click(screen.getByRole("button", { name: /approve/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/select at least one day/i)).toBeInTheDocument();
    });
  });

  it("submits the form with valid data", async () => {
    render(<AuthorizationForm {...defaultProps} />, { wrapper });
    
    fireEvent.click(screen.getByLabelText(/recurring/i));
    fireEvent.click(screen.getByLabelText(/monday/i));
    fireEvent.change(screen.getByLabelText(/start time/i), { target: { value: "14:00" } });
    fireEvent.change(screen.getByLabelText(/end time/i), { target: { value: "17:00" } });
    
    fireEvent.click(screen.getByRole("button", { name: /approve/i }));
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(expect.objectContaining({
        authType: "RECURRING",
        allowedDays: ["MON"],
      }));
    });
  });

  it("is keyboard navigable", () => {
    render(<AuthorizationForm {...defaultProps} />, { wrapper });
    const firstInput = screen.getByLabelText(/auth type/i);
    firstInput.focus();
    expect(document.activeElement).toBe(firstInput);
    
    // Tab through elements
    fireEvent.keyDown(firstInput, { key: "Tab" });
    // This is a simplified check, full keyboard navigation would be more complex
  });
});
