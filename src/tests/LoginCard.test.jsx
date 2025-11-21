import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { vi } from "vitest";
import "@testing-library/jest-dom";
import LoginCard from "../Components/LoginCard";

const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

describe("LoginCard", () => {
  beforeEach(() => {
    mockFetch.mockClear();
    vi.spyOn(globalThis, "alert").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
    globalThis.alert.mockRestore();
    console.log.mockRestore();
    console.error.mockRestore();
  });

  const SubmitForm = async (username, password) => {
    const form = screen.getByRole("button", { name: /Submit/i });

    const usernameInput = screen.getByPlaceholderText(/Enter your username/i);
    const passwordInput = screen.getByPlaceholderText(/Your password/i);

    fireEvent.change(usernameInput, { target: { value: username } });
    fireEvent.change(passwordInput, { target: { value: password } });

    fireEvent.submit(form, {
      target: {
        username: { value: username },
        password: { value: password },
      },
    });
  };

  test("log in", async () => {
    const mockData = { access: "access", user_id: 1 };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockData,
    });

    render(<LoginCard />);
    await SubmitForm("user123", "password123");
  });
});
