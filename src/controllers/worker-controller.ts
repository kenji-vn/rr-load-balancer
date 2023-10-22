import { FastifyInstance, FastifyRequest } from "fastify";
import { fetchWithTimeout } from "../utils/fetch-helper.js";

const workerController = async (app: FastifyInstance) => {
  app.post("/", async function (req: FastifyRequest) {
    return req.body;
  });

  app.get("/health", async function () {
    const status = app.isUnderPressure() ? 0 : 1;
    return { status: status };
  });
};

const joinLoadBalancer = async (workerUrl: string, loadBalancerUrl: string) => {
  let response = await fetchWithTimeout(`${loadBalancerUrl}/join?server=${workerUrl}`, { method: "POST", timeout: 5000 });
  return response.ok;
};

export { workerController, joinLoadBalancer };
