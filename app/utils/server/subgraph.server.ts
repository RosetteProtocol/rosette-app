import { utils } from "ethers";
import type { FnEntry } from "~/types";
import { FnDescriptionStatus } from "~/types";

type FunctionResult = {
  notice: string;
  sigHash: string;
  submitter: string;
  disputed: boolean;
  guideline: {
    cooldownPeriod: number;
  };
  upsertAt: number;
};

type QueryResult = {
  data: {
    contract: {
      functions: FunctionResult[];
    };
  };
  errors?: { message: string }[];
};

const gql = String.raw;

const fetchFromGraphQL = async (query: string) => {
  if (!process.env.SUBGRAPH_URI) {
    throw new Error("SUBGRAPH_URI is required");
  }

  const body: any = { query };

  return fetch(process.env.SUBGRAPH_URI, {
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });
};

const getEntryStatus = (fnResult: FunctionResult): FnDescriptionStatus => {
  const date = Date.now() / 1000;

  if (fnResult.disputed) {
    return FnDescriptionStatus.Challenged;
  }

  const timeSince = fnResult.upsertAt + fnResult.guideline.cooldownPeriod;

  if (timeSince > date) {
    return FnDescriptionStatus.Added;
  } else {
    return FnDescriptionStatus.Pending;
  }
};

const parseFnResult = (fnResult: FunctionResult): FnEntry => {
  const { notice, sigHash, submitter, upsertAt } = fnResult;

  return {
    notice,
    sigHash,
    status: getEntryStatus(fnResult),
    submitter,
    upsertAt,
  };
};

export const fetchContractFnEntries = async (
  bytecodeHash: string
): Promise<FnEntry[]> => {
  const contractId = utils.id(
    `${process.env.ROSETTE_STONE_ADDRESS}-${bytecodeHash}`
  );

  try {
    const rawResponse = await fetchFromGraphQL(
      gql`
        {
          contract(id: "${contractId}") {
            functions {
              notice
              sigHash
              submitter
              guideline {
                cooldownPeriod
              }
              upsertAt
            }
          }
        }
      `
    );
    const result = (await rawResponse.json()) as QueryResult;

    if (result.errors?.length) {
      const err = result.errors[0];
      console.error(err);
      throw new Error(err.message);
    }

    if (!result.data.contract) {
      return [];
    }

    return result.data.contract.functions.map(parseFnResult);
  } catch (err) {
    throw new Response(
      "There was an error fetching the contract's function descriptions",
      { status: 500, statusText: "Subgraph Error" }
    );
  }
};
