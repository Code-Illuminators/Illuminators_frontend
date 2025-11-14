import { describe, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import Promotion from "../Components/Promotion.jsx";
import { API_BASE_URL } from "../Components/Main.jsx";

const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

const mockLocalStorage = (user = null) => {
  const localStorageMock = {
    getItem: vi.fn((key) => {
      if (key === "user" && user) {
        return JSON.stringify(user);
      }
      return null;
    }),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  };
  Object.defineProperty(globalThis, "localStorage", {
    value: localStorageMock,
    writable: true,
  });
};

const user_id = 123;
const access_token = "access";

const userMocks = {
  simple: {
    access: access_token,
    user: { id: user_id, role: "simple" },
  },
  silver: {
    access: access_token,
    user: { id: user_id, role: "silver" },
  },
  gold: {
    access: access_token,
    user: { id: user_id, role: "gold" },
  },
  architecture: {
    access: access_token,
    user: { id: user_id, role: "architecture" },
  },
};

const response = {
  id: 456,
  message: "Vote created and waiting for moderation!",
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

describe("Promotion", () => {
  test("redirect to /login if unauthorized", () => {
    mockLocalStorage(userMocks.noToken);
    render(<Promotion />);

    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  test("simple to silver promotion", async () => {
    mockLocalStorage(userMocks.simple);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: () => Promise.resolve(response),
    });

    render(<Promotion />);

    const applyButton = screen.getByRole("button", {
      name: /apply for silver/i,
    });
    fireEvent.click(applyButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/moderation/votes/create/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${access_token}`,
          },
          body: JSON.stringify({
            nominated_user: `${user_id}`,
            promotion_role: "silver",
            vote_type: "promotion",
            roles_allowed_vote: ["silver"],
          }),
        },
      );
    });

    await waitFor(() => {
      expect(globalThis.alert).toHaveBeenCalledWith(
        `Vote created and waiting for moderation!`,
      );
    });
  });

  test("401 Unauthorized, redirect to /login", async () => {
    mockLocalStorage(userMocks.silver);
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ detail: "Token is invalid" }),
    });

    render(<Promotion />);
    const applyButton = screen.getByRole("button", {
      name: /apply for golden/i,
    });
    fireEvent.click(applyButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(globalThis.alert).toHaveBeenCalledWith("401 Unauthorized");
      expect(mockNavigate).toHaveBeenCalledWith("/login");
    });
  });
});
