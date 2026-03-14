import { render } from "@testing-library/react";
import { AuthProvider, useAuth } from "@/components/auth/AuthProvider";
import { setupServer } from "msw/node";
import { handlers } from "@/mocks/handlers";

const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function TestConsumer() {
  const { user, isAuthenticated } = useAuth();
  return (
    <div>
      <span data-testid="auth">{String(isAuthenticated)}</span>
      <span data-testid="user">{user?.fullName ?? ""}</span>
    </div>
  );
}

describe("AuthProvider", () => {
  it("exposes user after successful verification", async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );
    fail("not implemented");
  });

  it("isAuthenticated is false by default", () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );
    fail("not implemented");
  });
});
