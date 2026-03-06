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
