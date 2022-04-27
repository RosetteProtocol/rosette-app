import { createCacheStore } from "./cache-store";

export type IpfsResolver = {
  url: (cid: string, path?: string) => Promise<string>;
  json: (cid: string, path?: string) => Promise<object>;
};

export const DEFAULT_IPFS_CACHED_ITEMS = 100;
export const DEFAULT_IPFS_URL = "https://ipfs.io/ipfs/{cid}{path}";

export function ipfsResolver(
  urlTemplate: string = DEFAULT_IPFS_URL,
  cache: number = DEFAULT_IPFS_CACHED_ITEMS
): IpfsResolver {
  const cacheStore = cache === 0 ? null : createCacheStore<object>(cache);

  return {
    async json(cid: string, path?): Promise<object> {
      const url = await this.url(cid, path);

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
    async url(cid: string, path?): Promise<string> {
      const url = urlTemplate.replace(/\{cid\}/, cid);
      if (!path) {
        return url.replace(/\{path\}/, "");
      }
      if (!path.startsWith("/")) {
        path = `/${path}`;
      }
      return url.replace(/\{path\}/, path);
    },
  };
}
