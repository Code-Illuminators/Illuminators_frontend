import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "./Main.jsx";

export default function LoginCard() {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    const form = e.target;
    const username = form.username.value;
    const password = form.password.value;

    fetch(`${API_BASE_URL}/api/auth/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => {
        console.log("Logged in:", data);
        localStorage.setItem("user", JSON.stringify(data));
        navigate("/main");
      });
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100">
      <div className="card shadow p-4" style={{ width: "min(92vw, 360px)" }}>
        <h2 className="text-center mb-3">Login</h2>
        <form className="vstack gap-3" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username" className="form-label">
              Username
            </label>
            <input
              id="username"
              name="username"
              className="form-control"
              placeholder="Enter your username"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-control"
              placeholder="Your password"
              autoComplete="current-password"
              required
            />
          </div>
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              id="remember"
              name="remember"
            />
            <label className="form-check-label" htmlFor="remember">
              Remember me
            </label>
          </div>
          <button type="submit" className="btn btn-primary w-100">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}
