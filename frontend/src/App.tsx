import { useState, useEffect, useMemo } from "react";
import "./App.css";

import { fetchWells, type Well } from "./api/wells";
import {
  fetchAlerts,
  type AlertStatus,
  type PaginatedAlertsOut,
} from "./api/alerts";

function App() {
  const [wells, setWells] = useState<Well[]>([]);
  const [alerts, setAlerts] = useState<PaginatedAlertsOut | null>(null);
  const [status, setStatus] = useState<AlertStatus | null>(null);
  const [offset, setOffset] = useState<number>(0);
  const [limit, setLimit] = useState<number>(25);

  const loadWells = async () => {
    try {
      const res = await fetchWells();
      setWells(res);
      // console.log(res)
    } catch (error) {
      console.error(error);
    }
  };

  const loadAlerts = async () => {
    try {
      const res = status
        ? await fetchAlerts({ status, limit, offset })
        : await fetchAlerts({ limit, offset });
      setAlerts(res);
      // console.log(res);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadWells();
  }, []);

  useEffect(() => {
    loadAlerts();
  }, [status, limit, offset]);

  // useEffect(() => {
  //   console.log(alerts); // ✅ runs after state has actually updated
  // }, [alerts]);

  const wellNameLookup = useMemo<Record<number, string>>(() => {
    return Object.fromEntries(wells.map((well) => [well.id, well.name]));
  }, [wells]);

  const listAlerts = alerts?.items.map((alert) => {
    const wellName = wellNameLookup[alert.well_id];
    return (
      <li key={alert.id}>
        {alert.id} {wellName ?? "Unknown Well"} {alert.message} {alert.severity}{" "}
        {alert.status}
      </li>
    );
  });

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === "") setStatus(null);
    else {
      setStatus(value as AlertStatus);
    }
    setOffset(0);
  };

  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === "") setLimit(25);
    else {
      setLimit(parseInt(value));
    }
    setOffset(0);
  };

  const handlePrevPage = () => {
    const newOffset = Math.max(offset - limit, 0);
    setOffset(newOffset);
  };

  const handleNextPage = () => {
    if (offset + limit < (alerts?.total ?? 0)) {
      setOffset(offset + limit);
    }
  };

  const statusOptions = ["open", "ack", "closed"];
  const limitOptions = [5, 10, 25];

  return (
    <>
      <select value={status ?? ""} onChange={handleStatusChange}>
        <option value="">All</option>
        {statusOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <select value={limit} onChange={handleLimitChange}>
        {limitOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ul>{listAlerts}</ul>
      <button onClick={handlePrevPage}>Prev</button>
      <button onClick={handleNextPage}>Next</button>
    </>
  );
}

export default App;
