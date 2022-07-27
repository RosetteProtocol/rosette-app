import Bundlr from "@bundlr-network/client";

const bundlrUri = process.env.BUNDLR_URI ?? "https://node1.bundlr.network";
const bundlrFeeToken = process.env.BUNDLR_FEE_TOKEN ?? "matic";
const pk = process.env.PRIVATE_KEY ?? "";

// initialise a bundlr client
const bundlr = new Bundlr(bundlrUri, bundlrFeeToken, pk);

export async function uploadFile(data: string): Promise<string> {
  await bundlr.ready();

  const tags = [{ name: "Content-Type", value: "application/json" }];

  // create a Bundlr Transaction
  const tx = bundlr.createTransaction(data, { tags });

  // sign the transaction
  await tx.sign();
  // get the transaction's ID:
  const id = tx.id;
  // upload the transaction
  await tx.upload();

  return id;
}
