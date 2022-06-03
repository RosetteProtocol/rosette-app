/* eslint-disable react/display-name */
import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { Transition, animated } from "@react-spring/web";
import {
  TransactionBadge,
  textStyle,
  useTheme,
  GU,
} from "@blossom-labs/rosette-ui";
import { useNetwork } from "wagmi";
import { IndividualStepTypes } from "../stepper-statuses";
import Divider from "./Divider";
import StatusVisual from "./StatusVisual";
import { useDisableAnimation } from "~/hooks/useDisableAnimation";
import { springs } from "~/springs";
import styled from "styled-components";

const AnimatedSpan = animated.span;

function Step({
  title,
  desc,
  status,
  number,
  transactionHash,
  showDivider,
  withoutFirstStep,
  ...props
}: any) {
  const theme = useTheme();
  const [{ data: networkData }] = useNetwork();
  const { chain } = networkData || {};
  const [animationDisabled, enableAnimation] = useDisableAnimation();

  const { visualColor, descColor } = useMemo(() => {
    const appearance = {
      [IndividualStepTypes.Waiting]: {
        visualColor: theme.accent,
        descColor: theme.contentSecondary,
      },
      [IndividualStepTypes.Prompting]: {
        visualColor: "#7CE0D6",
        descColor: theme.contentSecondary,
      },
      [IndividualStepTypes.Working]: {
        visualColor: "#FFE862",
        descColor: "#C3A22B",
      },
      [IndividualStepTypes.Success]: {
        visualColor: theme.positive,
        descColor: theme.positive,
      },
      [IndividualStepTypes.Error]: {
        visualColor: theme.negative,
        descColor: theme.negative,
      },
    };

    // @ts-expect-error
    const { descColor, visualColor } = appearance[status];
    return {
      visualColor: `${visualColor}`,
      descColor: `${descColor}`,
    };
  }, [status, theme]);

  return (
    <>
      <Container {...props}>
        <StatusVisualStyled
          status={status}
          color={visualColor}
          number={number}
          withoutFirstStep={withoutFirstStep}
        />
        <StyledH2>
          {status === IndividualStepTypes.Error ? "Transaction failed" : title}
        </StyledH2>

        <StyledP>
          <Transition
            config={springs.gentle}
            items={[{ currentDesc: desc, currentColor: descColor }]}
            keys={desc} // Only animate when the description changes
            onStart={enableAnimation}
            immediate={animationDisabled}
            from={{
              opacity: 0,
              transform: `translate3d(0, ${2 * GU}px, 0)`,
            }}
            enter={{
              opacity: 1,
              transform: "translate3d(0, 0, 0)",
            }}
            leave={{
              position: "absolute",
              opacity: 0,
              transform: `translate3d(0, -${2 * GU}px, 0)`,
            }}
            native
          >
            {(item) =>
              item &&
              ((transitionProps: any) => (
                <AnimatedSpanStyled
                  color={item.currentColor}
                  style={transitionProps}
                >
                  {item.currentDesc}
                </AnimatedSpanStyled>
              ))
            }
          </Transition>
        </StyledP>

        <TransitionContainer>
          <Transition
            config={springs.gentle}
            items={transactionHash}
            immediate={animationDisabled}
            from={{
              opacity: 0,
              transform: `translate3d(0, ${1 * GU}px, 0)`,
            }}
            enter={{
              opacity: 1,
              transform: "translate3d(0, 0, 0)",
            }}
            leave={{
              position: "absolute",
              left: 0,
              bottom: 0,
              opacity: 0,
            }}
            native
          >
            {(currentHash) => (transitionProps: any) =>
              currentHash ? (
                <TransitionAnimatedSpanStyled style={transitionProps}>
                  <TransactionBadge
                    transaction={currentHash}
                    networkType={chain?.name}
                    // TODO: update TransactionBadge component to use wagmi format
                    // explorerProvider={chain?.blockExplorers}
                  />
                </TransitionAnimatedSpanStyled>
              ) : null}
          </Transition>
        </TransitionContainer>

        {showDivider && <DividerStyled color={visualColor} />}
      </Container>
    </>
  );
}

Step.propTypes = {
  title: PropTypes.string,
  desc: PropTypes.string,
  transactionHash: PropTypes.string,
  number: PropTypes.number,
  status: PropTypes.oneOf([
    IndividualStepTypes.Waiting,
    IndividualStepTypes.Prompting,
    IndividualStepTypes.Working,
    IndividualStepTypes.Success,
    IndividualStepTypes.Error,
  ]).isRequired,
  showDivider: PropTypes.bool,
};

export default Step;

const Container = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;

  width: ${31 * GU}px;
`;

const StatusVisualStyled = styled(StatusVisual)`
  margin-bottom: ${3 * GU}px;
`;

const StyledH2 = styled.h2`
  ${textStyle("title4")}
  height:${6 * GU}px;
  line-height: 1.2;
  text-align: center;
  margin-bottom: ${1 * GU}px;
`;

const StyledP = styled.p`
  width: 100%;
  position: relative;
  text-align: center;
  color: ${({ theme }) => theme.contentSecondary};
  line-height: 1.2;
`;

const AnimatedSpanStyled = styled(AnimatedSpan)<{ color: string }>`
  display: flex;
  justify-content: center;
  left: 0;
  top: 0;
  width: 100%;
  color: ${({ color }) => color};
`;

const TransitionContainer = styled.div`
  margin-top: ${1.5 * GU}px;
  position: relative;
  width: 100%;
`;

const TransitionAnimatedSpanStyled = styled(AnimatedSpan)`
  display: flex;
  justify-content: center;
  width: 100%;
`;

const DividerStyled = styled(Divider)`
  position: absolute;
  top: ${6 * GU}px;
  right: 0;

  transform: translateX(50%);
`;
