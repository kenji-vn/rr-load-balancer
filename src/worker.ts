import dotenv from "dotenv";
import Fastify, { FastifyInstance } from "fastify";
import { fastifyUnderPressure } from "@fastify/under-pressure";
import { joinLoadBalancer, workerController } from "./controllers/worker-controller.js";
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

app.register(workerController);

app.register(fastifyUnderPressure, {
  maxEventLoopDelay: 1000,
  maxHeapUsedBytes: 100000000,
  maxRssBytes: 100000000,
  maxEventLoopUtilization: 0.98,
});

app.addHook("onListen", async () => {
  const serverAddress = app.server.address() as AddressInfo;
  const workerUrl = `http://${serverAddress.address}:${serverAddress.port}`;

  try {
    const joinResult = await joinLoadBalancer(workerUrl, loadBalancerUrl);
    app.log.info(`Joined load balancer ${joinResult ? "successfully" : "unsuccessfully"} !`);
  } catch (error) {
    app.log.info(`Error occured when joining load balancer: ${error}`);
  }
});

app.listen({ port: listeningPort, host: "0.0.0.0" }, (err) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
});
