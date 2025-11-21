import { describe, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import PasswordCard from "../Components/PasswordCard";
import { API_BASE_URL } from "../Components/Main.jsx";

const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

const response = {
  valid: true,
  message: "Access granted!",
};

beforeEach(() => {
  mockFetch.mockClear();
  vi.spyOn(globalThis, "alert").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.spyOn(globalThis, "alert").mockRestore();
});

describe("PasswordCard", () => {
  test("password check and navigate to /register", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(response),
    });

    const { container } = render(<PasswordCard />);
    const passwordInput = screen.getByLabelText(/password/i);
    const form = container.querySelector("#loginForm");
    const passwordValue = "password";

    fireEvent.change(passwordInput, { target: { value: passwordValue } });

    fireEvent.submit(form, {
      target: {
        password: { value: passwordValue },
        preventDefault: vi.fn(),
      },
    });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/auth/entry-password/check/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: passwordValue }),
        },
      );
    });

    await waitFor(() => {
      expect(globalThis.alert).toHaveBeenCalledWith(response.message);
      expect(mockNavigate).toHaveBeenCalledWith("/register");
    });
  });
});
