import {
  addressesEqual,
  Button,
  GU,
  IconMenu,
  Popover,
  SearchInput,
  textStyle,
} from "@blossom-labs/rosette-ui";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { WheelEventHandler } from "react";
import styled from "styled-components";
import { HELPER_FUNCTIONS } from "~/radspec-helper-functions";
import type { HelperFunction } from "~/radspec-helper-functions";

import { actions, selectors } from "../use-contract-descriptor-store";
import { SELECTION_SEPARATOR } from "~/utils/client/selection.client";
import { useAccount } from "wagmi";
import { Details } from "~/components/Details";
import { Entry } from "./Entry";

type Placement =
  | "top"
  | "bottom"
  | "left"
  | "right"
  | "left-end"
  | "left-start";

const computeFnSignature = (fn: HelperFunction): string => {
  const params = fn.params
    // Filter out optional parameters
    ?.filter((p) => p.defaultValue === undefined)
    .map((p) => `${SELECTION_SEPARATOR}${p.name}`)
    .join(",");

  return `${fn.name}(${params})`;
};

export const HelperFunctionsPicker = ({
  popoverPlacement,
}: {
  popoverPlacement?: Placement;
}) => {
  const [{ data: accountData }] = useAccount();
  const opener = useRef();
  const [visible, setVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const filteredHelperFunctions = useMemo(
    () =>
      HELPER_FUNCTIONS.filter((fn) =>
        fn.name.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [searchTerm]
  );
  const currentEntrySubmitter =
    selectors.currentFnDescriptorEntry()?.entry?.submitter;
  const pickerDisabled =
    currentEntrySubmitter &&
    !addressesEqual(currentEntrySubmitter, accountData?.address ?? "");

  const handleUseFunction = useCallback((fn: HelperFunction) => {
    actions.addHelperFunction(computeFnSignature(fn));
    setVisible(false);
  }, []);

  const handlePickerWheelEvent = useCallback<WheelEventHandler>((e) => {
    e.stopPropagation();
  }, []);

  useEffect(() => {
    if (!visible) {
      // Wait a little bit for the popover to close.
      setTimeout(() => setSearchTerm(""), 100);
    }
  }, [visible]);

  return (
    <div onWheel={handlePickerWheelEvent}>
      <PickerButton
        display="icon"
        label="Helper functions"
        ref={opener}
        disabled={pickerDisabled}
        icon={<IconMenu />}
        onClick={() => setVisible(true)}
      />
      <Popover
        placement={popoverPlacement}
        visible={visible}
        opener={opener.current}
        onClose={() => setVisible(false)}
      >
        <PopoverWrapper>
          <PopoverLayout>
            <Header>Functions library</Header>
            <SearchInput
              placeholder="Search function…"
              wide
              onChange={setSearchTerm}
            />
            <FunctionsSection>
              {filteredHelperFunctions.map((fn) => (
                <Details
                  label={fn.name}
                  actionLabel="Use"
                  onAction={() => handleUseFunction(fn)}
                >
                  <Entry description={fn.description} params={fn.params} />
                </Details>
              ))}
            </FunctionsSection>
          </PopoverLayout>
        </PopoverWrapper>
      </Popover>
    </div>
  );
};

const PickerButton = styled(Button)`
  border: 1px solid;
`;

const PopoverWrapper = styled.div`
  max-height: 700px;
  overflow: auto;
  &::-webkit-scrollbar {
    width: 12px;
    background-color: ${(props) => props.theme.surfaceSelected};
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 10px;
    box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.1);
    -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.1);
    background-color: ${(props) => props.theme.surfaceIcon};
  }
`;

const PopoverLayout = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 400px;
  gap: ${2 * GU}px;
  box-sizing: border-box;
  padding: ${2 * GU}px;
`;

const Header = styled.div`
  color: ${({ theme }) => theme.content};
  ${textStyle("body2")};
`;

const FunctionsSection = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: ${1 * GU}px;
`;
