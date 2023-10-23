import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

import loadBalancer from "../configs/load-balancer-config.js";
import { fetchAndRetryDifferentUrl } from "../utils/fetch-helper.js";

const gatewayController = async (app: FastifyInstance) => {
  app.decorate("loadBalancer", loadBalancer);

  /**
   * This gateway supports dynamic registration, a worker server can call this endpoint to register itself to the list of serving workers
   */
  app.post("/join", async function (req: FastifyRequest, reply: FastifyReply) {
    const server = (req.query as Record<string, string>).server;
    if (server) {
      app.loadBalancer.registerServer(server);
    } else {
      reply.statusCode = 400;
    }
  });

  /**
   * Main endpoint of the gateway, redirect all requests that this gateway recieves to one of its worker servers
   */
  app.post("*", async function (req: FastifyRequest, reply: FastifyReply) {
    const path = req.urlData().path;

    const getUrl = () => {
      return app.loadBalancer.resolveUrl(path);
    };

    //If one worker server takes too long, try again with a different worker server. Only try 2 times max.
    const response = await fetchAndRetryDifferentUrl(getUrl, {
      method: "Post",
      timeout: 5000,
      headers: {
        "Content-Type": "application/json",
      },
      body: req.rawBody,
    });

    reply.header("server", response.url);
    reply.header("Content-Type", "application/json");

    const result = await response.text();
    return result;
  });
};

export { gatewayController };
