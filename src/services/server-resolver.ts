import { fetchWithTimeout } from "../utils/fetch-helper.js";
import { RoundRobinSelector } from "./round-robin-selector.js";
import { ToadScheduler, SimpleIntervalJob, Task } from "toad-scheduler";

class ServerResolver {
  private serverSelector: RoundRobinSelector;
  private scheduler = new ToadScheduler();
  private healthCheckTimeout = 5000;

  constructor(servers: string[] = [], healthCheckSeconds = 5) {
    this.serverSelector = new RoundRobinSelector(servers);

    if (healthCheckSeconds > 0) {
      const task = new Task("Health monitor", () => {
        this.refreshServersList();
      });
      const job = new SimpleIntervalJob({ seconds: healthCheckSeconds }, task);
      this.scheduler.addSimpleIntervalJob(job);
    }
  }

  public getServerUrl(path: string | undefined) {
    const server = this.serverSelector.selectServer();
    if (!server) {
      throw new Error("There are no available servers");
    }
    const fullUrl = `${server}${path ?? ""}`;

    return fullUrl;
  }

  public async registerServer(server: string) {
    const result = await this.serverSelector.updateServers([server], []);
    return result;
  }

  public async refreshServersList() {
    try {
      const allServers = this.serverSelector.getServersList();
      const healthChecks = await this.fetchHealthChecks(allServers);

      //TODO: refactor these 2 lines
      let goodServers = healthChecks.filter((s) => s["status"] === 1).map((s) => s.address);
      let badServers = healthChecks.filter((s) => s["status"] !== 1).map((s) => s.address);

      await this.serverSelector.updateServers(goodServers, badServers);
    } catch (error) {
      console.warn("Error in servers monitoring cron job: " + error);
    }
  }

  public getServersList() {
    return this.serverSelector.getServersList();
  }

  private async fetchHealthChecks(servers: string[]) {
    return await Promise.all(
      servers.map(async (server) => {
        try {
          const response = await fetchWithTimeout(`${server}/health`, {
            method: "Get",
            timeout: this.healthCheckTimeout,
          });

          const result = (await response.json()) as Record<string, number>;
          return { address: server, status: result.status };
        } catch (error: any) {
          return { address: server, status: 0 };
        }
      }),
    );
  }
}

export { ServerResolver };
