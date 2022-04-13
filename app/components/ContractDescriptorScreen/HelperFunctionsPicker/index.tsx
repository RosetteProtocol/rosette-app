import { Button, GU, IconMenu, Popover, SearchInput } from "@1hive/1hive-ui";
import { useRef, useState } from "react";
import styled from "styled-components";
import { FunctionDetails } from "./FunctionDetails";
import { HELPER_FUNCTIONS } from "~/radspec-helper-functions";

type Placement = "top" | "bottom" | "left" | "right";

export const HelperFunctionsPicker = ({
  popoverPlacement,
}: {
  popoverPlacement?: Placement;
}) => {
  const opener = useRef();
  const [visible, setVisible] = useState(false);

  return (
    <>
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
            <SearchInput placeholder="Search function…" wide />
            <FunctionsSection>
              {HELPER_FUNCTIONS.map((fn) => (
                <FunctionDetails key={fn.name} fn={fn} />
              ))}
            </FunctionsSection>
          </PopoverLayout>
        </PopoverWrapper>
      </Popover>
    </>
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
