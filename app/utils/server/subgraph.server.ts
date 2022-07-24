import type { FnEntrySubgraphData } from "~/types";
import { FnDescriptionStatus } from "~/types";

type FunctionResult = {
  id: string;
  cid: string;
  contract: {
    scope: string;
  };
  sigHash: string;
  submitter: string;
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

// const buildContractId = (
//   rosetteStoneAddress: string,
//   bytecodeHash: string
// ): string => `${rosetteStoneAddress.toLowerCase()}-${bytecodeHash}`;

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

const parseFnResult = (fnResult: FunctionResult): FnEntrySubgraphData => {
  const { id, cid, contract, sigHash, submitter, upsertAt } = fnResult;

  return {
    id,
    cid,
    contract: contract.scope,
    sigHash,
    status: FnDescriptionStatus.Added,
    submitter,
    upsertAt,
  };
};

export const fetchContractFnEntries = async (
  bytecodeHash: string
): Promise<FnEntrySubgraphData[]> => {
  const contractId = bytecodeHash;

  // buildContractId(process.env.ROSETTE_STONE_ADDRESS!, bytecodeHash);

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
              sigHash
              submitter
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

export const fetchFnEntries = async (): Promise<FnEntrySubgraphData[]> => {
  try {
    const rawResponse = await fetchFromGraphQL(
      gql`
        {
          functions {
            id
            contract {
              scope
            }
            cid
            sigHash
            submitter
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
): Promise<FnEntrySubgraphData | undefined> => {
  try {
    const rawResponse = await fetchFromGraphQL(
      gql`
        {
          function(id: "${entryId}") {
            id
            contract {
              scope
            }
            cid
            sigHash
            submitter
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
