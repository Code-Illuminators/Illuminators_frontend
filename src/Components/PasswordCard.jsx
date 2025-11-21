import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "./Main.jsx";

export default function PasswordCard() {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const password = e.target.password.value.trim();

    fetch(`${API_BASE_URL}/api/auth/entry-password/check/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: password }),
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((errorData) => {
            throw new Error(errorData.message);
          });
        }
        return res.json();
      })
      .then((data) => {
        if (data.valid === true) {
          alert(data.message);
          navigate("/register");
        }
      });
  };

  return (
    <div className="card shadow p-4" style={{ width: "min(90vw, 340px)" }}>
            <h2 className="text-center mb-3">Sign in</h2>     {" "}
      <div id="liveAlertPlaceholder"></div>     {" "}
      <form id="loginForm" className="vstack gap-3" onSubmit={handleSubmit}>
               {" "}
        <div>
                   {" "}
          <label htmlFor="password" className="form-label">
                        Password          {" "}
          </label>
                   {" "}
          <input
            type="password"
            id="password"
            name="password"
            className="form-control"
            placeholder="Your password"
            required
          />
                 {" "}
        </div>
               {" "}
        <button id="loginBtn" type="submit" className="btn btn-primary w-100">
                    Submit        {" "}
        </button>
             {" "}
      </form>
         {" "}
    </div>
  );
}
