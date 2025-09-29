import { randomUUID, randomInt } from "crypto";
import { setImmediate as setImmediateAsync } from "timers/promises";
import { Campaign } from "../models/campaign.js";
import { Voucher } from "../models/voucher.js";

// One of the most important part the core of our backend...
// In-memory store (acts as DB replacement for demo)

const campaigns = new Map<string, Campaign>();
const vouchers = new Map<string, Voucher>();

// To make sure voucher codes are always unique even across different campaigns
// I keep a global set of all codes that were generated so far.
const codesGlobal = new Set<string>();

// Voucher code format = PREFIX-XXXXXX
// The "XXXXXX" part is base36 (digits + letters) with 6 characters.
// 36^6 = about 2.1 billion combos --> basically endless for our case.
const CODE_LEN = 6;
const BASE36_SPACE = 36 ** CODE_LEN;

// Helper to generate one random base36 code. Example: "0AB12Z"
function randomCodeBase36(len = CODE_LEN): string {
  const n = randomInt(0, BASE36_SPACE); // pick a random number in full space
  return n.toString(36).toUpperCase().padStart(len, "0");
}

// Central store object – acts like our "fake" DB layer
export const Store = {
  // ---------------- Campaigns ----------------
  createCampaign(input: Omit<Campaign, "id">): Campaign {
    //  check if any existing campaign already has this name (we dont want same name campaigns)
    const exists = Array.from(campaigns.values()).some(
      (c) => c.name.toLowerCase() === input.name.toLowerCase()
    );
    if (exists) {
      throw new Error("Campaign name already exists");
    }
    // make a new campaign with random UUID
    const id = randomUUID();
    const campaign: Campaign = { id, ...input };
    campaigns.set(id, campaign);
    return campaign;
  },

  listCampaigns(): Campaign[] {
    // just dump everything out as an array
    return Array.from(campaigns.values());
  },

  getCampaign(id: string): Campaign | undefined {
    // find one by id
    return campaigns.get(id);
  },

  deleteCampaign(id: string): boolean {
    // deleting a campaign also means cleaning up its vouchers
    // and also free their codes (so we could reuse them if needed later)
    for (const v of vouchers.values()) {
      if (v.campaignId === id) {
        codesGlobal.delete(v.code);
        vouchers.delete(v.id);
      }
    }
    return campaigns.delete(id);
  },

  // --------------- Vouchers -----------------
  /**
   * Create N vouchers for a campaign
   * - Generates random codes until uniqueness is guaranteed
   * - Stores them in memory
   * - Yields every few thousand to not block Node’s event loop
   */
  async createVouchers(campaignId: string, count: number): Promise<Voucher[]> {
    const campaign = campaigns.get(campaignId);
    if (!campaign) throw new Error("Campaign not found");

    const created: Voucher[] = [];
    const BATCH_SIZE = 5000; // every 5k, we give CPU a break

    for (let i = 0; i < count; i++) {
      // generate unique code (retry loop in case of collision, very rare)
      let code: string;
      do {
        code = `${campaign.prefix}-${randomCodeBase36(CODE_LEN)}`;
      } while (codesGlobal.has(code));

      // save into global set + vouchers map
      codesGlobal.add(code);
      const voucher: Voucher = { id: randomUUID(), code, campaignId };
      vouchers.set(voucher.id, voucher);
      created.push(voucher);

      // important: for 100k+ vouchers we don’t want to freeze the server
      if ((i + 1) % BATCH_SIZE === 0) {
        await setImmediateAsync(); // let event loop breathe
      }
    }
    return created;
  },

  listVouchers(campaignId: string): Voucher[] {
    // just filter all vouchers by campaignId
    return Array.from(vouchers.values()).filter(
      (v) => v.campaignId === campaignId
    );
  },
};
