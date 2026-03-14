import { render } from "@testing-library/react";
import SignupPage from "@/app/(auth)/signup/page";
import { setupServer } from "msw/node";
import { handlers } from "@/mocks/handlers";

const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("SignupPage", () => {
  it("renders the signup form", () => {
    render(<SignupPage />);
    fail("not implemented");
  });

  it("shows loading state during submission", async () => {
    render(<SignupPage />);
    fail("not implemented");
  });

  it("shows error when phone is already registered", async () => {
    render(<SignupPage />);
    fail("not implemented");
  });

  it("submits and navigates to verify on success", async () => {
    render(<SignupPage />);
    fail("not implemented");
  });
});
