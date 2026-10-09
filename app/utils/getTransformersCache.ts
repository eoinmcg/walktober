/**
 * Inspects the browser's Cache API for transformers-cache and returns all cached item URLs.
 */
export async function getTransformersCache(): Promise<string[]> {
  // Ensure we are running on the client side and the Cache API is supported
  if (!import.meta.client || !('caches' in window)) {
    console.warn('Cache API is not available in this environment.')
    return []
  }

  try {
    // 1. Get all cache bucket names
    const cacheNames = await caches.keys()

    // 2. Find the transformers-cache bucket (handles dynamic origin suffixes if any)
    const targetCacheName = cacheNames.find(name => name.includes('transformers-cache'))

    if (!targetCacheName) {
      console.log('No transformers-cache found.')
      return []
    }

    // 3. Open the cache and extract request keys
    const cache = await caches.open(targetCacheName)
    const requests = await cache.keys()

    // 4. Map requests to their URL strings
    const cachedUrls = requests.map(req => req.url)

    return cachedUrls
  } catch (error) {
    console.error('Failed to read transformers-cache:', error)
    return []
  }
}
