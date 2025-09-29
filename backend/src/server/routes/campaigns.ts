import { FastifyInstance } from "fastify";
import { CampaignInputSchema } from "../../models/campaign.js";
import { Store } from "../../services/store.js";


export async function campaignsRoutes(app: FastifyInstance) {
  // POST /campaigns
  // create a new campaign --> but first we validate the body with zod schema
  app.post("/", async (req, reply) => {
    const parse = CampaignInputSchema.safeParse(req.body);
    if (!parse.success) {
      return reply.status(400).send({ error: parse.error.issues });
    }

    try {
      const campaign = Store.createCampaign(parse.data);
      return reply.status(201).send(campaign);
    } catch (err: any) {
      return reply.status(400).send({ error: err.message }); // duplicate name handled here
    }
  });

  // GET /campaigns
  // super simple, just list all campaigns we have right now
  app.get("/", async () => {
    return Store.listCampaigns();
  });

  // DELETE /campaigns/:id
  // remove a campaign (and its vouchers) by id
  app.delete("/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const ok = Store.deleteCampaign(id);
    if (!ok) {
      // nothing deleted --> not found
      return reply.status(404).send({ error: "Not found" });
    }
    // deleted --> return 204 (no content)
    return reply.status(204).send();
  });
}
