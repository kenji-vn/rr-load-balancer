// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { FastifyInstance } from "fastify";
import { ServerResolver } from "../libs/server-resolver.js";

declare module "fastify" {
  export interface FastifyInstance {
    serverResolver: ServerResolver;
  }
}
