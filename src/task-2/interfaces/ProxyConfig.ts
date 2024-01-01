export interface ProxyConfig {
  targetHost: string;
  targetPort: number;
  targetProtocol: "http" | "https";
}
