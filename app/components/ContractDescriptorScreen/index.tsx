import { Button, GU, useViewport } from "@1hive/1hive-ui";
import { useEffect, useState } from "react";
import styled from "styled-components";
import scrollIcon from "./assets/scroll-icon.svg";
import handIcon from "./assets/hand-icon.svg";
import { useDebounce } from "~/hooks/useDebounce";
import { Carousel } from "./Carousel";
import { FunctionDescriptor } from "./FunctionDescriptor";
import { Pagination } from "./Pagination";
import {
  actions,
  selectors,
  useContractDescriptorStore,
} from "./use-contract-descriptor-store";
import { ContractData, FnEntry } from "~/types";

const FN_DESCRIPTOR_HEIGHT = "527px";

type ContractDescriptorScreenProps = {
  contractData: ContractData;
  currentFnEntries: FnEntry[];
};

export const ContractDescriptorScreen = ({
  contractData: { abi },
  currentFnEntries,
}: ContractDescriptorScreenProps) => {
  const { below } = useViewport();
  const { fnSelected, fnDescriptorEntries } = useContractDescriptorStore();
  const compactMode = below("large");
  const fnDescriptionsCounter = selectors.fnDescriptionsCounter();
  /**
   * Debounce wheel event to avoid fast changing pages on scroll.
   */
  const [wheelEvent, setWheelEvent] = useState<WheelEvent | null>(null);
  const debouncedWheelEvent = useDebounce<WheelEvent | null>(wheelEvent, 50);

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
    <Layout compactMode={compactMode}>
      <FiltersContainer>FILTERS</FiltersContainer>
      <PaginationContainer>
        <Pagination
          direction={compactMode ? "horizontal" : "vertical"}
          pages={fnDescriptorEntries.length}
          selected={fnSelected}
          onChange={actions.fnSelected}
          touchMode={compactMode}
        />
        <PaginationIcon
          size={compactMode ? 34 : 45}
          src={compactMode ? handIcon : scrollIcon}
          alt=""
        />
      </PaginationContainer>
      <CarouselContainer>
        <Carousel
          selected={fnSelected}
          items={fnDescriptorEntries.map((f) => (
            <FunctionDescriptor
              key={f.sigHash}
              fnDescriptorEntry={f}
              onEntryChange={actions.upsertFnDescription}
            />
          ))}
          direction={compactMode ? "horizontal" : "vertical"}
          itemSpacing={450}
        />
      </CarouselContainer>
      <SubmitContainer>
        <SubmitButton label={`Submit  (${fnDescriptionsCounter})`} wide />
      </SubmitContainer>
    </Layout>
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
      [row1-start] ". filters ." 1fr [row1-end]
      [row2-start] "pagination carousel ." 8fr [row2-end]
      [row3-start] ". . submit" 1fr [row3-end]
      / 1fr minmax(200px,527px) 1fr;
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

const SubmitContainer = styled.div``;

const SubmitButton = styled(Button)`
  box-sizing: border-box;
  padding: ${3 * GU}px;
  ${({ wide }) => wide && "width: 100%;"};
`;
