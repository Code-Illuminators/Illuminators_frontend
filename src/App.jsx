import { Routes, Route, Navigate } from "react-router-dom";
import PasswordCard from "./Components/PasswordCard.jsx";
import RegisterCard from "./Components/RegisterCard.jsx";
import LoginCard from "./Components/LoginCard.jsx";
import Main from "./Components/Main.jsx";
import ChangePassword from "./Components/ChangePassword.jsx";
// import Vote from "./Components/Vote.jsx";
import Promotion from "./Components/Promotion.jsx";
import OngoingVotes from "./Components/OngoingVotes.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<PasswordCard />} />
      <Route path="/register" element={<RegisterCard />} />
      <Route path="/login" element={<LoginCard />} />
      <Route path="/main" element={<Main />} />
      <Route path="/change-password" element={<ChangePassword />} />
      {/* <Route path="/vote" element={<Vote />} /> */}
      <Route path="/promotion" element={<Promotion />} />
      <Route path="/ongoing-votes" element={<OngoingVotes />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
