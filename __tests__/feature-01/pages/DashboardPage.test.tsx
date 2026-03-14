import { render } from "@testing-library/react";
import Page from "@/app/(parent)/dashboard/page";
import { setupServer } from "msw/node";
import { handlers } from "@/mocks/handlers";

const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("Feature 01 — /dashboard empty shell", () => {
  it("renders loading skeleton while fetching", () => {
    render(<Page />);
    fail("not implemented");
  });

  it("renders error state when dashboard fails to load", () => {
    render(<Page />);
    fail("not implemented");
  });

  it("renders empty state for a new parent", () => {
    render(<Page />);
    fail("not implemented");
  });

  it("renders stale indicator when data is refreshing", () => {
    render(<Page />);
    fail("not implemented");
  });
});
