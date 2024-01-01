import HttpProxyServer from "./services/HttpProxyServer";
import { ProxyConfig } from "./interfaces/ProxyConfig";

const proxyConfig: ProxyConfig = {
  targetHost: "api.publicapis.org",
  targetPort: 443,
  targetProtocol: "https",
};

const proxyServer = new HttpProxyServer(proxyConfig);
proxyServer.start(3000);
