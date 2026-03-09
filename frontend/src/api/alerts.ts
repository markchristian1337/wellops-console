export interface AlertOut {
  id: number;
  well_id: number;
  severity: AlertSeverity;
  message: string;
  status: AlertStatus;
  ack_by: string | null;
  ack_at: string | null;
  close_by: string | null;
  close_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export type AlertSeverity = "low" | "medium" | "high" | "critical";

export type AlertStatus = "open" | "ack" | "closed";

export interface PaginatedAlertsOut {
  items: AlertOut[];
  total: number;
  offset: number;
  limit: number;
}

interface FetchAlertsParams {
  status?: AlertStatus;
  limit: number;
  offset: number;
}

interface AlertPatch {
  id: number;
  status: "ack" | "closed";
  ack_by?: string;
  close_by?: string;
}

interface AlertCreate {
  well_id: number;
  severity: AlertSeverity;
  message: string;
}

export async function fetchAlerts({
  status,
  limit,
  offset,
}: FetchAlertsParams): Promise<PaginatedAlertsOut> {
  const params = new URLSearchParams({
    limit: limit.toString(),
    offset: offset.toString(),
  });

  if (status) {
    params.set("status", status);
  }

  const res = await fetch(`/api/alerts?${params.toString()}`);

  if (!res.ok) {
    throw new Error(`GET /api/alerts failed: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  return data;
}

export async function patchAlert({
  id,
  status,
  ack_by,
  close_by,
}: AlertPatch): Promise<AlertOut> {
  if (status === "ack" && !ack_by) {
    throw new Error(`Acknowledged by user not included`);
  }
  if (status === "closed" && !close_by) {
    throw new Error(`Closed by user not included`);
  }
  const res = await fetch(`/api/alerts/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      status,
      ack_by,
      close_by,
    }),
  });

  if (!res.ok) {
    throw new Error(
      `PATCH /api/alerts failed: ${res.status} ${res.statusText}`,
    );
  }

  const data = await res.json();
  return data;
}

export async function postAlert({
  well_id,
  severity,
  message,
}: AlertCreate): Promise<AlertOut> {
  const res = await fetch(`/api/alerts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      well_id,
      severity,
      message,
    }),
  });

  if (!res.ok) {
    throw new Error(`POST /api/alerts failed: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  return data;
}
