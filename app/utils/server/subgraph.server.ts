import { utils } from "ethers";
import { FnDescriptionStatus, FnEntry } from "~/types";

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
  const { notice, sigHash, submitter, disputed, upsertAt } = fnResult;

  return {
    notice,
    disputed,
    sigHash,
    status: getEntryStatus(fnResult),
    submitter,
    upsertAt,
  };
};

export const fetchContractFnEntries = async (
  contractBytecode: string
): Promise<FnEntry[]> => {
  const contractId = utils.id(
    `${process.env.ROSETTE_STONE_ADDRESS}-${utils.id(contractBytecode)}`
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
              disputed
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

    if (!result.data.contract) {
      return [];
    }

    return result.data.contract.functions.map(parseFnResult);
  } catch (err) {
    throw new Response(
      "There was an error fetching the contract's current function descriptions",
      { status: 500, statusText: "Subgraph Error" }
    );
  }
};
