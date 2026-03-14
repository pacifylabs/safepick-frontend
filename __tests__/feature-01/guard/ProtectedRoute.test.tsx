import { render } from "@testing-library/react";
import { setupServer } from "msw/node";
import { handlers } from "@/mocks/handlers";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function Dummy() {
  return <div>ok</div>;
}

describe("Feature 01 — ProtectedRoute", () => {
  it("redirects unauthenticated users to /login", () => {
    render(
      <ProtectedRoute>
        <Dummy />
      </ProtectedRoute>
    );
    fail("not implemented");
  });

  it("renders children for authenticated users", () => {
    render(
      <ProtectedRoute>
        <Dummy />
      </ProtectedRoute>
    );
    fail("not implemented");
  });
});
