import { Button, GU, IconMenu, Popover, SearchInput } from "@1hive/1hive-ui";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { WheelEventHandler } from "react";
import styled from "styled-components";
import { FunctionDetails } from "./FunctionDetails";
import { HELPER_FUNCTIONS } from "~/radspec-helper-functions";
import type { HelperFunction } from "~/radspec-helper-functions";

import { actions } from "../use-contract-descriptor-store";
import { SELECTION_SEPARATOR } from "~/utils/client/selection.client";

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
      <Button
        display="icon"
        label="Helper functions"
        ref={opener}
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
            <div>Functions library</div>
            <SearchInput
              placeholder="Search function…"
              wide
              onChange={setSearchTerm}
            />
            <FunctionsSection>
              {filteredHelperFunctions.map((fn) => (
                <FunctionDetails
                  key={fn.name}
                  fn={fn}
                  onUse={handleUseFunction}
                />
              ))}
            </FunctionsSection>
          </PopoverLayout>
        </PopoverWrapper>
      </Popover>
    </div>
  );
};

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

const FunctionsSection = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: ${1 * GU}px;
`;
