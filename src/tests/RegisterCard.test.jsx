import { describe, expect, vi, beforeEach, afterAll } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import RegisterCard from "../Components/RegisterCard";
import { API_BASE_URL } from "../Components/Main.jsx";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

const mockConsoleLog = vi.spyOn(console, "log").mockImplementation(() => {});
const mockConsoleError = vi
  .spyOn(console, "error")
  .mockImplementation(() => {});

const mockLocalStorage = {
  setItem: vi.fn(),
  getItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(globalThis, "localStorage", {
  value: mockLocalStorage,
  writable: true,
});

const user_creds = {
  username: "user",
  email: "terraformfriend@gmail.com",
  password: "password",
};

const success_response = {
  token: "token",
  user: { id: 1, username: user_creds.username },
};

beforeEach(() => {
  mockFetch.mockClear();
  mockNavigate.mockClear();
  mockLocalStorage.setItem.mockClear();
  mockConsoleLog.mockClear();
  mockConsoleError.mockClear();
});

afterAll(() => {
  mockConsoleLog.mockRestore();
  mockConsoleError.mockRestore();
});

describe("RegisterCard", () => {
  test("register a user, store credentials, and navigate to /login", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(success_response),
    });

    render(<RegisterCard />);

    const usernameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /submit/i });

    const form = submitButton.closest("form");

    fireEvent.change(usernameInput, { target: { value: user_creds.username } });
    fireEvent.change(emailInput, { target: { value: user_creds.email } });
    fireEvent.change(passwordInput, { target: { value: user_creds.password } });

    form.username = usernameInput;
    form.email = emailInput;
    form.password = passwordInput;

    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/auth/register/`,
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(user_creds),
        }),
      );
    });

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      "user",
      JSON.stringify(success_response),
    );
    expect(mockLocalStorage.setItem).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });
});
