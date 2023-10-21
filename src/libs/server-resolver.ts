import { fetchWithTimeout } from "./fetch-helper.js";
import { RoundRobinSelector } from "./round-robin-selector.js";
import { ToadScheduler, SimpleIntervalJob, Task } from "toad-scheduler";

class ServerResolver {
  private serverSelector: RoundRobinSelector;
  private scheduler = new ToadScheduler();

  constructor(servers: string[] = [], healthCheckInterval = 5) {
    this.serverSelector = new RoundRobinSelector(servers);

    if (healthCheckInterval > 0) {
      const task = new Task("Health monitor", () => {
        this.updateServersWithHealthCheck();
      });
      const job = new SimpleIntervalJob({ seconds: healthCheckInterval }, task);
      this.scheduler.addSimpleIntervalJob(job);
    }

    console.warn("Created LoadBalancer");
  }

  public getServerUrl(path: string | undefined) {
    const server = this.serverSelector.selectServer();
    const fullUrl = `${server}${path ?? ""}`;

    return fullUrl;
  }

  public async registerServer(server: string) {
    const result = await this.serverSelector.updateServers([server], []);
    return result;
  }

  public async updateServersWithHealthCheck() {
    try {
      const allServers = this.serverSelector.getServersList();
      const healthChecks = await this.fetchHealthChecks(allServers);

      //TODO: refactor these 2 lines
      let badServers = healthChecks.filter((s) => s["status"] === 0).map((s) => s.address);
      let goodServers = healthChecks.filter((s) => s["status"] === 1).map((s) => s.address);

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
            timeout: 8000,
          });
          if (!response.ok) {
            return { address: server, status: 0 };
          }
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
