import t from "tap";
import { RoundRobinSelector } from "../../services/round-robin-selector.js";

//Testing constructor
t.test("test LoadBalancer constructor, server list has dupp items, throw exception", async (t) => {
  t.throws(() => {
    new RoundRobinSelector(["server1", "server1", "server3"]);
  }, "LoadBalancer constructor should throw exception when server list has dupp items");
});

//Testing getServersList
t.test("getServersList, servers list has no items, getServersList should returns empty", async (t) => {
  const roundRobin = new RoundRobinSelector([]);

  const serverList = roundRobin.getServerList();

  t.strictSame(serverList.length, 0);
});

t.test("getServersList, servers list has items, getServersList returns all items", async (t) => {
  const roundRobin = new RoundRobinSelector(["server1", "server3", "server2"]);

  const serverList = roundRobin.getServerList();

  t.strictSame(serverList.join(", "), "server1, server3, server2");
});

//Testing selectServer
t.test("selectServer, servers list has 0 items, selectServer should return undefined", async (t) => {
  const roundRobin = new RoundRobinSelector([]);

  const server = roundRobin.selectServer();

  t.strictSame(server, undefined);
});

t.test("selectServer, servers list has items, selectServer should return correct round-robin result", async (t) => {
  const roundRobin = new RoundRobinSelector(["1", "3", "2", "4", "5", "6", "7", "8"]);

  const servers: string[] = [];

  for (let i = 0; i < 12; i++) {
    servers.push(roundRobin.selectServer() as string);
  }

  t.strictSame(["1", "3", "2", "4", "5", "6", "7", "8", "1", "3", "2", "4"], servers);
});

t.test("selectServer, servers list has 1 item, selectServer should return only 1 item", async (t) => {
  const roundRobin = new RoundRobinSelector(["1"]);

  const servers: string[] = [];

  for (let i = 0; i < 5; i++) {
    servers.push(roundRobin.selectServer() as string);
  }

  t.strictSame(["1", "1", "1", "1", "1"], servers);
});

//Testing setServerList
t.test("setServerList, override old server list by calling setServerList, server list should get new data", async (t) => {
  const roundRobin = new RoundRobinSelector([]);

  let serverList = roundRobin.getServerList();
  t.strictSame(serverList.length, 0);

  roundRobin.setServerList(["2", "3", "4"]);
  serverList = roundRobin.getServerList();
  t.strictSame(serverList.join(", "), "2, 3, 4");

  roundRobin.setServerList(["1"]);
  serverList = roundRobin.getServerList();
  t.strictSame(serverList.join(", "), "1");

  roundRobin.setServerList([]);
  serverList = roundRobin.getServerList();
  t.strictSame(serverList.length, 0);
});

t.test("setServerList, setServerList with dupp items, throw exception", async (t) => {
  const roundRobin = new RoundRobinSelector(["1", "2"]);
  t.throws(() => {
    roundRobin.setServerList(["2", "2", "3", "4"]);
  }, "setServerList should throw exception when server list has dupp items");
});
