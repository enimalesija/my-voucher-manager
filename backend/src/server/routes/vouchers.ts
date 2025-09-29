import { FastifyInstance } from "fastify";
import { z } from "zod";
import { Store } from "../../services/store.js";
import { vouchersToCSV } from "../../services/csv.js";

export async function vouchersRoutes(app: FastifyInstance) {
  // POST /campaigns/:id/vouchers
  // this one is used to generate a bunch of vouchers for some campaign
  app.post("/:id/vouchers", async (req, reply) => {
    const { id } = req.params as { id: string };

    // we only accept a "count" number in the body (between 1 and 100k)
    const bodySchema = z.object({ count: z.number().min(1).max(100000) });
    const parse = bodySchema.safeParse(req.body);

    if (!parse.success) {
      // if validation fails we just send back 400 and the errors
      return reply.status(400).send({ error: parse.error.issues });
    }

    try {
      // if ok --> let Store generate the vouchers
      const created = await Store.createVouchers(id, parse.data.count);
      return { created: created.length };
    } catch (err: any) {
      return reply.status(404).send({ error: err.message });
    }
  });

  // GET /campaigns/:id/vouchers
  // just list all vouchers that belong to the given campaign
  app.get("/:id/vouchers", async (req) => {
    const { id } = req.params as { id: string };
    return Store.listVouchers(id);
  });

  // GET /campaigns/:id/vouchers.csv
  // same as above but exported as CSV so user can download it
  app.get("/:id/vouchers.csv", async (req, reply) => {
    const { id } = req.params as { id: string };
    const vouchers = Store.listVouchers(id);
    const campaign = Store.getCampaign(id);

    // fallback to ID if no campaign found ( we make the file name the campaign name)
    const safeName =
      campaign?.name
        .replace(/[^a-z0-9]/gi, "_") // replace spaces/specials with _
        .toLowerCase() || id;

    reply.header("Content-Type", "text/csv");
    reply.header(
      "Content-Disposition",
      `attachment; filename="vouchers-${safeName}.csv"` // we make the file name the campaign name
    );
    return vouchersToCSV(vouchers);
  });
}
