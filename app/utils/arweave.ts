import { createCacheStore } from "./cache-store";

export type ArweaveResolver = {
  url: (id: string) => Promise<string>;
  json: (id: string) => Promise<object>;
};

export const DEFAULT_ARWEAVE_CACHED_ITEMS = 100;
export const DEFAULT_ARWEAVE_URL = "https://arweave.net/{id}";

export function arweaveResolver(
  urlTemplate: string = DEFAULT_ARWEAVE_URL,
  cache: number = DEFAULT_ARWEAVE_CACHED_ITEMS
): ArweaveResolver {
  const cacheStore = cache === 0 ? null : createCacheStore<object>(cache);

  return {
    async json(id: string): Promise<object> {
      const url = await this.url(id);

      const fetchJson = async () => {
        let response;
        let data;

        try {
          response = await fetch(url);
        } catch (_) {
          throw new Error(`Couldn’t fetch ${url}.`);
        }

        try {
          data = await response.json();
        } catch (_) {
          throw new Error(`Couldn’t parse the result of ${url} as JSON.`);
        }

        return data;
      };

      return cacheStore?.get(url, fetchJson) || fetchJson();
    },
    async url(id: string): Promise<string> {
      return urlTemplate.replace(/\{id\}/, id);
    },
  };
}
