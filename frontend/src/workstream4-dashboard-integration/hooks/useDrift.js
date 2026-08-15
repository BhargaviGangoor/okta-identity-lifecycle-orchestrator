import { useEffect, useState } from "react";
import { getDrift } from "../services/api";

export function useDrift() {
  const [drift, setDrift] = useState([]);
  useEffect(() => { getDrift().then((r) => setDrift(r.data)); }, []);
  return drift;
}
