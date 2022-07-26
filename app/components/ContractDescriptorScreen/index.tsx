import {
  Button,
  GU,
  LoadingRing,
  RootPortal,
  useViewport,
} from "@blossom-labs/rosette-ui";
import { useFetcher } from "@remix-run/react";
import type { Fetcher } from "@remix-run/react";
import { utils } from "ethers";
import { useCallback, useEffect, useState } from "react";
import type { WheelEventHandler } from "react";
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
  FnDescriptorEntry,
  UserFnDescription,
} from "./use-contract-descriptor-store";
import type { ContractData, FnEntry } from "~/types";
import useRosetteActions from "./useRosetteActions";
import { HelperFunctionsPicker } from "./HelperFunctionsPicker";
import { FnDescriptorsCarousel } from "./FnDescriptorsCarousel";
import type { ArweaveData } from "~/routes/fn-descriptions-upload";
import { FunctionDescriptorFilters } from "./FunctionDescriptorFilters";
import debounce from "lodash.debounce";

const FN_DESCRIPTOR_DEFAULT_HEIGHT = "527px";

const debouncedOnWheel = debounce<WheelEventHandler>((e) => {
  e.stopPropagation();
  e.preventDefault();
  if (e.deltaY < 0) {
    actions.goToPrevFn();
  } else {
    actions.goToNextFn();
  }

  return false;
}, 100);

type ContractDescriptorScreenProps = {
  contractAddress: string;
  contractData: ContractData;
  currentFnEntries: FnEntry[];
};

const buildBundlrUploadData = (
  fnDescriptorEntries: FnDescriptorEntry[],
  userFnDescriptions: Record<string, UserFnDescription>
): ArweaveData["functions"] => {
  return Object.keys(userFnDescriptions).map((sigHash) => {
    const fullName = fnDescriptorEntries.find(
      (e) => e.sigHash === sigHash
    )?.fullName;

    if (!fullName) {
      throw new Error(
        `Couldn't upload to Bundlr: function ${sigHash} not found.`
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
  contractData,
  currentFnEntries,
}: ContractDescriptorScreenProps) => {
  const [callingContract, setCallingContract] = useState(false);
  const { below } = useViewport();
  const [{ data: accountData }] = useAccount();
  const { fnSelected, filteredFnDescriptorEntries, userFnDescriptions } =
    useContractDescriptorStore();
  const actionFetcher = useFetcher();
  const { upsertEntries } = useRosetteActions();
  const bytecodeHash = utils.id(contractData.bytecode);
  const fnDescriptionsCounter = selectors.fnDescriptionsCounter();
  const compactMode = below("large");
  const submittingEntries =
    actionFetcher.state === "submitting" ||
    actionFetcher.state === "loading" ||
    callingContract;
  const submitDisabled =
    !accountData?.address || fnDescriptionsCounter === 0 || submittingEntries;

  const SubmitButton = () => (
    <SubmitContainer compactMode={compactMode}>
      <InnerSubmitButton
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
  );

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();

      const fnsData = buildBundlrUploadData(
        filteredFnDescriptorEntries,
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
    [
      actionFetcher,
      bytecodeHash,
      filteredFnDescriptorEntries,
      userFnDescriptions,
    ]
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
    if (contractData && currentFnEntries) {
      actions.setUpContractDescriptorStore(contractData, currentFnEntries);
    }
  }, [contractData, currentFnEntries]);

  return (
    <form style={{ height: "100%" }} onSubmit={handleSubmit}>
      <Layout compactMode={compactMode}>
        <FiltersContainer>
          <FunctionDescriptorFilters compactMode={compactMode} />
        </FiltersContainer>
        {filteredFnDescriptorEntries.length > 1 && (
          <PaginationContainer onWheel={debouncedOnWheel}>
            <Pagination
              direction={compactMode ? "horizontal" : "vertical"}
              pages={filteredFnDescriptorEntries.length}
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
          {filteredFnDescriptorEntries.length ? (
            <FnDescriptorsCarousel compactMode={compactMode} />
          ) : (
            <EmptyContainer>No functions found.</EmptyContainer>
          )}
        </CarouselContainer>
        <FunctionsPickerContainer>
          <HelperFunctionsPicker popoverPlacement="left-start" />
        </FunctionsPickerContainer>
        {compactMode ? (
          <SubmitButton />
        ) : (
          <RootPortal>
            <SubmitButton />
          </RootPortal>
        )}
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
      [row1-start] "filters filters filters" 1.5fr [row1-end]
      [row2-start] "pagination carousel picker" 8fr [row2-end]
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
  display: flex;
  justify-content: center;
  align-items: center;
`;

const FunctionsPickerContainer = styled.div`
  justify-self: end;
`;

const SubmitContainer = styled.div<{ compactMode: boolean }>`
  ${({ compactMode }) =>
    compactMode
      ? `
    width: 100%;
  `
      : `
    width: 230px;
    position: fixed;
    bottom: ${3 * GU}px;
    right: ${5 * GU}px;
  `};
`;

const InnerSubmitButton = styled(Button)`
  box-sizing: border-box;
  padding: ${3 * GU}px;
  ${({ wide }) => wide && "width: 100%;"};
`;

const EmptyContainer = styled.div`
  color: ${({ theme }) => theme.surfaceContent};
`;
