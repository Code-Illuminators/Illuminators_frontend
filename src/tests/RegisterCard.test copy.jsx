import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import RegisterCard from "../Components/RegisterCard";
import { API_BASE_URL } from "../Components/Main.jsx";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

const mockFetch = vi.fn();
global.fetch = mockFetch;

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
Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
  writable: true,
});

const user_creds = {
  username: "user",
  email: "some@gmail.com",
  password: "password",
};

const empty_user_creds = {
  username: "",
  email: "",
  password: "",
};

const success_response = {
  token: "fake-jwt-token",
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

describe("RegisterCard Component", () => {
  it("should send empty strings to API when form fields are empty", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(success_response),
    });

    render(<RegisterCard />);

    // 1. Знаходимо форму та інпути
    const form = screen
      .getByRole("button", { name: /submit/i })
      .closest("form");
    const usernameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);

    form.username = usernameInput;
    form.email = emailInput;
    form.password = passwordInput;

    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/auth/register/`,
        expect.objectContaining({
          body: JSON.stringify(empty_user_creds),
        }),
      );
    });
  });
});
