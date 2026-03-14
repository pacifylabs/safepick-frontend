import { render } from "@testing-library/react";
import DashboardPage from "@/app/(parent)/dashboard/page";
import { setupServer } from "msw/node";
import { handlers } from "@/mocks/handlers";

const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("DashboardPage", () => {
  it("renders empty state for new parent", () => {
    render(<DashboardPage />);
    fail("not implemented");
  });
});
