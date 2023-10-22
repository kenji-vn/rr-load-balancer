/**
 * Choosing one server from a list of servers in a circular order (round robin).
 */
class RoundRobinSelector {
  private servers: string[];
  private roundRobinIndex: number;
  private duppItemsErrorMessage = "Round robin selector should not have dupplicated items.";

  constructor(servers: string[]) {
    if (this.hasDuppItems(servers)) {
      throw new Error(this.duppItemsErrorMessage);
    }
    this.servers = servers;
    this.roundRobinIndex = 0;
  }

  public getServerList() {
    return this.servers;
  }
  public setServerList(servers: string[]) {
    if (this.hasDuppItems(servers)) {
      throw new Error(this.duppItemsErrorMessage);
    }
    this.servers = servers;
  }

  public selectServer(): string | undefined {
    let availableServers = this.servers;
    if (availableServers.length == 0) {
      return undefined;
    }

    const serverIndex = this.roundRobinIndex % availableServers.length;
    const server = availableServers[serverIndex];

    if (this.roundRobinIndex === Number.MAX_SAFE_INTEGER) {
      this.roundRobinIndex = 0;
    }
    this.roundRobinIndex++;

    return server;
  }

  private hasDuppItems(list: string[]) {
    return new Set(list).size !== list.length;
  }
}

export { RoundRobinSelector };
