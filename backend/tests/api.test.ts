import { beforeAll, afterAll, describe, it, expect } from "vitest";
import Fastify from "fastify";
import cors from "@fastify/cors";
import { campaignsRoutes } from "../src/server/routes/campaigns.js";
import { vouchersRoutes } from "../src/server/routes/vouchers.js";
import request from "supertest";

let app: any;

beforeAll(async () => {
  // spin up a fresh Fastify instance before tests
  app = Fastify();
  await app.register(cors, { origin: true }); // allow cors, otherwise fetch fails
  await app.register(campaignsRoutes, { prefix: "/campaigns" });
  await app.register(vouchersRoutes, { prefix: "/campaigns" });
  await app.ready();
});

afterAll(async () => {
  // close server so vitest doesn’t hang
  await app.close();
});

describe("voucher API", () => {
  let campaignId = ""; // we’ll store the id from created campaign here

  it("creates campaign", async () => {
    // send POST /campaigns with some test data
    const res = await request(app.server)
      .post("/campaigns")
      .send({
        name: "Test",
        validFrom: new Date().toISOString(),
        validTo: new Date(Date.now() + 3600e3).toISOString(), // +1h
        amount: 100,
        currency: "SEK",
        prefix: "TEST",
      })
      .expect(201); // should return 201 created

    campaignId = res.body.id; // save id for later
    expect(res.body.prefix).toBe("TEST"); // sanity check
  });

  it("creates vouchers", async () => {
    // generate 5 vouchers for that campaign
    const res = await request(app.server)
      .post(`/campaigns/${campaignId}/vouchers`)
      .send({ count: 5 })
      .expect(200);

    expect(res.body.created).toBe(5); // should say we created 5
  });

  it("lists vouchers", async () => {
    // fetch the vouchers we just made
    const res = await request(app.server)
      .get(`/campaigns/${campaignId}/vouchers`)
      .expect(200);

    expect(res.body.length).toBe(5); // should be 5
    expect(res.body[0].code.startsWith("TEST-")).toBe(true); // check code format
  });

  it("deletes campaign", async () => {
    // finally, delete the campaign and make sure it works
    await request(app.server).delete(`/campaigns/${campaignId}`).expect(204);
  });
});
