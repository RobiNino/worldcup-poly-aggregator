import { HashRouter, Routes, Route } from "react-router";
import { Predictions } from "./pages/Predictions";
import { Schedule } from "./pages/Schedule";

export default function App() {
  return (
    <HashRouter>
      <div className="min-h-screen bg-bg font-sans text-text">
        <Routes>
          <Route path="/" element={<Predictions />} />
          <Route path="/schedule" element={<Schedule />} />
        </Routes>
      </div>
    </HashRouter>
  );
}
