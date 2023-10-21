import dotenv from "dotenv";
import Fastify, { FastifyInstance } from "fastify";
import { fastifyRawBody } from "fastify-raw-body";
import urlData from "@fastify/url-data";
import { gatewayRoutes } from "./routes/gateway-routes.js";

// Read the .env file.
dotenv.config();
const listeningPort = Number(process.env.PORT) || 3000;

// Instantiate main Fastify app
const app: FastifyInstance = Fastify({
  disableRequestLogging: true,
  logger: true,
});

await app.register(fastifyRawBody);
await app.register(urlData);
app.register(gatewayRoutes);

app.addHook("onResponse", (request, reply, done) => {
  app.log.info(`${reply.getHeader("server")}, ${reply.getResponseTime()}, ${reply.statusCode}`);

  done();
});

app.listen({ port: listeningPort, host: "0.0.0.0" }, (err) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
});
