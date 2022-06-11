import { Button, GU, LoadingRing, useViewport } from "@blossom-labs/rosette-ui";
import { useFetcher } from "@remix-run/react";
import type { Fetcher } from "@remix-run/react/transition";
import { utils } from "ethers";
import { useCallback, useEffect, useState } from "react";
import styled from "styled-components";
import { useAccount } from "wagmi";

import scrollIcon from "./assets/scroll-icon.svg";
import handIcon from "./assets/hand-icon.svg";
import { Pagination } from "./Pagination";
import {
  actions,
  selectors,
  useContractDescriptorStore,
} from "./use-contract-descriptor-store";
import type {
  Function,
  UserFnDescription,
} from "./use-contract-descriptor-store";
import type { ContractData, FnEntry } from "~/types";
import useRosetteActions from "./useRosetteActions";
import { HelperFunctionsPicker } from "./HelperFunctionsPicker";
import { FnDescriptorsCarousel } from "./FnDescriptorsCarousel";
import type { IPFSData } from "~/routes/fn-descriptions-upload";
import debounce from "lodash.debounce";

const FN_DESCRIPTOR_DEFAULT_HEIGHT = "527px";

type ContractDescriptorScreenProps = {
  contractAddress: string;
  contractData: ContractData;
  currentFnEntries: FnEntry[];
};

const buildIPFSUploadData = (
  fnDescriptorEntries: Function[],
  userFnDescriptions: Record<string, UserFnDescription>
): IPFSData["functions"] => {
  return Object.keys(userFnDescriptions).map((sigHash) => {
    const fullName = fnDescriptorEntries.find(
      (e) => e.sigHash === sigHash
    )?.fullName;

    if (!fullName) {
      throw new Error(
        `Couldn't upload to IPFS: function ${sigHash} not found.`
      );
    }

    return {
      description: userFnDescriptions[sigHash].description,
      fullName,
      sigHash,
    };
  });
};

const uploadFetcherReturnedData = (fetcher: Fetcher): boolean =>
  fetcher.state === "loading" &&
  fetcher.type === "actionReload" &&
  fetcher.data;

export const ContractDescriptorScreen = ({
  contractAddress,
  contractData: { abi, bytecode },
  currentFnEntries,
}: ContractDescriptorScreenProps) => {
  const [callingContract, setCallingContract] = useState(false);
  const { below } = useViewport();
  const [{ data: accountData }] = useAccount();
  const { fnSelected, fnDescriptorEntries, userFnDescriptions } =
    useContractDescriptorStore();
  const actionFetcher = useFetcher();
  const { upsertEntries } = useRosetteActions();
  const bytecodeHash = utils.id(bytecode);
  const fnDescriptionsCounter = selectors.fnDescriptionsCounter();
  const compactMode = below("large");
  const submittingEntries =
    actionFetcher.state === "submitting" ||
    actionFetcher.state === "loading" ||
    callingContract;
  const submitDisabled =
    !accountData?.address || fnDescriptionsCounter === 0 || submittingEntries;

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();

      const fnsData = buildIPFSUploadData(
        fnDescriptorEntries,
        userFnDescriptions
      );

      actionFetcher.submit(
        { bytecodeHash, functions: JSON.stringify(fnsData) },
        {
          method: "post",
          action: "/fn-descriptions-upload",
        }
      );
    },
    [actionFetcher, bytecodeHash, fnDescriptorEntries, userFnDescriptions]
  );

  useEffect(() => {
    const submitEntries = async () => {
      try {
        const sigs = Object.keys(userFnDescriptions).map((sigHash) => sigHash);
        const scopes = new Array(sigs.length).fill(bytecodeHash);
        const cids: string[] = Object.values(actionFetcher.data);

        setCallingContract(true);
        await upsertEntries(scopes, sigs, cids);
        window.alert("Entries submitted!"); // TODO: Use tx feedback implementation

        // Should we redirect to the entries page?
      } catch (err) {
        console.error(`Error submitting entries: ${err}`);
      } finally {
        setCallingContract(false);
      }
    };

    /**
     * It keeps this effect from running more than once after action
     * fetcher returns data.
     */
    if (uploadFetcherReturnedData(actionFetcher)) {
      submitEntries();
    }
  }, [
    actionFetcher,
    bytecodeHash,
    contractAddress,
    upsertEntries,
    userFnDescriptions,
  ]);

  useEffect(() => {
    if (abi && currentFnEntries) {
      actions.setUpFnDescriptorEntries(abi, currentFnEntries);
    }
  }, [abi, currentFnEntries]);

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (e.deltaY < 0) {
        actions.goToPrevFn();
      } else {
        actions.goToNextFn();
      }
    };

    const debouncedOnWheel = debounce(onWheel, 100);

    window.addEventListener("wheel", debouncedOnWheel);

    return () => {
      window.removeEventListener("wheel", debouncedOnWheel);
    };
  }, []);

  return (
    <form style={{ height: "100%" }} onSubmit={handleSubmit}>
      <Layout compactMode={compactMode}>
        <FiltersContainer>FILTERS</FiltersContainer>
        {fnDescriptorEntries.length > 1 && (
          <PaginationContainer>
            <Pagination
              direction={compactMode ? "horizontal" : "vertical"}
              pages={fnDescriptorEntries.length}
              selected={fnSelected}
              size={(compactMode ? 3 : 4) * GU}
              onChange={actions.fnSelected}
              touchMode={compactMode}
            />
            <PaginationIcon
              size={compactMode ? 34 : 45}
              src={compactMode ? handIcon : scrollIcon}
              alt=""
            />
          </PaginationContainer>
        )}
        <CarouselContainer>
          <FnDescriptorsCarousel compactMode={compactMode} />
        </CarouselContainer>
        <FunctionsPickerContainer>
          <HelperFunctionsPicker popoverPlacement="left-start" />
        </FunctionsPickerContainer>
        <SubmitContainer>
          <SubmitButton
            label={
              submittingEntries ? (
                <div
                  style={{
                    display: "flex",
                    gap: 1 * GU,
                  }}
                >
                  <LoadingRing mode="half-circle" />
                  Submitting entries…
                </div>
              ) : (
                `Submit  (${fnDescriptionsCounter})`
              )
            }
            type="submit"
            mode="strong"
            wide
            disabled={submitDisabled}
          />
        </SubmitContainer>
      </Layout>
    </form>
  );
};

