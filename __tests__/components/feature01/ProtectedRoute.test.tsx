import { render } from "@testing-library/react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { setupServer } from "msw/node";
import { handlers } from "@/mocks/handlers";

const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function Dummy() {
  return <div>ok</div>;
}

describe("ProtectedRoute", () => {
  it("redirects when unauthenticated", () => {
    render(<ProtectedRoute><Dummy /></ProtectedRoute>);
    fail("not implemented");
  });

  it("renders children when authenticated", () => {
    render(<ProtectedRoute><Dummy /></ProtectedRoute>);
    fail("not implemented");
  });
});
