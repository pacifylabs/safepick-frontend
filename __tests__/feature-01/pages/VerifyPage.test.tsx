import { render } from "@testing-library/react";
import Page from "@/app/(auth)/verify/page";
import { setupServer } from "msw/node";
import { handlers } from "@/mocks/handlers";

const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("Feature 01 — /verify", () => {
  it("renders loading skeleton while fetching", () => {
    render(<Page />);
    fail("not implemented");
  });

  it("renders error state when OTP_INVALID_OR_EXPIRED", () => {
    render(<Page />);
    fail("not implemented");
  });

  it("renders empty state when otpToken missing", () => {
    render(<Page />);
    fail("not implemented");
  });

  it("renders populated state with 6 OTP boxes", () => {
    render(<Page />);
    fail("not implemented");
  });

  it("renders stale indicator when data is refreshing", () => {
    render(<Page />);
    fail("not implemented");
  });

  it("auto-submits on sixth digit and redirects on success", () => {
    render(<Page />);
    fail("not implemented");
  });

  it("resend enforces 60s cooldown and updates otpToken", () => {
    render(<Page />);
    fail("not implemented");
  });
});
