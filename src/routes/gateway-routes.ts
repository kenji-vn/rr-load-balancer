import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

import serverResolver from "../config/server-resolver-config.js";
import { fetchAndRetryDifferentUrl } from "../libs/fetch-helper.js";

const gatewayRoutes = async (app: FastifyInstance) => {
  app.decorate("serverResolver", serverResolver);

  app.post("/join", async function (req: FastifyRequest) {
    const server = (req.query as Record<string, string>)["server"];
    if (server) {
      app.serverResolver.registerServer(server);
      return true;
    }

    return false;
  });

  app.post("*", async function (req: FastifyRequest, reply: FastifyReply) {
    const path = req.urlData().path;

    const response = await fetchAndRetryDifferentUrl(app.serverResolver.getServerUrl, path, {
      method: "Post",
      timeout: 3000,
      headers: {
        "Content-Type": "application/json",
      },
      body: req.rawBody,
    });

    if (!response.ok) {
      reply.statusCode = 500; //TODO: update this
      reply.send();
    } else {
      reply.header("server", response.url);
      reply.header("Content-Type", "application/json");

      const result = await response.text();
      return result;
    }
  });
};

export { gatewayRoutes };
