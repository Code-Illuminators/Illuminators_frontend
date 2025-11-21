/* eslint-disable react/prop-types */
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { describe, expect, vi, beforeEach } from "vitest";
import Main from "../Components/Main";

vi.mock("../main.jsx", () => ({
  default: () => ({}),
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock("react-leaflet", () => ({
  MapContainer: ({ children }) => (
    <div data-testid="map-container">{children}</div>
  ),
  Marker: ({ children, position, icon }) => {
    let lat, lng;
    if (Array.isArray(position)) {
      [lat, lng] = position;
    } else {
      lat = null;
      lng = null;
    }
    const latStr = lat != null ? lat.toString() : "";
    const lngStr = lng != null ? lng.toString() : "";

    return (
      <div
        data-testid="marker"
        data-lat={latStr}
        data-lng={lngStr}
        data-icon={icon ? icon.options.iconUrl : ""}
      >
                {children}     {" "}
      </div>
    );
  },
  TileLayer: () => <div data-testid="tile-layer" />,
  Popup: ({ children }) => <div data-testid="popup">{children}</div>,
  useMapEvents: (handlers) => {
    globalThis.mapClick = handlers.click;
    return null;
  },
}));

vi.mock("leaflet", () => ({
  Icon: vi.fn(function (options) {
    this.options = options;
  }),
}));

vi.mock("../img/big_foot_marker.png", () => ({ default: "bigfoot.png" }));
vi.mock("../img/ufo_marker.png", () => ({ default: "ufo.png" }));
vi.mock("../img/ghost_marker.png", () => ({ default: "ghost.png" }));
vi.mock("../img/question-marker.png", () => ({ default: "default.png" }));

const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

const mockAlert = vi.fn();
const mockConfirm = vi.fn();
globalThis.alert = mockAlert;
globalThis.confirm = mockConfirm;

const localStorageMock = (function () {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();
Object.defineProperty(globalThis, "localStorage", {
  value: localStorageMock,
  writable: true,
});

const simpleUser = {
  access: "access",
  refresh: "refresh",
  user: { role: "simple" },
};
const silverUser = {
  access: "access",
  refresh: "refresh",
  user: { role: "silver" },
};
const goldenUser = {
  access: "access",
  refresh: "refresh",
  user: { role: "gold" },
};

const setupUser = (user) => {
  localStorage.setItem("user", JSON.stringify(user));
};

describe("Main", () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="root"></div>';

    vi.clearAllMocks();
    localStorage.clear();

    const mockInitialLoad = (type, data) => ({
      json: async () => data,
      ok: true,
      status: 200,
    });

    mockFetch.mockImplementation((url) => {
      if (url.includes("/api/posts/bigfoot/")) {
        return Promise.resolve(
          mockInitialLoad("bigfoot", [
            {
              id: 101,
              type: "bigfoot",
              lat: 50,
              lng: 30,
              location: "Lviv",
              image: "/img/1.jpg",
            },
          ]),
        );
      }
      if (url.includes("/api/posts/ufo/")) {
        return Promise.resolve(
          mockInitialLoad("ufo", [
            {
              id: 102,
              type: "ufo",
              lat: 51,
              lng: 31,
              location: "Kyiv",
              image: "/img/2.jpg",
            },
          ]),
        );
      }
      return Promise.resolve({ json: async () => [], ok: true, status: 200 });
    });
  });

  test("handleSubmit", async () => {
    setupUser(silverUser);
    render(<Main />);

    await waitFor(() => expect(globalThis.mapClick).toBeDefined());
    fireEvent.click(screen.getByRole("button", { name: /UFO/i }));
    fireEvent.change(screen.getByLabelText(/Location/i), {
      target: { value: "Roswell" },
    });
    await act(async () => {
      globalThis.mapClick({ latlng: { lat: 33.3, lng: -104.5 } });
    });

    const file = new File(["(image)"], "ufo_photo.jpg", { type: "image/jpeg" });
    fireEvent.change(screen.getByLabelText(/Photo \(required\)/i), {
      target: { files: [file] },
    });

    mockFetch.mockResolvedValueOnce({
      json: async () => ({ id: 999, image: "/media/ufo_photo.jpg" }),
      ok: true,
      status: 201,
    });

    const submitButton = screen.getByRole("button", { name: /Submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/posts/ufo/create/"),
        expect.objectContaining({
          method: "POST",
          body: expect.any(FormData),
        }),
      );
      expect(mockAlert).toHaveBeenCalledWith("Submitted creature");
      expect(screen.getAllByTestId("marker")).toHaveLength(3);
      const newMarker = screen
        .getAllByTestId("marker")
        .find((m) => m.getAttribute("data-lat") === "33.3");
      expect(newMarker.getAttribute("data-icon")).toBe("ufo.png");
    });
  });
  test("silver user and higher can delete marker", async () => {
    setupUser(silverUser);
    mockConfirm.mockReturnValue(true);

    render(<Main />);

    await waitFor(() =>
      expect(screen.getAllByTestId("marker")).toHaveLength(2),
    );

    mockFetch.mockResolvedValueOnce({
      json: async () => ({ success: true }),
      ok: true,
      status: 200,
    });

    const allInitialMarkers = screen.getAllByTestId("marker");
    const markerToDelete = allInitialMarkers.find(
      (m) => m.getAttribute("data-lat") === "50",
    );
    expect(markerToDelete).toBeInTheDocument();
    const deleteButton = markerToDelete.querySelector("button.btn-danger");
    expect(deleteButton).toBeInTheDocument();
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockConfirm).toHaveBeenCalledWith(
        expect.stringContaining(
          "Are you sure you want to delete this sighting for bigfoot at Lviv?",
        ),
      );

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/posts/bigfoot/101/delete/"),
        expect.objectContaining({
          method: "DELETE",
        }),
      );

      expect(screen.getAllByTestId("marker")).toHaveLength(1);
      expect(screen.getByTestId("marker").getAttribute("data-lat")).toBe("51");
      expect(mockAlert).toHaveBeenCalledWith("Marker deleted successfully!");
    });
  });

  test("golden user can use WE ARE COMPROMISED button", async () => {
    setupUser(goldenUser);
    render(<Main />);

    await waitFor(() =>
      expect(screen.getAllByTestId("marker")).toHaveLength(2),
    );

    const maydayButton = screen.getByText(/WE ARE COMPROMISED/i);
    expect(maydayButton).toBeInTheDocument();

    mockConfirm.mockReturnValue(true);
    mockFetch.mockResolvedValueOnce({
      json: async () => ({ success: true }),
      ok: true,
      status: 200,
    });

    await act(async () => {
      fireEvent.click(maydayButton);
    });

    await waitFor(() => {
      expect(mockConfirm).toHaveBeenCalledWith("Are you sure about it ?");
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/moderation/delete-all/"),
        expect.objectContaining({
          method: "DELETE",
        }),
      );

      expect(screen.queryAllByTestId("marker")).toHaveLength(0);
      expect(mockAlert).toHaveBeenCalledWith(
        "All password have been deleted successfully",
      );
    });
  });

  test("users that have lower rank than golden can not user WE ARE COMPROMISED button", () => {
    setupUser(simpleUser);
    const { rerender } = render(<Main />);
    expect(screen.queryByText(/WE ARE COMPROMISED/i)).not.toBeInTheDocument();

    setupUser(silverUser);
    rerender(<Main />);
    expect(screen.queryByText(/WE ARE COMPROMISED/i)).not.toBeInTheDocument();
  });

  test("log out", async () => {
    setupUser(silverUser);
    render(<Main />);
    const logoutButton = screen.getByRole("button", { name: /Logout/i });
    fireEvent.click(logoutButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/auth/logout/"),
        expect.any(Object),
      );
      expect(localStorage.removeItem).toHaveBeenCalledWith("user");
      expect(mockNavigate).toHaveBeenCalledWith("/login");
    });
  });
});
