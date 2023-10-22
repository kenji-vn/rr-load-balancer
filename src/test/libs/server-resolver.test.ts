import t from "tap";
import { ServerResolver } from "../../services/server-resolver.js";
import sinon from "sinon";
import { jsonOk } from "./test-helper.js";

t.test("test getServerUrl", async (t) => {
  const resolver = new ServerResolver(["server1", "server2", "server3"], 0);
  const url1 = resolver.getServerUrl("/path");
  const url2 = resolver.getServerUrl("/path");
  const url3 = resolver.getServerUrl("/path");

  t.strictSame(url1, "server1/path");
  t.strictSame(url2, "server2/path");
  t.strictSame(url3, "server3/path");
});

t.test("test healthCheck", async (t) => {
  let stubFetch = sinon.stub(global, "fetch");
  stubFetch.withArgs("http://server1.com/health", sinon.match.any).returns(jsonOk({ status: 0 }));
  stubFetch.withArgs("http://server2.com/health", sinon.match.any).returns(jsonOk({ status: 1 }));
  stubFetch.withArgs("http://server3.com/health", sinon.match.any).returns(jsonOk({ status: 1 }));

  let resolver = new ServerResolver(["http://server1.com", "http://server2.com", "http://server3.com"], 0);

  await resolver.refreshServersList();

  let serversList = resolver.getServersList();

  t.strictSame(serversList.length, 2);
  t.strictSame(serversList[0], "http://server2.com");
  t.strictSame(serversList[1], "http://server3.com");
});
