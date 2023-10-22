// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { FastifyInstance } from "fastify";
import { LoadBalancer } from "../services/load-balancer.js";

declare module "fastify" {
  export interface FastifyInstance {
    loadBalancer: LoadBalancer;
  }
}
