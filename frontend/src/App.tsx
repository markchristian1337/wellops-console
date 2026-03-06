import { useState, useEffect } from "react";
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

  const runWells = async () => {
    try {
      const res = await fetchWells();
      setWells(res);
      // console.log(res)
    } catch (error) {
      console.error(error);
    }
  };

  const runAlerts = async () => {
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
    runWells();
  }, []);

  useEffect(() => {
    runAlerts();
  }, [status, limit, offset]);

  // useEffect(() => {
  //   console.log(alerts); // ✅ runs after state has actually updated
  // }, [alerts]);

  const listWells = wells.map(
    (
      well, //testing
    ) => (
      // The key prop is essential for performance and stability
      <li key={well.id}>{well.name}</li>
    ),
  );

  const listAlerts = alerts?.items.map((alert) => {
    const wellName = wells.find((well) => well.id === alert.well_id)?.name;
    return (
      <>
        <li key={alert.id}>
          {wellName ?? "Unknown Well"} {alert.message} {alert.severity}
          {alert.status}
        </li>
      </>
    );
  });

  return (
    <>
      <ul>{listWells}</ul>
      <ul>{listAlerts}</ul>
    </>
  );
}

export default App;
