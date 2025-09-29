import Fastify from "fastify";
import cors from "@fastify/cors";
import { campaignsRoutes } from "../server/routes/campaigns.js";
import { vouchersRoutes } from "../server/routes/vouchers.js";

// make up a Fastify server instance.
// I keep logger = true so I can actually see requests + errors in console.
const app = Fastify({ logger: true });

// Add CORS plugin so frontend (Next.js, running on port 3000)
// can call this backend without being blocked by browser.
// For dev I just allow all origins (for easy debugging) but its not production-safe.
await app.register(cors, {
  origin: true,
  methods: ["GET", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
});

// Attach route modules. Both live under /campaigns:
// - campaignsRoutes: CRUD for campaigns
// - vouchersRoutes: voucher endpoints (create/list/download)
await app.register(campaignsRoutes, { prefix: "/campaigns" });
await app.register(vouchersRoutes, { prefix: "/campaigns" });

// Quick ping route --> GET /health
// I use it for docker-compose health checks or just to see if API is working (when developing the app and testing)
app.get("/health", async () => ({ ok: true }));

const PORT = Number(process.env.PORT ?? 4000);
app
  .listen({ port: PORT, host: "0.0.0.0" })
  .then(() => console.log(`✅ API running on http://localhost:${PORT}`))
  .catch((err) => {
    app.log.error(err);
    process.exit(1);
  });
