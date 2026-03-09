import { useState, useEffect, useMemo } from "react";
import "./App.css";

import { fetchWells, type Well } from "./api/wells";
import {
  fetchAlerts,
  patchAlert,
  postAlert,
  type AlertSeverity,
  type AlertStatus,
  type PaginatedAlertsOut,
} from "./api/alerts";

function App() {
  const [wells, setWells] = useState<Well[]>([]);
  const [alerts, setAlerts] = useState<PaginatedAlertsOut | null>(null);
  const [status, setStatus] = useState<AlertStatus | null>(null);
  const [offset, setOffset] = useState<number>(0);
  const [limit, setLimit] = useState<number>(25);
  const [alertsLoading, setAlertsLoading] = useState(false);
  const [alertsError, setAlertsError] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createWellId, setCreateWellId] = useState<string>("");
  const [createSeverity, setCreateSeverity] = useState<string>("");
  const [createMessage, setCreateMessage] = useState<string>("");
  const [createError, setCreateError] = useState<string | null>(null);

  const user = "gingomx";

  const wellNameLookup = useMemo<Record<number, string>>(() => {
    return Object.fromEntries(wells.map((well) => [well.id, well.name]));
  }, [wells]);

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetchWells();
        setWells(res);
      } catch (error) {
        console.error(error);
      }
    };

    run();
  }, []);

  useEffect(() => {
    setAlertsLoading(true);
    setAlertsError(null);

    const run = async () => {
      try {
        // await new Promise((resolve) => setTimeout(resolve, 1000)); // testing delay
        // throw new Error("Test error"); // testing error
        const res = status
          ? await fetchAlerts({ status, limit, offset })
          : await fetchAlerts({ limit, offset });

        setAlerts(res);
        // setAlerts({
        //   // testing empty
        //   items: [],
        //   total: 0,
        //   offset,
        //   limit,
        // });
      } catch (error) {
        console.error(error);
        setAlertsError("Failed to load alerts");
      } finally {
        setAlertsLoading(false);
      }
    };

    run();
  }, [status, limit, offset]);

  // useEffect(() => {
  //   console.log(alerts); // ✅ runs after state has actually updated
  // }, [alerts]);

  const listAlerts =
    alerts?.items.map((alert) => {
      const wellName = wellNameLookup[alert.well_id] ?? "Unknown well";
      return (
        <tr key={alert.id}>
          <td>{alert.id}</td>
          <td>{wellName}</td>
          <td>{alert.severity}</td>
          <td>{alert.status}</td>
          <td>{alert.message}</td>
          <td>
            {alert.status === "open" && (
              <button onClick={() => handleAck(alert.id)}>Acknowledge</button>
            )}
            {alert.status === "ack" && (
              <button onClick={() => handleClose(alert.id)}>Close</button>
            )}
          </td>
        </tr>
      );
    }) ?? null;

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
      setLimit(Number(value));
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

  const reloadAlerts = async () => {
    const res = status
      ? await fetchAlerts({ status, limit, offset })
      : await fetchAlerts({ limit, offset });

    setAlerts(res);
  };

  const handleAck = async (id: number) => {
    try {
      await patchAlert({
        id: id,
        status: "ack",
        ack_by: user,
      });
      await reloadAlerts();
    } catch (error) {
      console.error(error);
    }
  };

  const handleClose = async (id: number) => {
    try {
      await patchAlert({
        id: id,
        status: "closed",
        close_by: user,
      });
      await reloadAlerts();
    } catch (error) {
      console.error(error);
    }
  };

  const statusOptions = ["open", "ack", "closed"];
  const limitOptions = [5, 10, 25];
  const alertSeverityOptions = ["low", "medium", "high", "critical"];

  let alertsContent: React.ReactNode;

  if (alertsLoading) {
    alertsContent = (
      <tr>
        <td colSpan={6}>Loading alerts...</td>
      </tr>
    );
  } else if (alertsError) {
    alertsContent = (
      <tr>
        <td colSpan={6}>{alertsError}</td>
      </tr>
    );
  } else if (alerts && alerts.items.length === 0) {
    alertsContent = (
      <tr>
        <td colSpan={6}>No alerts found.</td>
      </tr>
    );
  } else {
    alertsContent = listAlerts;
  }

  const canGoPrev = offset > 0;
  const canGoNext = offset + limit < (alerts?.total ?? 0);

  const closeCreateAlert = () => {
    setIsCreateOpen(false);
    setCreateWellId("");
    setCreateSeverity("");
    setCreateMessage("");
    setCreateError(null);
  };

  const handleCreateAlert = async () => {
    setCreateError(null);

    if (createWellId === "") {
      setCreateError("Please select a well.");
      return;
    }

    if (createSeverity === "") {
      setCreateError("Please select a severity.");
      return;
    }

    if (createMessage.trim() === "") {
      setCreateError("Please enter a message.");
      return;
    }

    try {
      await postAlert({
        well_id: Number(createWellId),
        severity: createSeverity as AlertSeverity,
        message: createMessage.trim(),
      });

      await reloadAlerts();

      closeCreateAlert();
    } catch (error) {
      console.error(error);
      setCreateError("Failed to create alert.");
    }
  };

  return (
    <>
      <header>
        <h2>Well Operations Console</h2>
      </header>
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

      <button
        onClick={() => {
          setIsCreateOpen(true);
        }}
      >
        Create Alert
      </button>
      {isCreateOpen && (
        <div>
          <h2>Create Alert</h2>
          {createError && <p>{createError}</p>}
          <form>
            <select
              value={createWellId}
              onChange={(e) => setCreateWellId(e.target.value)}
            >
              <option value="">Select one</option>
              {wells.map((well) => (
                <option key={well.id} value={well.id}>
                  {well.name}
                </option>
              ))}
            </select>
            <select
              value={createSeverity}
              onChange={(e) => setCreateSeverity(e.target.value)}
            >
              <option value="">Select one</option>
              {alertSeverityOptions.map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <textarea
              value={createMessage}
              onChange={(e) => setCreateMessage(e.target.value)}
              placeholder="Type message here"
            />
          </form>
          <button type="button" onClick={handleCreateAlert}>
            Submit
          </button>
          <button type="button" onClick={closeCreateAlert}>
            Close
          </button>
        </div>
      )}
      <section>
        <h2>Alerts</h2>

        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Well</th>
              <th>Severity</th>
              <th>Status</th>
              <th>Message</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>{alertsContent}</tbody>
        </table>
      </section>

      <button onClick={handlePrevPage} disabled={!canGoPrev}>
        Prev
      </button>
      <button onClick={handleNextPage} disabled={!canGoNext}>
        Next
      </button>
    </>
  );
}

export default App;
