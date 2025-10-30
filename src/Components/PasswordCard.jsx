import { useNavigate } from "react-router-dom";

export default function PasswordCard() {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    const form = e.target;
    const password = form.password.value.trim();

    fetch("http://localhost:8000/api/auth/entry-password/check/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => {
        if (data.valid === true) {
          navigate("/register");
        } else {
          alert(" Wrong password");
        }
      })
      .catch((err) => {
        console.error(" Password check error:", err);
        alert(" Server error, try again later.");
      });
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
