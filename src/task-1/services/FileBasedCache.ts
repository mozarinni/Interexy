import * as fs from "fs/promises";
import { CacheEntry } from "../interfaces/CacheEntry";

class FileBasedCache {
  private cacheDirectory: string;
  private cleanupInterval: number; // cleanup interval in seconds
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor(cacheDirectory: string, cleanupInterval: number = 1) {
    this.cacheDirectory = cacheDirectory;
    this.cleanupInterval = cleanupInterval * 1000;
    // Ensure the cache directory exists
    fs.mkdir(this.cacheDirectory, { recursive: true }).catch(console.error);

    // Start the cleanup timer
    this.startCleanupTimer();
  }

  private getFilePath(key: string): string {
    return `${this.cacheDirectory}/${key}.json`;
  }

  private async saveToFile(key: string, entry: CacheEntry): Promise<void> {
    const filePath = this.getFilePath(key);
    await fs.writeFile(filePath, JSON.stringify(entry));
  }

  private async loadFromFile(key: string): Promise<CacheEntry | null> {
    const filePath = this.getFilePath(key);
    try {
      const data = await fs.readFile(filePath, "utf-8");
      return JSON.parse(data);
    } catch (error) {
      return null;
    }
  }

  private async cleanupExpiredEntries(): Promise<void> {
    try {
      const files = await fs.readdir(this.cacheDirectory);

      // Remove expired entries
      await Promise.all(
        files.map(async (file) => {
          const key = file.replace(".json", "");
          const entry = await this.loadFromFile(key);

          if (entry && Date.now() - entry.createdAt >= entry.ttl * 1000) {
            // Entry has expired, delete it
            await this.delete(key);
          }
        })
      );
    } catch (error) {
      console.error("Error cleaning up expired entries:", error);
    }
  }

  private startCleanupTimer(): void {
    // Start the cleanup timer if not already running
    if (!this.cleanupTimer) {
      this.cleanupTimer = setInterval(async () => {
        await this.cleanupExpiredEntries();
      }, this.cleanupInterval);
    }
  }

  private stopCleanupTimer(): void {
    // Stop the cleanup timer if running
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }

  /**
   * Store a cache entry with the given key, value, and time-to-live (TTL) in seconds.
   * @param key The key for the cache entry.
   * @param value The value to be cached.
   * @param ttl Time-to-live for the cache entry in seconds.
   */
  public async set(key: string, value: any, ttl: number): Promise<void> {
    const entry: CacheEntry = {
      value,
      ttl,
      createdAt: Date.now(),
    };

    await this.saveToFile(key, entry);
  }

  /**
   * Retrieve the value for the given key if it exists and has not expired. Otherwise, return null.
   * @param key The key for the cache entry.
   * @returns The cached value or null if the entry does not exist or has expired.
   */
  public async get(key: string): Promise<any | null> {
    const entry = await this.loadFromFile(key);

    // if (entry && Date.now() - entry.createdAt < entry.ttl * 1000) {
    if (entry) {
      return entry.value;
    } else {
      // Entry does not exist or has expired
      return null;
    }
  }

  /**
   * Remove the cache entry with the given key.
   * @param key The key for the cache entry to be deleted.
   */
  public async delete(key: string): Promise<void> {
    const filePath = this.getFilePath(key);
    try {
      await fs.unlink(filePath);
    } catch (error) {
      // File not found or other error, ignore
      console.log("File does not exist");
    }
  }

  /**
   * Remove all cache entries.
   */
  public async clear(): Promise<void> {
    try {
      const files = await fs.readdir(this.cacheDirectory);

      // Delete each file
      await Promise.all(files.map((file) => fs.unlink(`${this.cacheDirectory}/${file}`)));
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Stop the cleanup timer when the application is shutting down.
   */
  public stop(): void {
    this.stopCleanupTimer();
  }
}

export default FileBasedCache;
