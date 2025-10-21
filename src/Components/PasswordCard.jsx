import { useNavigate } from "react-router-dom";

export default function PasswordCard() {
  const navigate = useNavigate();
  const DEFAULT_PASSWORD = "1234";

  const handleSubmit = (e) => {
    e.preventDefault();
    const password = e.target.password.value.trim();

    if (password === DEFAULT_PASSWORD) {
      navigate("/register");
    } else {
      alert("❌ Wrong password");
    }
  };

  return (
    <div className="card shadow p-4" style={{ width: "min(90vw, 340px)" }}>
      <h2 className="text-center mb-3">Sign in</h2>
      <div id="liveAlertPlaceholder"></div>

      <form id="loginForm" className="vstack gap-3" onSubmit={handleSubmit}>
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
            required
          />
        </div>

        <button id="loginBtn" type="submit" className="btn btn-primary w-100">
          Submit
        </button>
      </form>
    </div>
  );
}
