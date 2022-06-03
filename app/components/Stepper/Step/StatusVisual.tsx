import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { Transition, animated } from "@react-spring/web";
import styled, { css, keyframes } from "styled-components";
import { GU, textStyle, IconCross, IconCheck } from "@blossom-labs/rosette-ui";
import { springs } from "~/springs";
import { useDisableAnimation } from "~/hooks/useDisableAnimation";
import { IndividualStepTypes } from "../stepper-statuses";
import Illustration from "./Illustration";

const STATUS_ICONS = {
  [IndividualStepTypes.Error]: IconCross,
  [IndividualStepTypes.Success]: IconCheck,
};

const AnimatedDiv = animated.div;

const spinAnimation = css`
  mask-image: linear-gradient(35deg, rgba(0, 0, 0, 0.1) 10%, rgba(0, 0, 0, 1));
  animation: ${keyframes`
    from {
      transform: rotate(0deg);
    }

    to {
      transform: rotate(360deg);
    }
  `} 1.25s linear infinite;
`;

const pulseAnimation = css`
  animation: ${keyframes`
    from {
      opacity: 1;
    }

    to {
      opacity: 0.1;
    }
  `} 0.75s linear alternate infinite;
`;

function StatusVisual({
  status,
  color,
  number,
  withoutFirstStep,
  ...props
}: any) {
  const [animationDisabled, enableAnimation] = useDisableAnimation();

  const [statusIcon, illustration] = useMemo(() => {
    // @ts-expect-error
    const Icon = STATUS_ICONS[status];

    return [
      Icon && <Icon />,
      // eslint-disable-next-line react/jsx-key
      <StepIllustration
        number={number}
        status={status}
        withoutFirstStep={withoutFirstStep}
      />,
    ];
  }, [status, number, withoutFirstStep]);

  return (
    <div
      css={`
        display: flex;
        position: relative;
        width: ${15 * GU}px;
        height: ${15 * GU}px;
      `}
      {...props}
    >
      <div
        style={{
          display: "flex",
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ position: "relative", zIndex: 1 }}>
          <div
            style={{ position: "absolute", bottom: `${0.5 * GU}px`, right: 0 }}
          >
            <Transition
              config={(_, state) =>
                // TransitionPhase ENTER
                state === 1 ? springs.gentle : springs.instant
              }
              items={statusIcon}
              onStart={enableAnimation}
              immediate={animationDisabled}
              from={{
                transform: "scale3d(1.3, 1.3, 1)",
              }}
              enter={{
                opacity: 1,
                transform: "scale3d(1, 1, 1)",
              }}
              leave={{
                position: "absolute",
                opacity: 0,
              }}
            >
              {(currentStatusIcon) =>
                currentStatusIcon &&
                ((animProps: any) => (
                  <StyledAnimatedDiv color={color} style={animProps}>
                    {currentStatusIcon}
                  </StyledAnimatedDiv>
                ))
              }
            </Transition>
          </div>

          {illustration}
        </div>
        <StyledDiv color={color} status={status} />
      </div>
    </div>
  );
}

StatusVisual.propTypes = {
  status: PropTypes.oneOf([
    IndividualStepTypes.Waiting,
    IndividualStepTypes.Prompting,
    IndividualStepTypes.Working,
    IndividualStepTypes.Success,
    IndividualStepTypes.Error,
  ]).isRequired,
  color: PropTypes.string.isRequired,
  number: PropTypes.number.isRequired,
};

/* eslint-disable react/prop-types */
function StepIllustration({ number, status, withoutFirstStep }: any) {
  const renderIllustration =
    status === IndividualStepTypes.Working ||
    status === IndividualStepTypes.Error ||
    status === IndividualStepTypes.Success ||
    withoutFirstStep;

  return (
    <Container>
      {renderIllustration ? (
        <Illustration status={status} index={number} />
      ) : (
        <NumberContainer>{number}</NumberContainer>
      )}
    </Container>
  );
}
/* eslint-enable react/prop-types */

export default StatusVisual;

const StyledAnimatedDiv = styled(AnimatedDiv)<{ color: string }>`
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 100%;
  padding: ${0.25 * GU}px;
  background-color: ${({ theme }) => theme.surface};
  color: ${({ color }) => color};
  border: 1px solid currentColor;
  bottom: 0;
  right: 0;
`;

const StyledDiv = styled.div<{ status: string; color: string }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;

  border-radius: 100%;
  ${({ theme, status, color }) => `border: 2px solid
    ${status === IndividualStepTypes.Waiting ? "transparent" : color};
    ${status === IndividualStepTypes.Prompting ? pulseAnimation : ""}
    ${status === IndividualStepTypes.Working ? spinAnimation : ""}
    ${
      status === IndividualStepTypes.Prompting
        ? `background-color: ${theme.contentSecondary};`
        : ""
    }`}
`;

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: ${12 * GU}px;
  height: ${12 * GU}px;
`;

const NumberContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.contentSecondary};
  height: 100%;
  width: 100%;
  border-radius: 100%;
  color: ${({ theme }) => theme.positiveContent};
  ${textStyle("title1")};
  font-weight: 600;
`;
