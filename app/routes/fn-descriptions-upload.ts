import type { ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { ipfs } from "~/utils/server/ipfs.server";

type IPFSResponseData = Record<string, string>;

export type IPFSData = {
  bytecodeHash: string;
  functions: {
    description: string;
    fullName: string;
    sigHash: string;
  }[];
};

export const action: ActionFunction = async ({ request }) => {
  const uploadData = await request.formData();

  if (!uploadData.has("functions") || !uploadData.has("bytecodeHash")) {
    return new Response("Function descriptions not provided", { status: 400 });
  }

  const bytecodeHash = uploadData.get("bytecodeHash");
  const fnsString = uploadData.get("functions")!.toString();
  const fnDescriptionsData = JSON.parse(fnsString) as IPFSData["functions"];

  const uploadRequests = fnDescriptionsData.map(({ description, fullName }) => {
    const descriptionJson = JSON.stringify({
      bytecodeHash,
      abi: fullName,
      notice: description,
    });

    return ipfs.add(descriptionJson);
  });

  try {
    const addResults = await Promise.all(uploadRequests);

    const responseData = addResults.reduce((data, addResult, index) => {
      const fnDescription = fnDescriptionsData[index];
      data[fnDescription.sigHash] = addResult.cid.toString();
      return data;
    }, {} as IPFSResponseData);

    return json(responseData);
  } catch (err) {
    throw new Response(
      `An error occured when uploading the function descriptions: ${err}`,
      { status: 500 }
    );
  }
};
