import { useNavigate } from "react-router-dom";

export default function ChangePassword() {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    const form = e.target;
    const newPassword = form.newPassword.value;

    const user = JSON.parse(localStorage.getItem("user"));
    const accessToken = user?.access;

    if (!accessToken) {
      alert("Authorization failed. Please log in.");
      navigate("/login");
      return;
    }

    fetch("http://localhost:8000/api/auth/change-password/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ new_password: newPassword }),
    })
    .then(res => {
                if (res.status === 401) {
                    localStorage.removeItem("user");
                    navigate("/login");
                    throw new Error("401 Unauthorized"); 
                }
                if (res.status === 404) {
                    console.warn(`404 Not posts found`);
                    return [];
                }
                return res.json();
        })

    .then(data => {
        console.log("Password changed:", data);
        alert("Password changed successfully!");
        
        navigate("/login");
    })
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100">
      <div className="card shadow p-4" style={{ width: "min(92vw, 360px)" }}>
        <h2 className="text-center mb-3">Change password</h2>
        <form className="vstack gap-3" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="newPassword" className="form-label">
              New password
            </label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              className="form-control"
              placeholder="Enter new password"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}