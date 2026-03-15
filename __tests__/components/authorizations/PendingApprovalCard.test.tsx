import { render, screen, fireEvent } from "@testing-library/react";
import { PendingApprovalCard } from "@/components/authorizations/PendingApprovalCard";

describe("PendingApprovalCard", () => {
  const mockDelegate = {
    id: "dlg_01HXYZ",
    fullName: "David Mensah",
    photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
    relationship: "DRIVER",
    kycStatus: "APPROVED",
  };

  const mockOnApprove = jest.fn();
  const mockOnReject = jest.fn();

  it("renders correctly with delegate information", () => {
    render(
      <PendingApprovalCard
        delegate={mockDelegate}
        onApprove={mockOnApprove}
        onReject={mockOnReject}
      />
    );

    expect(screen.getByText(/david mensah/i)).toBeInTheDocument();
    expect(screen.getByText(/driver/i)).toBeInTheDocument();
    expect(screen.getByText(/kyc verified/i)).toBeInTheDocument();
  });

  it("calls onApprove when approve button is clicked", () => {
    render(
      <PendingApprovalCard
        delegate={mockDelegate}
        onApprove={mockOnApprove}
        onReject={mockOnReject}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /approve/i }));
    expect(mockOnApprove).toHaveBeenCalledWith(mockDelegate.id);
  });

  it("calls onReject when reject button is clicked", () => {
    render(
      <PendingApprovalCard
        delegate={mockDelegate}
        onApprove={mockOnApprove}
        onReject={mockOnReject}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /reject/i }));
    expect(mockOnReject).toHaveBeenCalledWith(mockDelegate.id);
  });
});
