import { render } from "@testing-library/react";
import Page from "@/app/(auth)/signup/page";
import { setupServer } from "msw/node";
import { handlers } from "@/mocks/handlers";

const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("Feature 01 — /signup", () => {
  it("renders loading skeleton while fetching", () => {
    render(<Page />);
    fail("not implemented");
  });

  it("renders error state when PHONE_ALREADY_REGISTERED", () => {
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

  it("submits and navigates to /verify on success", () => {
    render(<Page />);
    fail("not implemented");
  });
});
