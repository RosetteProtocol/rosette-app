import { create, IPFSHTTPClient, Options } from "ipfs-http-client";

declare global {
  var __ipfs: IPFSHTTPClient | undefined;
}

let ipfs: IPFSHTTPClient;

const INFURA_IPFS_API_KEY = process.env.INFURA_IPFS_API_KEY;

if (!INFURA_IPFS_API_KEY) {
  throw new Error("INFURA_IPFS_API_KEY not found");
}

const codifiedBasicAuth = Buffer.from(INFURA_IPFS_API_KEY).toString("base64");

const config: Options = {
  url: "https://ipfs.infura.io:5001",
  headers: { Authorization: `Basic ${codifiedBasicAuth}` },
};

if (process.env.NODE_ENV === "production") {
  ipfs = create(config);
} else {
  if (!global.__ipfs) {
    global.__ipfs = create(config);
  }
  ipfs = global.__ipfs;
}

export { ipfs };
