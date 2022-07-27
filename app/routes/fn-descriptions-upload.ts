import type { ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { uploadFile as uploadFileToBundlr } from "~/utils/server/bundlr.server";

type BundlrResponseData = Record<string, string>;

export type ArweaveData = {
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
  const fnDescriptionsData = JSON.parse(fnsString) as ArweaveData["functions"];

  const uploadRequests = fnDescriptionsData.map(({ description, fullName }) => {
    const descriptionJson = JSON.stringify({
      bytecodeHash,
      abi: fullName,
      notice: description,
    });

    return uploadFileToBundlr(descriptionJson);
  });

  try {
    const addResults = await Promise.all(uploadRequests);

    const responseData = addResults.reduce((data, addResult, index) => {
      const fnDescription = fnDescriptionsData[index];
      data[fnDescription.sigHash] = addResult;
      return data;
    }, {} as BundlrResponseData);

    return json(responseData);
  } catch (err) {
    throw new Response(
      `An error occured when uploading the function descriptions: ${err}`,
      { status: 500 }
    );
  }
};
