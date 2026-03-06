export interface Well {
  id: number;
  name: string;
  api_number: string;
  basin: string | null;
  status: string | null;
  lat: number | null;
  lon: number | null;
}

export async function fetchWells(): Promise<Well[]> {
  const res = await fetch("/api/wells");

  if (!res.ok) {
    throw new Error(`GET /api/wells failed: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  return data;
}
