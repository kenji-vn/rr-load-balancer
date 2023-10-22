import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

import serverResolver from "../configs/server-resolver-config.js";
import { fetchAndRetryDifferentUrl } from "../utils/fetch-helper.js";

const gatewayController = async (app: FastifyInstance) => {
  app.decorate("serverResolver", serverResolver);

  app.post("/join", async function (req: FastifyRequest, reply: FastifyReply) {
    const server = (req.query as Record<string, string>).server;
    if (server) {
      app.serverResolver.registerServer(server);
    } else {
      reply.statusCode = 400;
    }
  });

  app.post("*", async function (req: FastifyRequest, reply: FastifyReply) {
    const path = req.urlData().path;

    let getUrl = () => {
      return app.serverResolver.getServerUrl(path);
    };

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
