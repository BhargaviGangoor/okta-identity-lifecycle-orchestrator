import { useEffect, useState } from "react";
import { getUsers } from "../services/api";

export function useUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUsers()
      .then((r) => setUsers(r.data))
      .finally(() => setLoading(false));
  }, []);

  return { users, loading };
}
