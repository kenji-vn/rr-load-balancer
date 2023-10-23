import { FastifyInstance, FastifyRequest } from "fastify";
import { fetchWithTimeout } from "../utils/fetch-helper.js";

const workerController = async (app: FastifyInstance) => {
  /**
   * Main endpoint of the worker, return the same body it receives
   */
  app.post("/", async function (req: FastifyRequest) {
    return req.body;
  });

  /**
   * Health check endpoint, the gateway calls this endpoint periodically.
   * If the status = 0, this worker will be removed from the active servers list.
   * If the status = 1, this worker will be added back to the active servers list.
   */
  app.get("/health", async function () {
    const status = app.isUnderPressure() ? 0 : 1;
    return { status: status };
  });
};

/**
 * Register this server to the gateway.
 * Call this at startup time of this worker.
 */
const joinLoadBalancer = async (workerUrl: string, gatewayUrl: string) => {
  const response = await fetchWithTimeout(`${gatewayUrl}/join?server=${workerUrl}`, { method: "POST", timeout: 5000 });
  return response.ok;
};

export { workerController, joinLoadBalancer };
