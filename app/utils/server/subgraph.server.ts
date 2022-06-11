import type { FnEntry } from "~/types";
import { FnDescriptionStatus } from "~/types";

type FunctionResult = {
  id: string;
  abi: string;
  cid: string;
  contract: {
    scope: string;
  };
  notice: string;
  sigHash: string;
  submitter: {
    address: string;
  };
  disputed: boolean;
  guideline: {
    cooldownPeriod: number;
  };
  upsertAt: number;
};

type QueryContractResult = {
  data: {
    contract: {
      functions: FunctionResult[];
    };
  };
  errors?: { message: string }[];
};

type QueryFnsResult = {
  data: {
    functions: FunctionResult[];
  };
  errors?: { message: string }[];
};

type QueryFnResult = {
  data: {
    function: FunctionResult;
  };
  errors?: { message: string }[];
};

const gql = String.raw;

const buildContractId = (
  rosetteStoneAddress: string,
  bytecodeHash: string
): string => `${rosetteStoneAddress.toLowerCase()}-${bytecodeHash}`;

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

  if (date > timeSince) {
    return FnDescriptionStatus.Added;
  } else {
    return FnDescriptionStatus.Pending;
  }
};

const parseFnResult = (fnResult: FunctionResult): FnEntry => {
  const { id, abi, cid, contract, notice, sigHash, submitter, upsertAt } =
    fnResult;

  return {
    id,
    abi,
    cid,
    contract: contract.scope,
    notice,
    sigHash,
    status: getEntryStatus(fnResult),
    submitter: submitter.address,
    upsertAt,
  };
};

export const fetchContractFnEntries = async (
  bytecodeHash: string
): Promise<FnEntry[]> => {
  const contractId = buildContractId(
    process.env.ROSETTE_STONE_ADDRESS!,
    bytecodeHash
  );

  try {
    const rawResponse = await fetchFromGraphQL(
      gql`
        {
          contract(id: "${contractId}") {
            functions {
              id
              cid
              contract {
                scope
              }
              notice
              sigHash
              submitter {
                address
              }
              guideline {
                cooldownPeriod
              }
              upsertAt
            }
          }
        }
      `
    );

    const result = (await rawResponse.json()) as QueryContractResult;

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

export const fetchFnEntries = async (): Promise<FnEntry[]> => {
  try {
    const rawResponse = await fetchFromGraphQL(
      gql`
        {
          functions {
            id
            abi
            contract {
              scope
            }
            cid
            notice
            sigHash
            submitter {
              address
            }
            guideline {
              cooldownPeriod
            }
            upsertAt
          }
        }
      `
    );

    const result = (await rawResponse.json()) as QueryFnsResult;

    if (result.errors?.length) {
      const err = result.errors[0];
      console.error(err);
      throw new Error(err.message);
    }

    if (!result.data.functions) {
      return [];
    }

    return result.data.functions.map(parseFnResult);
  } catch (err) {
    throw new Response(
      "There was an error fetching the contract's function descriptions",
      { status: 500, statusText: "Subgraph Error" }
    );
  }
};

export const fetchFnEntry = async (
  entryId: string
): Promise<FnEntry | undefined> => {
  try {
    const rawResponse = await fetchFromGraphQL(
      gql`
        {
          function(id: "${entryId}") {
            id
            abi
            contract {
              scope
            }
            cid
            notice
            sigHash
            submitter {
              address
            }
            guideline {
              cooldownPeriod
            }
            upsertAt
          }
        }
      `
    );

    const result = (await rawResponse.json()) as QueryFnResult;

    if (result.errors?.length) {
      const err = result.errors[0];
      console.error(err);
      throw new Error(err.message);
    }

    if (!result.data.function) {
      return undefined;
    }

    return parseFnResult(result.data.function);
  } catch (err) {
    throw new Response(
      "There was an error fetching the contract's function descriptions",
      { status: 500, statusText: "Subgraph Error" }
    );
  }
};
