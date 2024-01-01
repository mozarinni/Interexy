import FileBasedCache from "./services/FileBasedCache";

const cache = new FileBasedCache("./cache");

(async () => {
  const getCacheEntry = async (key: string) => {
    const result = await cache.get(key);
    console.log(`Value for ${key}:`, result);
  };

  const getCacheEntryAfterDelay = (key: string, delay: number) => {
    setTimeout(async () => {
      await getCacheEntry(key);
    }, delay * 1000);
  };

  // Set a cache entry
  await cache.set("key1", "value1", 10);

  // Get a cache entry
  await getCacheEntry("key1");

  // Get a cache entry after delay
  getCacheEntryAfterDelay("key1", 1);
  getCacheEntryAfterDelay("key1", 11);

  //   // Delete a cache entry
  //   await cache.delete("key1");

  //   // Clear all cache entries
  //   await cache.clear();
})();
