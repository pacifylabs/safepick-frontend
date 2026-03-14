import { render } from "@testing-library/react";
import VerifyPage from "@/app/(auth)/verify/page";
import { setupServer } from "msw/node";
import { handlers } from "@/mocks/handlers";

const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("VerifyPage", () => {
  it("renders the OTP input", () => {
    render(<VerifyPage />);
    fail("not implemented");
  });

  it("auto-submits when 6 digits are entered", async () => {
    render(<VerifyPage />);
    fail("not implemented");
  });

  it("shows error for invalid or expired OTP", async () => {
    render(<VerifyPage />);
    fail("not implemented");
  });

  it("resend enforces 60s cooldown and updates token", async () => {
    render(<VerifyPage />);
    fail("not implemented");
  });
});
