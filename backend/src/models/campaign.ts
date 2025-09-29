import { z } from "zod";

// Schema for a Campaign object.
// I use Zod here because it makes validation + types super easy.
// Every campaign has:
// - id: unique UUID string
// - name: at least 1 char (just so it's not empty)
// - validFrom / validTo: ISO date strings (so frontend/backend speak same format)
// - amount: number > 0 (discount value)
// - currency: strictly 3 letters like "SEK" or "USD"
// - prefix: used when generating voucher codes, min 3 chars
export const CampaignSchema = z
  .object({
    id: z.string(),
    name: z.string().min(1),
    validFrom: z.string().datetime(),
    validTo: z.string().datetime(),
    amount: z.number().positive(),
    currency: z.string().regex(/^[A-Za-z]{3}$/, "Currency must be 3 letters"),
    prefix: z.string().min(3),
  })
  // extra rule: end date must always be after start date
  .refine((c) => new Date(c.validTo) > new Date(c.validFrom), {
    path: ["validTo"],
    message: "validTo must be after validFrom",
  });

// When user sends data (lets say creating a campaign),
// they don’t provide the id (we generate it).
// So I just reuse the schema but omit id.
export const CampaignInputSchema = CampaignSchema.omit({ id: true });

// TS types automatically generated from schemas.
// This way everywhere else in the backend we have type safety without writing the types by hand.
export type Campaign = z.infer<typeof CampaignSchema>;
export type CampaignInput = z.infer<typeof CampaignInputSchema>;
