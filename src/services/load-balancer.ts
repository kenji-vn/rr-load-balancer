import { fetchWithTimeout } from "../utils/fetch-helper.js";
import { RoundRobinSelector } from "./round-robin-selector.js";
import { ToadScheduler, SimpleIntervalJob, AsyncTask } from "toad-scheduler";

/**
 * Simple Load Balancer.
 * Everytime you call resolveUrl(), it returns an url to a different server in the servers list.
 * This supports adding a new server to the farm, check registerServer().
 * This has a health check process that automatically checks every server and temporarily removes bad/slow servers from the farm. For more details, see the refreshServersList().
 * This should be used as a singleton service.
 */
class LoadBalancer {
  private serverSelector: RoundRobinSelector;
  private allServers: string[];
  private scheduler = new ToadScheduler();
  private healthCheckTimeout = 5000;

  constructor(servers: string[] = [], healthCheckSeconds = 5) {
    this.allServers = servers;
    this.serverSelector = new RoundRobinSelector(servers);

    if (healthCheckSeconds > 0) {
      const task = new AsyncTask("Health monitor", async () => {
        await this.refreshServersList();
      });
      const job = new SimpleIntervalJob({ seconds: healthCheckSeconds }, task);
      this.scheduler.addSimpleIntervalJob(job);
    }
  }

  /**
   * Resolve full url to a healthy server
   */
  public resolveUrl(path?: string) {
    const server = this.serverSelector.selectServer();
    if (!server) {
      throw new Error("There are no available servers");
    }
    const fullUrl = `${server}${path ?? ""}`;

    return fullUrl;
  }

  /**
   * Register a new server to the list of servers that are serving requests
   * @param server
   */
  public registerServer(server: string) {
    this.updateServers([server], []);
  }

  /**
   * Run health check for each servers, add healthy servers  and remove bad servers from the list of servers that are serving requests
   */
  public async refreshServersList() {
    try {
      const healthChecks = await this.fetchHealthChecks(this.allServers);

      const goodServers = healthChecks.filter((s) => s["status"] === 1).map((s) => s.address);
      const badServers = healthChecks.filter((s) => s["status"] !== 1).map((s) => s.address);

      this.updateServers(goodServers, badServers);
    } catch (error) {
      console.warn(`Error in servers monitoring cron job: ${error as string}`);
    }
  }

  /**
   * Add healthy servers and remove dead servers from the list of servers that are serving requests
   */
  private updateServers(goodServers: string[], badServers: string[]) {
    const allServerSet = new Set(this.allServers);
    const serverInFarmSet = new Set(this.serverSelector.getServerList());

    for (const addServer of goodServers) {
      allServerSet.add(addServer);
      serverInFarmSet.add(addServer);
    }

    for (const removeServer of badServers) {
      serverInFarmSet.delete(removeServer);
    }

    this.allServers = [...allServerSet];
    this.serverSelector.setServerList([...serverInFarmSet]);
    console.log(`All available servers: ${this.serverSelector.getServerList().join(", ")}`);
  }

  /**
   * Call each server health endpoint and return the results.
   */
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
        } catch (error) {
          return { address: server, status: 0 };
        }
      }),
    );
  }
}

export { LoadBalancer };
