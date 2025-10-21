import { Routes, Route, Navigate } from "react-router-dom";
import PasswordCard from "./Components/PasswordCard.jsx";
import RegisterCard from "./Components/RegisterCard.jsx";
import LoginCard from "./Components/LoginCard.jsx";
import Main from "./Components/Main.jsx"; 

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<PasswordCard />} />
      <Route path="/register" element={<RegisterCard />} />
      <Route path="/login" element={<LoginCard />} />
      <Route path="/main" element={<Main />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}