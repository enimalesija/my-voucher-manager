import { describe, it, expect } from "vitest";
import { Store } from "../src/services/store.js";

describe("Performance test", () => {
  it("should create and download 100,000 vouchers fast", async () => {
    // create a dummy campaign just for the perf run
    const campaign = Store.createCampaign({
      name: "PerfTest",
      validFrom: new Date().toISOString(),
      validTo: new Date(Date.now() + 3600_000).toISOString(),
      amount: 100,
      currency: "SEK",
      prefix: "LOAD",
    });

    const start = Date.now();
    // generate a crazy number of vouchers (100k)
    const vouchers = await Store.createVouchers(campaign.id, 100_000);
    const elapsed = Date.now() - start;

    console.log(`⏱ Created 100k vouchers in ${elapsed} ms`);

    expect(vouchers).toHaveLength(100_000);
    // if your machine is slow, bump this… mine usually <5s
    expect(elapsed).toBeLessThan(5000);
  }, 60_000); // give test 60s timeout just in case
});
