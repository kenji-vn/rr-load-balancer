import dotenv from "dotenv";
import Fastify, { FastifyInstance } from "fastify";
import { fastifyRawBody } from "fastify-raw-body";
import urlData from "@fastify/url-data";
import { gatewayController } from "./controllers/gateway-controller.js";

// Read the .env file.
dotenv.config();
const listeningPort = Number(process.env.PORT) || 3000;

const app: FastifyInstance = Fastify({
  disableRequestLogging: true,
  logger: true,
});

await app.register(fastifyRawBody);
await app.register(urlData);
await app.register(gatewayController);

app.addHook("onResponse", (request, reply, done) => {
  app.log.info(`${reply.getHeader("server") as string}, ${reply.getResponseTime()}, ${reply.statusCode}`);
  done();
});

app.listen({ port: listeningPort, host: "0.0.0.0" }, (err) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
});
