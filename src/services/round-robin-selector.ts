import AsyncLock from "async-lock";

class RoundRobinSelector {
  private roundRobinIndex: number;
  private servers: string[];
  private lock: AsyncLock;

  constructor(servers: string[]) {
    this.servers = servers;
    this.roundRobinIndex = 0;
    this.lock = new AsyncLock();
  }

  getServersList() {
    return this.servers;
  }

  selectServer(): string | undefined {
    let availableServers = this.servers;
    if (availableServers.length == 0) {
      return undefined;
    }

    const serverIndex = this.roundRobinIndex % availableServers.length;
    this.roundRobinIndex++;

    return availableServers[serverIndex];
  }

  async updateServers(addServers: string[], removeServers: string[]) {
    await this.lock.acquire("servers", () => {
      let currentServers = new Set(this.servers);
      for (let addServer of addServers) {
        if (!currentServers.has(addServer)) {
          this.servers.push(addServer);
        }
      }

      let toRemoveServers = new Set(removeServers);
      this.servers = this.servers.filter((server) => !toRemoveServers.has(server));

      console.log(`All available servers: ${this.servers.join(", ")}`);
    });
  }
}

export { RoundRobinSelector };
