import * as http from "http";
import * as https from "https";
import { URL, format } from "url";
import FileBasedCache from "../../task-1/services/FileBasedCache";
import { ProxyConfig } from "../interfaces/ProxyConfig";

class HttpProxyServer {
  private cache: FileBasedCache;
  private config: ProxyConfig;

  constructor(config: ProxyConfig) {
    this.config = config;
    this.cache = new FileBasedCache("./proxy-cache");
  }

  private async handleRequest(req: http.IncomingMessage, res: http.ServerResponse) {
    const targetUrl = req.url
      ? new URL(
          req.url,
          format({
            protocol: this.config.targetProtocol,
            hostname: this.config.targetHost,
            port: this.config.targetPort.toString(),
          })
        )
      : "";

    // Check cache for GET requests
    if (req.method === "GET") {
      const cachedResponse = await this.cache.get(req.url!);

      if (cachedResponse) {
        console.log(`[CACHE] Serving cached response for ${req.url}`);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(cachedResponse));
        return;
      }
    }

    // Proxy the request to the target server
    const proxyReq = (this.config.targetProtocol === "https" ? https : http).request(targetUrl, (proxyRes) => {
      let responseData = "";

      proxyRes.on("data", (chunk) => {
        responseData += chunk;
      });

      proxyRes.on("end", () => {
        // Cache the response for GET requests
        if (req.method === "GET") {
          this.cache.set(req.url!, responseData, 60); // Cache for 60 seconds
        }

        res.writeHead(proxyRes.statusCode!, proxyRes.headers);
        res.end(responseData);
      });
    });

    // Handle errors
    proxyReq.on("error", (error) => {
      console.error(`[ERROR] Proxy request failed: ${error.message}`);
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Internal Server Error");
    });

    // Forward the request body if present
    if (req.method !== "GET") {
      req.pipe(proxyReq, { end: true });
    } else {
      proxyReq.end();
    }
  }

  public start(port: number) {
    const server = http.createServer(this.handleRequest.bind(this));

    server.listen(port, () => {
      console.log(`Proxy server listening on port ${port}`);
    });

    server.on("error", (error) => {
      console.error(`[ERROR] Server failed to start: ${error.message}`);
    });
  }
}

export default HttpProxyServer;
