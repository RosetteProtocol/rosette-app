/* eslint-disable jsx-a11y/alt-text */
import React from "react";
import styled from "styled-components";
import { IndividualStepTypes } from "../stepper-statuses";
import blockIcon from "@assets/blockIcon.svg";
import signRequestFailIllustration from "@assets/signRequestFail.svg";
import signRequestSuccessIllustration from "@assets/signRequestSuccess.svg";
import trxBeingMinedIllustration from "@assets/trxBeingMined.svg";

const illustrations = {
  [IndividualStepTypes.Working]: trxBeingMinedIllustration,
  [IndividualStepTypes.Success]: signRequestSuccessIllustration,
  [IndividualStepTypes.Error]: signRequestFailIllustration,
};

function Illustration({ status, index }: { status: string; index: number }) {
  return (
    <>
      {status === IndividualStepTypes.Prompting ? (
        <StyledDiv>
          <img src={blockIcon} height={48} width={48} />
        </StyledDiv>
      ) : (
        // @ts-expect-error
        <img src={illustrations[status]} height={96} width={96} />
      )}
    </>
  );
}

export default Illustration;

const StyledDiv = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  border-radius: 100%;
  background-color: ${({ theme }) => theme.contentSecondary};
  color: ${({ theme }) => theme.positiveContent};
`;
