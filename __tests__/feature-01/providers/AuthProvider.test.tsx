import { render } from "@testing-library/react";
import { setupServer } from "msw/node";
import { handlers } from "@/mocks/handlers";
import { AuthProvider, useAuth } from "@/components/auth/AuthProvider";

const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function Consumer() {
  const { user, isAuthenticated } = useAuth();
  return (
    <div>
      <span data-testid="auth">{String(isAuthenticated)}</span>
      <span data-testid="name">{user?.fullName ?? ""}</span>
    </div>
  );
}

describe("Feature 01 — AuthProvider", () => {
  it("isAuthenticated is false by default", () => {
    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>
    );
    fail("not implemented");
  });

  it("exposes user after successful verify/login", () => {
    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>
    );
    fail("not implemented");
  });
});
