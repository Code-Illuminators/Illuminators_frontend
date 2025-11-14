import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import "@testing-library/jest-dom";
import ChangePassword from "../Components/ChangePassword";
import { API_BASE_URL } from "../Components/Main.jsx";

const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

describe("Change Password", () => {
  beforeEach(() => {
    mockFetch.mockClear();
    vi.spyOn(globalThis, "alert").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => {
    globalThis.alert.mockRestore();
    console.warn.mockRestore();
  });

  const submitForm = async (password = "testpassword") => {
    const passwordInput = screen.getByPlaceholderText(/Enter new password/i);
    fireEvent.change(passwordInput, { target: { value: password } });
    const form = screen
      .getByRole("button", { name: /Submit/i })
      .closest("form");
    if (!form) {
      throw new Error("Form element not found in DOM!");
    }
    await fireEvent.submit(form, {
      target: {
        newPassword: { value: password },
      },
    });
  };

  test("alerts and redirects if no access token", async () => {
    render(<ChangePassword />);

    await submitForm("password");

    expect(globalThis.alert).toHaveBeenCalledWith(
      "Authorization failed. Please log in.",
    );
    expect(mockNavigate).toHaveBeenCalledWith("/login");
    expect(mockFetch).not.toHaveBeenCalled();
  });

  test("change password", async () => {
    const testPassword = "password";
    const mockUser = { access: "access" };
    localStorage.setItem("user", JSON.stringify(mockUser));

    mockFetch.mockResolvedValueOnce({
      status: 200,
      json: async () => ({ message: "Password updated" }),
      ok: true,
    });

    render(<ChangePassword />);

    await submitForm(testPassword);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/auth/change-password/`,
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ new_password: testPassword }),
        }),
      );
    });

    expect(globalThis.alert).toHaveBeenCalledWith(
      "Password changed successfully!",
    );
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });
});
