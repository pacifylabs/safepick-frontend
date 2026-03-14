import { render } from "@testing-library/react";
import Page from "@/app/(auth)/login/page";
import { setupServer } from "msw/node";
import { handlers } from "@/mocks/handlers";

const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("Feature 01 — /login", () => {
  it("renders loading skeleton while fetching", () => {
    render(<Page />);
    fail("not implemented");
  });

  it("renders error state when invalid credentials", () => {
    render(<Page />);
    fail("not implemented");
  });

  it("renders empty state when form untouched", () => {
    render(<Page />);
    fail("not implemented");
  });

  it("renders populated state with valid input", () => {
    render(<Page />);
    fail("not implemented");
  });

  it("renders stale indicator when data is refreshing", () => {
    render(<Page />);
    fail("not implemented");
  });

  it("submits and redirects to /dashboard on success", () => {
    render(<Page />);
    fail("not implemented");
  });
});
