/* eslint-disable react/display-name */
import React, { useCallback, useEffect, useReducer, useState } from "react";
import PropTypes from "prop-types";
import { Transition, animated } from "@react-spring/web";
import { GU, Info, noop, springs, useTheme } from "@blossom-labs/rosette-ui";
import { useMultiModal } from "../MultiModal/MultiModalProvider";
import Step from "./Step/Step";
import { TRANSACTION_SIGNING_DESC } from "./stepper-descriptions";
import { IndividualStepTypes } from "./stepper-statuses";
import useStepperLayout from "./useStepperLayout";
import { useDisableAnimation } from "~/hooks/useDisableAnimation";
import { useMounted } from "~/hooks/useMounted";

const AnimatedDiv = animated.div;

const INITIAL_STATUS = IndividualStepTypes.Prompting;

const DEFAULT_DESCRIPTIONS = TRANSACTION_SIGNING_DESC;

function initialStepState(steps: any) {
  return steps.map((_: any, i: any) => {
    return {
      status: i === 0 ? INITIAL_STATUS : IndividualStepTypes.Waiting,
      hash: null,
    };
  });
}

function reduceSteps(
  steps: any,
  [action, stepIndex, value]: [string, number, string]
) {
  if (action === "setHash") {
    steps[stepIndex].hash = value;
    return [...steps];
  }
  if (action === "setStatus") {
    steps[stepIndex].status = value;
    return [...steps];
  }
  return steps;
}

function Stepper({ steps, onComplete, onCompleteActions }: any) {
  const theme = useTheme();
  const mounted = useMounted();
  const { close } = useMultiModal();
  const [animationDisabled, enableAnimation] = useDisableAnimation();
  const [stepperStage, setStepperStage] = useState(0);
  const [stepState, updateStep] = useReducer(
    reduceSteps,
    initialStepState(steps)
  );

  const { outerBoundsRef, innerBoundsRef, layout } = useStepperLayout();

  const stepsCount = steps.length - 1;

  const renderStep = useCallback(
    (stepIndex, showDivider?) => {
      const { title, descriptions: suppliedDescriptions } = steps[stepIndex];
      const { status, hash } = stepState[stepIndex];
      const descriptions = suppliedDescriptions || DEFAULT_DESCRIPTIONS;

      return (
        <li key={stepIndex} style={{ display: "flex" }}>
          <Step
            title={title}
            desc={descriptions[status]}
            number={stepIndex + 1}
            status={status}
            showDivider={showDivider}
            transactionHash={hash}
            withoutFirstStep={steps.length === 1}
          />
        </li>
      );
    },
    [stepState, steps]
  );

  const renderSteps = useCallback(() => {
    return steps.map((_: any, index: any) => {
      const showDivider =
        index < stepsCount &&
        stepState[index].status !== IndividualStepTypes.Waiting;

      return renderStep(index, showDivider);
    });
  }, [renderStep, steps, stepsCount, stepState]);

  const updateStepStatus = useCallback(
    (status) => {
      if (mounted()) {
        updateStep(["setStatus", stepperStage, status]);
      }
    },
    [stepperStage, mounted]
  );

  const updateHash = useCallback(
    (hash) => {
      if (mounted()) {
        updateStep(["setHash", stepperStage, hash]);
      }
    },
    [stepperStage, mounted]
  );

  const handleSign = useCallback(() => {
    const { handleSign } = steps[stepperStage];

    updateStepStatus(INITIAL_STATUS);

    // Pass state updates as render props to handleSign
    handleSign({
      setPrompting: () => updateStepStatus(IndividualStepTypes.Prompting),
      setWorking: () => updateStepStatus(IndividualStepTypes.Working),
      setError: () => {
        updateStepStatus(IndividualStepTypes.Error);
      },
      setSuccess: () => {
        updateStepStatus(IndividualStepTypes.Success);

        // Advance to next step or fire complete callback
        if (mounted()) {
          if (stepperStage === stepsCount) {
            onComplete();
          } else {
            setStepperStage(stepperStage + 1);
          }
        }
      },
      setHash: (hash: string) => updateHash(hash),
    });
  }, [
    mounted,
    onComplete,
    steps,
    stepperStage,
    stepsCount,
    updateStepStatus,
    updateHash,
  ]);

  useEffect(() => {
    if (steps.length > 0) {
      handleSign();
    }
  }, [handleSign, stepperStage, steps.length]);

  const completed =
    stepperStage === stepsCount &&
    stepState[stepperStage].status === IndividualStepTypes.Success;

  useEffect(() => {
    let timeout: any;
    if (completed && !onCompleteActions) {
      timeout = setTimeout(() => close(), 2500);
    }
    return () => {
      clearTimeout(timeout);
    };
  }, [close, completed, onCompleteActions]);

  return (
    <div style={{ marginTop: `${3.25 * GU}px` }}>
      <div
        ref={outerBoundsRef}
        style={{ display: "flex", justifyContent: "center" }}
      >
        <ul
          ref={innerBoundsRef}
          style={{
            padding: 0,
            display: "flex",
            flexDirection: `${layout === "collapsed" ? "column" : "row"}`,
          }}
        >
          {layout === "collapsed" && (
            <>
              {steps.length > 1 && (
                <p
                  style={{
                    textAlign: "center",
                    marginBottom: `${2 * GU}px`,
                    color: `${theme.contentSecondary}`,
                  }}
                >
                  {stepperStage + 1} out of {steps.length} transactions
                </p>
              )}

              <div style={{ position: "relative" }}>
                <Transition
                  config={springs.smooth}
                  delay={300}
                  items={stepperStage}
                  immediate={animationDisabled}
                  onStart={enableAnimation}
                  from={{
                    opacity: 0,
                    transform: `translate3d(${10 * GU}px, 0, 0)`,
                  }}
                  enter={{
                    opacity: 1,
                    transform: "translate3d(0, 0, 0)",
                  }}
                  leave={{
                    opacity: 0,
                    transform: `translate3d(-${20 * GU}px, 0, 0)`,
                  }}
                  native
                >
                  {(currentStage: any) => (animProps: any) =>
                    (
                      <AnimatedDiv
                        style={{
                          position:
                            currentStage === stepperStage
                              ? "static"
                              : "absolute",
                          ...animProps,
                        }}
                      >
                        {renderStep(currentStage)}
                      </AnimatedDiv>
                    )}
                </Transition>
              </div>
            </>
          )}
          {layout === "expanded" && renderSteps()}
        </ul>
      </div>
      {completed && (
        <div>
          <Info
            css={`
              margin-top: ${5 * GU}px;
            `}
          >
            The UI may take a few seconds to update
          </Info>
          {onCompleteActions && (
            <div style={{ marginTop: `${3 * GU}px` }}>{onCompleteActions}</div>
          )}
        </div>
      )}
    </div>
  );
}

Stepper.propTypes = {
  steps: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      handleSign: PropTypes.func.isRequired,
      descriptions: PropTypes.shape({
        [IndividualStepTypes.Waiting]: PropTypes.string,
        [IndividualStepTypes.Prompting]: PropTypes.string,
        [IndividualStepTypes.Working]: PropTypes.string,
        [IndividualStepTypes.Success]: PropTypes.string,
        [IndividualStepTypes.Error]: PropTypes.string,
      }),
    })
  ).isRequired,
  onComplete: PropTypes.func,
  onCompleteActions: PropTypes.node,
};

Stepper.defaultProps = {
  onComplete: noop,
};

export default Stepper;