const Layout = styled.div<{ compactMode: boolean }>`
  display: grid;
  height: 100%;
  width: 100%;
  padding: ${4 * GU}px;
  grid-gap: ${1 * GU}px;

  ${({ compactMode }) => `
    ${FiltersContainer} {
      grid-area: filters;
    }

    ${PaginationContainer} {
      grid-area: pagination;
      ${
        compactMode
          ? `
          flex-direction: column-reverse;
          `
          : `
          justify-self: start;
          `
      }
    }

    ${CarouselContainer} {
      grid-area: carousel;
    }

    ${FunctionsPickerContainer} {
      grid-area: picker;
    }

    ${SubmitContainer} {
      grid-area: submit;
      ${
        compactMode
          ? `
        width: 100%;
      `
          : `
        width: 230px;
      `
      };
      place-self: end;

    }
   ${
     compactMode
       ? `grid: 
      [row1-start] "filters" 1fr [row1-end]
      [row2-start] "picker" 0.5fr [row2-end]
      [row3-start] "carousel" 5fr [row3-end]
      [row4-start] "pagination" 1fr [row4-end]
      [row5-start] "submit" 1fr [row5-end]
      / minmax(200px,${FN_DESCRIPTOR_DEFAULT_HEIGHT});

      justify-content: center;
    `
       : `grid: 
      [row1-start] "filters filters filters" 1fr [row1-end]
      [row2-start] "pagination carousel picker" 8fr [row2-end]
      [row3-start] ". . submit" 1fr [row3-end]
      / 1fr minmax(200px,${FN_DESCRIPTOR_DEFAULT_HEIGHT}) 1fr;
    `
   }
  `};
`;

const FiltersContainer = styled.div`
  justify-self: center;
  color: ${({ theme }) => theme.content};
`;

const PaginationContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${1 * GU}px;
`;

const PaginationIcon = styled.img<{ size: number }>`
  ${({ size }) => `width: ${size}px; height: ${size}px;`};
  color: ${({ theme }) => theme.border};
`;

const CarouselContainer = styled.div`
  min-width: 100%;
  height: 100%;
`;

const FunctionsPickerContainer = styled.div`
  justify-self: end;
`;

const SubmitContainer = styled.div``;

const SubmitButton = styled(Button)`
  box-sizing: border-box;
  padding: ${3 * GU}px;
  ${({ wide }) => wide && "width: 100%;"};
`;
