import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./workstream4-dashboard-integration/pages/Dashboard";
import Users from "./workstream4-dashboard-integration/pages/Users";
import Joiner from "./workstream4-dashboard-integration/pages/Joiner";
import Mover from "./workstream4-dashboard-integration/pages/Mover";
import Leaver from "./workstream4-dashboard-integration/pages/Leaver";
import WhatIf from "./workstream4-dashboard-integration/pages/WhatIf";
import Drift from "./workstream4-dashboard-integration/pages/Drift";
import Audit from "./workstream4-dashboard-integration/pages/Audit";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/users" element={<Users />} />
        <Route path="/joiner" element={<Joiner />} />
        <Route path="/mover" element={<Mover />} />
        <Route path="/leaver" element={<Leaver />} />
        <Route path="/what-if" element={<WhatIf />} />
        <Route path="/drift" element={<Drift />} />
        <Route path="/audit" element={<Audit />} />
      </Routes>
    </BrowserRouter>
  );
}
