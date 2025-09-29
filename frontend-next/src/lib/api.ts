// The wrapper class with fetch to call the backend. Here we have helpers like: listCampaigns, createCampaign, deleteCampaign, createVouchers, listVouchers, csvUrl

// Types we use for campaigns
export type Campaign = {
  id: string;
  name: string;
  validFrom: string; // iso string of start date
  validTo: string; // iso string of end date
  amount: number;
  currency: string; // like "SEK", "EUR", "USD"
  prefix: string; // voucher code prefix
};

// Each voucher is basically linked to a campaign
export type Voucher = { id: string; code: string; campaignId: string };

// Base url for the backend api, if nothing in env then fallback to localhost
const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

// generic http helper – i made it so i dont have to repeat fetch everywhere
async function http<T>(url: string, init: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    ...(init.headers as Record<string, string> | undefined),
  };
  if (init.body != null && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${BASE}${url}`, {
    mode: "cors",
    credentials: "omit",
    ...init,
    headers,
  });

  // handle errors
  if (!res.ok) {
    let msg = `${res.status} ${res.statusText}`;
    try {
      const data = await res.json();
      if (data && typeof data === "object" && "error" in data) {
        msg = data.error; // <-- use backend { error: "..." }
      }
    } catch {
      // fallback: try plain text
      const text = await res.text().catch(() => "");
      if (text) msg = text;
    }
    throw new Error(msg);
  }

  // no content
  if (res.status === 204) return undefined as T;

  // normal response
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return (await res.json()) as T;

  const text = await res.text();
  return text as unknown as T;
}

// exposed api helpers so frontend can just call these
export const api = {
  // list all campaigns
  listCampaigns: () => http<Campaign[]>("/campaigns"),

  // create a new campaign
  createCampaign: (data: Omit<Campaign, "id">) =>
    http<Campaign>("/campaigns", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // delete campaign by id
  deleteCampaign: (id: string) =>
    http<void>(`/campaigns/${id}`, { method: "DELETE" }), // no body so no header

  // generate vouchers for a campaign
  createVouchers: (id: string, count: number) =>
    http<{ created: number }>(`/campaigns/${id}/vouchers`, {
      method: "POST",
      body: JSON.stringify({ count }),
    }),

  // list all vouchers for a campaign
  listVouchers: (id: string) => http<Voucher[]>(`/campaigns/${id}/vouchers`),

  // get the csv download url directly
  csvUrl: (id: string) => `${BASE}/campaigns/${id}/vouchers.csv`,
};
