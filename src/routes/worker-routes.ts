import { FastifyInstance, FastifyRequest } from "fastify";

const workerRoutes = async (app: FastifyInstance) => {
  app.post("/", async function (req: FastifyRequest) {
    return req.body;
  });

  app.get("/health", async function () {
    const status = app.isUnderPressure() ? 0 : 1;
    return { status: status };
  });
};

export { workerRoutes };
