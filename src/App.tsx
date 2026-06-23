import { HashRouter, Routes, Route } from "react-router";
import { Overall } from "./pages/Overall";
import { ReleaseNotes } from "./pages/ReleaseNotes";
import { Schedule } from "./pages/Schedule";

export default function App() {
  return (
    <HashRouter>
      <div className="min-h-screen bg-bg font-sans text-text">
        <Routes>
          <Route path="/" element={<Schedule />} />
          <Route path="/overall" element={<Overall />} />
          <Route path="/release-notes" element={<ReleaseNotes />} />
        </Routes>
      </div>
    </HashRouter>
  );
}
