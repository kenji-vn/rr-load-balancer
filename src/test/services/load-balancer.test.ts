import t from "tap";
import { LoadBalancer } from "../../services/load-balancer.js";
import sinon from "sinon";
import { jsonOk } from "../test-helper.js";

t.test("test getServerUrl, server list has 3 items, resolve url correctly", async (t) => {
  const resolver = new LoadBalancer(["server1", "server2", "server3"], 0);
  const url1 = resolver.resolveUrl("/path");
  const url2 = resolver.resolveUrl("/path");
  const url3 = resolver.resolveUrl("/path");
  const url4 = resolver.resolveUrl("/path");
  const url5 = resolver.resolveUrl("/path");

  t.strictSame(url1, "server1/path");
  t.strictSame(url2, "server2/path");
  t.strictSame(url3, "server3/path");
  t.strictSame(url4, "server1/path");
  t.strictSame(url5, "server2/path");
});

t.test("test getServerUrl, server list is empty, throw expcetion", async (t) => {
  const resolver = new LoadBalancer([], 0);
  t.throws(
    () => {
      resolver.resolveUrl("/path");
    },
    new Error("There are no available servers"),
    "getServerUrl should throw exception when server list is empty",
  );
});

t.test(
  "Integration test registerServer and selectServer(), start from empty server list, add and use new servers correctly",
  async (t) => {
    const resolver = new LoadBalancer([], 0);

    //Register server1, all links should use server1
    resolver.registerServer("server1");

    let url1 = resolver.resolveUrl("/path");
    let url2 = resolver.resolveUrl("/path");
    let url3 = resolver.resolveUrl("/path");
    let url4 = resolver.resolveUrl("/path");

    t.strictSame(url1, "server1/path");
    t.strictSame(url2, "server1/path");
    t.strictSame(url3, "server1/path");
    t.strictSame(url4, "server1/path");

    //Register server2, all links should use server1 and server2, round robin
    resolver.registerServer("server2");
    url1 = resolver.resolveUrl("/path");
    url2 = resolver.resolveUrl("/path");
    url3 = resolver.resolveUrl("/path");
    url4 = resolver.resolveUrl("/path");

    t.strictSame(url1, "server1/path");
    t.strictSame(url2, "server2/path");
    t.strictSame(url3, "server1/path");
    t.strictSame(url4, "server2/path");
  },
);

t.test("Integration test refreshServersList, add and remove servers correctly by their status", async (t) => {
  const resolver = new LoadBalancer(["server1", "server2", "server3"], 0);
  const stubFetch = sinon.stub(global, "fetch");

  stubFetch.withArgs("server1/health", sinon.match.any).returns(jsonOk({ status: 0 }));
  stubFetch.withArgs("server2/health", sinon.match.any).returns(jsonOk({ status: 1 }));
  stubFetch.withArgs("server3/health", sinon.match.any).returns(jsonOk({ status: 1 }));

  await resolver.refreshServersList();
  //after refreshServersList() this time, server1 is removed.
  //the available servers are: ["server2", "server3"] or ["server3", "server2"] (we run health check in parallel, the order can be different)
  let roundRobinResult = checkRoundRobin(10, ["server2", "server3"]) || checkRoundRobin(10, ["server3", "server2"]);
  t.strictSame(true, roundRobinResult);

  sinon.reset();
  stubFetch.withArgs("server1/health", sinon.match.any).returns(jsonOk({ status: 1 }));
  stubFetch.withArgs("server2/health", sinon.match.any).returns(jsonOk({ status: 1 }));
  stubFetch.withArgs("server3/health", sinon.match.any).returns(jsonOk({ status: 0 }));

  await resolver.refreshServersList();
  //after refreshServersList() this time, server1 is added back and server3 is removed.
  //the available servers are: ["server1", "server2"] or ["server2", "server1"] (we run health check in parallel, the order can be different)
  roundRobinResult = checkRoundRobin(10, ["server1", "server2"]) || checkRoundRobin(10, ["server2", "server1"]);
  t.strictSame(true, roundRobinResult);

  sinon.reset();
  stubFetch.withArgs("server1/health", sinon.match.any).returns(jsonOk({ status: 1 }));
  stubFetch.withArgs("server2/health", sinon.match.any).returns(jsonOk({ status: 0 }));
  stubFetch.withArgs("server3/health", sinon.match.any).returns(jsonOk({ status: 0 }));

  await resolver.refreshServersList();
  //after refreshServersList() this time, only server1 is left.
  roundRobinResult = checkRoundRobin(10, ["server1"]);
  t.strictSame(true, roundRobinResult);

  sinon.reset();

  /**
   * Call getServerUrl n times, return true if the result follow round robin algorithm
   * @param numberOfGetServerUrl: number or times getServerUrl will be called,
   * @param serverList: server list
   * numberOfGetServerUrl %  serverList.length should == 0 to reset the resolveUrl, for easy testing
   */
  function checkRoundRobin(numberOfGetServerUrl: number, serverList: string[]): boolean {
    let checkResult = true;
    const roundRobinCount = serverList.length;
    for (let i = 0; i < numberOfGetServerUrl; i++) {
      const url = resolver.resolveUrl();
      checkResult &&= url === serverList[i % roundRobinCount];
    }

    return checkResult;
  }
});
