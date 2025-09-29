import { Voucher } from "../models/voucher.js";

export function vouchersToCSV(vouchers: Voucher[]): string {
  const header = "id,code,campaignId";
  // Converts each voucher object into a CSV row
  const rows = vouchers.map((v) => `${v.id},${v.code},${v.campaignId}`);
  // Join header + rows with newlines and return as a CSV string
  return [header, ...rows].join("\n");
}
