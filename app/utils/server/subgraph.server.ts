import { utils } from "ethers";

type Entry = { notice: string; sigHash: string; submitter: string };

type SubgraphResponse = {
  data: {
    contract: {
      functions: Entry[];
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

export const fetchContractEntries = async (
  contractBytecode: string
): Promise<Entry[]> => {
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
            }
          }
        }
      `
    );
    const result = (await rawResponse.json()) as SubgraphResponse;

    if (!result.data.contract) {
      return [];
    }

    return result.data.contract.functions;
  } catch (err) {
    throw new Response(
      "There was an error fetching the contract's current function descriptions",
      { status: 500, statusText: "Subgraph Error" }
    );
  }
};
