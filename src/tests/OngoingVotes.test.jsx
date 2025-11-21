import {
  render,
  screen,
  waitFor,
  fireEvent,
  cleanup,
} from "@testing-library/react";
import { vi } from "vitest";
import "@testing-library/jest-dom";
import OngoingVotes from "../Components/OngoingVotes";
import { API_BASE_URL } from "../Components/Main.jsx";

const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

const localStorageMock = (user) => ({
  getItem: vi.fn((key) => {
    if (key === "user") {
      return JSON.stringify(user);
    }
    return null;
  }),
  removeItem: vi.fn(),
  clear: vi.fn(),
});

const mock_votes = [
  {
    id: 101,
    nominated_user_username: "user1",
    promotion_role: "gold",
    status: "active",
    for_amount: 5,
    against_amount: 2,
    progress: 70,
  },
  {
    id: 102,
    nominated_user_username: "user2",
    promotion_role: "silver",
    status: "active",
    for_amount: 1,
    against_amount: 0,
    progress: 10,
  },
];

const goldenUser = {
  access: "access",
  user: { role: "gold" },
};

let mockAlert;

describe("OngoingVotes", () => {
  beforeEach(() => {
    mockFetch.mockClear();
    mockNavigate.mockClear();
    vi.clearAllMocks();

    mockAlert = vi.spyOn(globalThis, "alert").mockImplementation(() => {});
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
    mockAlert.mockRestore();
    console.log.mockRestore();
    console.error.mockRestore();
  });

  test("redirect if unauthorized", () => {
    Object.defineProperty(globalThis, "localStorage", {
      value: localStorageMock(null),
    });

    render(<OngoingVotes />);

    expect(mockNavigate).toHaveBeenCalledWith("/login");
    expect(mockFetch).not.toHaveBeenCalled();
  });

  test("submit proccess", async () => {
    Object.defineProperty(globalThis, "localStorage", {
      value: localStorageMock(goldenUser),
    });

    mockFetch.mockResolvedValueOnce({
      json: async () => mock_votes,
      status: 200,
    });

    mockFetch.mockResolvedValueOnce({
      json: async () => ({ message: "Vote recorded" }),
      status: 200,
    });

    mockFetch.mockResolvedValueOnce({
      json: async () => [],
      status: 200,
    });

    render(<OngoingVotes />);

    await waitFor(() => {
      expect(screen.getByText(/Vote for user1/i)).toBeInTheDocument();
    });

    const yesButton = screen.getAllByRole("button", { name: /YES/i })[0];
    fireEvent.click(yesButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenNthCalledWith(
        2,
        `${API_BASE_URL}/api/moderation/votes/101/vote/`,
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ choice: "for" }),
          headers: expect.objectContaining({
            Authorization: "Bearer access",
          }),
        }),
      );
      expect(mockAlert).toHaveBeenCalledWith("Vote submitted successfully!");
    });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(3);
      expect(
        screen.getByText(/There is no any votes for now/i),
      ).toBeInTheDocument();
    });
  });

  test("handle 401 fetchVotes", async () => {
    const mockStorage = localStorageMock(goldenUser);
    Object.defineProperty(globalThis, "localStorage", { value: mockStorage });

    mockFetch.mockResolvedValueOnce({
      json: async () => ({ detail: "Invalid token" }),
      status: 401,
    });

    render(<OngoingVotes />);

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith("401 Unauthorized");
      expect(mockStorage.removeItem).toHaveBeenCalledWith("user");
      expect(mockNavigate).toHaveBeenCalledWith("/login");
    });
  });
});
