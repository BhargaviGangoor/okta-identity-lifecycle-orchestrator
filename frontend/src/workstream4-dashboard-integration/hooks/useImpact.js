import { useState } from "react";
import { getImpact } from "../services/api";

export function useImpact() {
  const [impact, setImpact] = useState(null);
  const loadImpact = (userId, action) =>
    getImpact(userId, action).then((r) => setImpact(r.data));
  return { impact, loadImpact };
}
