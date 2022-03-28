import { Button, GU, useViewport } from "@1hive/1hive-ui";
import { utils } from "ethers";
import { Fragment } from "ethers/lib/utils";
import { useEffect, useMemo } from "react";
import styled from "styled-components";
import scrollIcon from "./assets/scroll-icon.svg";
import handIcon from "./assets/hand-icon.svg";
import { getFnSelector } from "~/utils";
import type { Entry } from "~/utils/server/subgraph.server";
import { Carousel } from "./Carousel";
import { FunctionDescription } from "./FunctionDescription";
import { Pagination } from "./Pagination";
import {
  actions,
  useContractDescriptorStore,
} from "./use-contract-descriptor-store";

const FN_DESCRIPTOR_HEIGHT = "527px";

type ContractDescriptorScreenProps = {
  contractData: {
    abi: string;
    bytecode: string;
    contractName: string;
    entries: Entry[];
  };
};

export const ContractDescriptorScreen = ({
  contractData,
}: ContractDescriptorScreenProps) => {
  const { below } = useViewport();
  const { fnSelected, fnDescriptions } = useContractDescriptorStore();
  const fnFragments = useMemo(
    () =>
      new utils.Interface(contractData.abi).fragments.filter(
        (f: Fragment) => f.type === "function"
      ),
    [contractData.abi]
  );
  const compactMode = below("large");
  const fnDescriptionsLength = Object.values(fnDescriptions).length;

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (e.deltaY < 0) {
        actions.goToPrevFn();
      } else if (e.deltaY > 0) {
        actions.goToNextFn(fnFragments.length);
      }
    };

    window.addEventListener("wheel", onWheel);

    return () => {
      window.removeEventListener("wheel", onWheel);
    };
  }, [fnFragments.length]);

  return (
    <Layout compactMode={compactMode}>
      <FiltersContainer>FILTERS</FiltersContainer>
      <PaginationContainer>
        <Pagination
          direction={compactMode ? "horizontal" : "vertical"}
          pages={fnFragments.length}
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
          items={fnFragments.map((f) => {
            const key = getFnSelector(f);
            return (
              <FunctionDescription
                key={key}
                description={""}
                fragment={f}
                onEntryChange={() => {}}
              />
            );
          })}
          direction={compactMode ? "horizontal" : "vertical"}
          itemSpacing={450}
        />
      </CarouselContainer>
      <SubmitContainer>
        <SubmitButton label={`Submit  (${fnDescriptionsLength})`} wide />
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
