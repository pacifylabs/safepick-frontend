import { render } from "@testing-library/react";
import LoginPage from "@/app/(auth)/login/page";
import { setupServer } from "msw/node";
import { handlers } from "@/mocks/handlers";

const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("LoginPage", () => {
  it("renders the login form", () => {
    render(<LoginPage />);
    fail("not implemented");
  });

  it("shows loading state during submission", async () => {
    render(<LoginPage />);
    fail("not implemented");
  });

  it("logs in and redirects to dashboard on success", async () => {
    render(<LoginPage />);
    fail("not implemented");
  });

  it("shows invalid credentials error", async () => {
    render(<LoginPage />);
    fail("not implemented");
  });
});
