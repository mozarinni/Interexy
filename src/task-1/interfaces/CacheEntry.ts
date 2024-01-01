export interface CacheEntry {
  value: any;
  ttl: number; // time-to-live in seconds
  createdAt: number; // timestamp when the entry was created
}
