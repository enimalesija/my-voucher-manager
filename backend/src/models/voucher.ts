import { z } from "zod";

// A voucher is just a small object but very important.
// It basically represents one discount code the system generated.
// We want some rules (schema) so we dont end up with broken data.
// Using zod here gives us runtime validation and also types for free.
export const VoucherSchema = z.object({
  id: z.string(), // unique id
  code: z.string(), // the voucher code itself --> e.g. "DISCOUNT-123456"
  campaignId: z.string(), // which campaign this voucher belongs to (we can have many campaigbs thats why)
});

// Export a TypeScript type directly from the schema.
// This way whenever we talk about a Voucher in the codebase
// (store, API responses, etc.), it’s strongly typed and consistent.
export type Voucher = z.infer<typeof VoucherSchema>;
