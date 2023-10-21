import dotenv from "dotenv";
import Fastify, { FastifyInstance } from "fastify";
import { fastifyUnderPressure } from "@fastify/under-pressure";
import { workerRoutes } from "./routes/worker-routes.js";
import { fetchWithTimeout } from "./libs/fetch-helper.js";
import { AddressInfo } from "net";

// Read the .env file.
dotenv.config();
const loadBalancerUrl = process.env.LoadBalancer || "http://localhost:3000";
const listeningPort = Number(process.env.PORT) || 3001;

// Instantiate main Fastify app
const app: FastifyInstance = Fastify({
  disableRequestLogging: true,
  logger: true,
});

app.register(workerRoutes);

app.register(fastifyUnderPressure, {
  maxEventLoopDelay: 1000,
  maxHeapUsedBytes: 100000000,
  maxRssBytes: 100000000,
  maxEventLoopUtilization: 0.98,
});

app.listen({ port: listeningPort, host: "0.0.0.0" }, (err) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
});

app.addHook("onListen", async () => {
  try {
    const serverAddress = app.server.address() as AddressInfo;
    const url = `http://${serverAddress.address}:${serverAddress.port}`;

    const joinResult = await fetchWithTimeout(`${loadBalancerUrl}/join?server=${url}`, { method: "POST", timeout: 10000 });

    if (!joinResult.ok) {
      app.log.error("Failed to join load balancer !");
    } else {
      app.log.info("Joined load balancer successfully !");
    }
  } catch (error) {
    app.log.error("Failed to join load balancer !");
  }
});
