import type { ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import type { UserFnDescription } from "~/types";
import { ipfs } from "~/utils/server/ipfs.server";

type IPFSResponseData = Record<string, string>;

const FN_DESCRIPTIONS_KEY = "fnDescriptions";

export const action: ActionFunction = async ({ request }) => {
  const data = await request.formData();

  if (!data.has(FN_DESCRIPTIONS_KEY)) {
    return new Response("Function descriptions not provided", { status: 400 });
  }

  const fnDescriptionsString = data.get(FN_DESCRIPTIONS_KEY)?.toString() || "";
  const fnDescriptions = JSON.parse(
    fnDescriptionsString
  ) as UserFnDescription[];

  const uploadRequests = fnDescriptions.map(({ description, minimalName }) => {
    const descriptionJson = JSON.stringify({
      abi: minimalName,
      notice: description,
    });

    return ipfs.add(descriptionJson);
  });

  try {
    const addResults = await Promise.all(uploadRequests);

    const responseData = addResults.reduce((data, addResult, index) => {
      const fnDescription = fnDescriptions[index];
      data[fnDescription.sigHash] = addResult.cid.toString();
      return data;
    }, {} as IPFSResponseData);

    console.log("Returning repsonseDAta", responseData);
    return json(responseData);
  } catch (err) {
    console.error(err);
    throw new Response(
      "An error occured when uploading function descriptions",
      { status: 500 }
    );
  }
};
