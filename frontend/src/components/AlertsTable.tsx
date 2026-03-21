import React from "react";
import type { PaginatedAlertsOut } from "../api/alerts";

type Props = {
  alerts: PaginatedAlertsOut | null;
  alertsLoading: boolean;
  alertsError: string | null;
  wellNameLookup: Record<number, string>;
  onAck: (id: number) => Promise<void>;
  onClose: (id: number) => Promise<void>;
};

function AlertsTable({
  alerts,
  alertsLoading,
  alertsError,
  wellNameLookup,
  onAck,
  onClose,
}: Props) {
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
              <button onClick={() => onAck(alert.id)}>Acknowledge</button>
            )}
            {alert.status === "ack" && (
              <button onClick={() => onClose(alert.id)}>Close</button>
            )}
          </td>
        </tr>
      );
    }) ?? null;
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
  return (
    <div>
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
    </div>
  );
}

export default AlertsTable;
