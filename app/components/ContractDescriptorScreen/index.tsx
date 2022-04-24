import { useCallback, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { utils } from "ethers";
import { Button, GU, useViewport } from "@1hive/1hive-ui";
import { useFetcher } from "@remix-run/react";
import styled from "styled-components";
import scrollIcon from "./assets/scroll-icon.svg";
import handIcon from "./assets/hand-icon.svg";
import { useDebounce } from "~/hooks/useDebounce";
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
import type { IPFSFnDescription } from "~/routes/fn-descriptions-upload";

const FN_DESCRIPTOR_HEIGHT = "527px";

type ContractDescriptorScreenProps = {
  contractAddress: string;
  contractData: ContractData;
  currentFnEntries: FnEntry[];
};

const buildUploadDataJSON = (
  fnDescriptorEntries: Function[],
  userFnDescriptions: Record<string, UserFnDescription>
): IPFSFnDescription[] => {
  return Object.values(userFnDescriptions).map(
    ({ description, sigHash }): IPFSFnDescription => {
      const minimalName = fnDescriptorEntries.find(
        (e) => e.sigHash === sigHash
      )?.minimalName;
      return {
        description,
        minimalName: minimalName ?? "",
        sigHash,
      };
    }
  );
};

export const ContractDescriptorScreen = ({
  contractAddress,
  contractData: { abi, bytecode },
  currentFnEntries,
}: ContractDescriptorScreenProps) => {
  const { below } = useViewport();
  const [{ data: accountData }] = useAccount();
  const { fnSelected, fnDescriptorEntries, userFnDescriptions } =
    useContractDescriptorStore();
  const fnDescriptionsCounter = selectors.fnDescriptionsCounter();

  /**
   * Debounce wheel event to avoid fast changing pages on scroll.
   */
  const [wheelEvent, setWheelEvent] = useState<WheelEvent | null>(null);
  const debouncedWheelEvent = useDebounce<WheelEvent | null>(wheelEvent, 50);
  const compactMode = below("large");

  // Submit entries handler
  const actionFetcher = useFetcher();
  const { upsertEntries } = useRosetteActions();

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();

      const fnDescriptionsJSON = buildUploadDataJSON(
        fnDescriptorEntries,
        userFnDescriptions
      );

      actionFetcher.submit(
        {
          fnDescriptions: JSON.stringify(fnDescriptionsJSON),
        },
        {
          method: "post",
          action: "/fn-descriptions-upload",
        }
      );
    },
    [actionFetcher, fnDescriptorEntries, userFnDescriptions]
  );

  useEffect(() => {
    const submitEntries = async () => {
      try {
        const sigs = Object.values(userFnDescriptions).map(
          ({ sigHash }) => sigHash
        );
        const scopes = new Array(sigs.length).fill(utils.id(bytecode));
        const cids: string[] = Object.values(actionFetcher.data);

        await upsertEntries(scopes, sigs, cids);
        window.alert("Entries submitted!"); // TODO: Use tx feedback implementation

        // Should we redirect to the enties page?
      } catch (err) {
        console.error(`Error submitting entries: ${err}`);
      }
    };

    if (actionFetcher.data) {
      submitEntries();
    }
  }, [
    actionFetcher.data,
    bytecode,
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
    if (debouncedWheelEvent) {
      if (debouncedWheelEvent.deltaY < 0) {
        actions.goToPrevFn();
      } else {
        actions.goToNextFn();
      }
    }
  }, [debouncedWheelEvent]);

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      setWheelEvent(e);
    };

    window.addEventListener("wheel", onWheel);

    return () => {
      window.removeEventListener("wheel", onWheel);
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
            label={`Submit  (${fnDescriptionsCounter})`}
            type="submit"
            wide
            disabled={!accountData?.address}
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
      grid-area: functions-picker;
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
      [row2-start] "carousel" 5fr [row2-end]
      [row3-start] "pagination" 1fr [row3-end]
      [row4-start] "submit" 1fr [row4-end]
      / minmax(200px,${FN_DESCRIPTOR_HEIGHT});

      justify-content: center;
    `
       : `grid: 
      [row1-start] "filters filters filters" 1fr [row1-end]
      [row2-start] "pagination carousel functions-picker" 8fr [row2-end]
      [row3-start] ". . submit" 1fr [row3-end]
      / 1fr minmax(200px,${FN_DESCRIPTOR_HEIGHT}) 1fr;
    `
   }
  `};
`;

const FiltersContainer = styled.div`
  justify-self: center;
`;

const PaginationContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${1 * GU}px;
`;

const PaginationIcon = styled.img<{ size: number }>`
  ${({ size }) => `width: ${size}px; height: ${size}px;`};
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
