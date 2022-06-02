import React, { useCallback, useState } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { Spring, Transition, animated } from "@react-spring/web";
import {
  ButtonIcon,
  GU,
  IconCross,
  Modal,
  RADIUS,
  Root,
  textStyle,
  useLayout,
  useTheme,
  Viewport,
} from "@blossom-labs/rosette-ui";
import { useInside } from "use-inside";
import { useDisableAnimation } from "~/hooks/useDisableAnimation";
import { springs } from "~/springs";
import { MultiModalProvider, useMultiModal } from "./MultiModalProvider";

const DEFAULT_MODAL_WIDTH = 80 * GU;
const AnimatedDiv = animated.div;

type MultiModalScreensType = {
  screens: Array<any>;
};

type MultiModalDataType = {
  visible: boolean;
  onClose: () => void;
  handleOnClosed: () => void;
};

function MultiModalScreens({ screens }: MultiModalScreensType) {
  const [, { onClose, handleOnClosed, visible }] = useInside("MultiModal") as [
    boolean,
    MultiModalDataType
  ];

  return (
    <MultiModalProvider screens={screens} onClose={onClose}>
      <MultiModalFrame visible={visible} onClosed={handleOnClosed} />
    </MultiModalProvider>
  );
}

MultiModalScreens.propTypes = {
  screens: PropTypes.arrayOf(
    PropTypes.shape({
      content: PropTypes.node,
      disableClose: PropTypes.bool,
      graphicHeader: PropTypes.bool,
      title: PropTypes.string,
      width: PropTypes.number,
    })
  ).isRequired,
};

type MultiModalFrameType = {
  visible: boolean;
  onClosed: () => void;
};

/* eslint-disable react/prop-types */
function MultiModalFrame({ visible, onClosed }: MultiModalFrameType) {
  const theme = useTheme();
  const { currentScreen, close } = useMultiModal();

  const {
    disableClose,
    width: currentScreenWidth,
    graphicHeader,
  } = currentScreen;

  const modalWidth = currentScreenWidth || DEFAULT_MODAL_WIDTH;

  const handleModalClose = useCallback(() => {
    if (!disableClose) {
      close();
    }
  }, [disableClose, close]);

  return (
    <Viewport>
      {({ width }: { width: number }) => {
        // Apply a small gutter when matching the viewport width
        const viewportWidth = width - 4 * GU;

        return (
          <Spring
            config={springs.tight}
            to={{ width: Math.min(viewportWidth, modalWidth) }}
          >
            {({ width }) => {
              return (
                <Modal
                  padding={0}
                  width={width}
                  onClose={handleModalClose}
                  onClosed={onClosed}
                  visible={visible}
                  closeButton={false}
                  css={`
                    z-index: 2;

                    /* TODO: Add radius option to Modal in @rosette/ui */
                    & > div > div > div {
                      border-radius: ${2 * RADIUS}px !important;
                    }
                  `}
                >
                  <div style={{ position: "relative" }}>
                    {!disableClose && (
                      <ButtonIcon
                        label=""
                        css={`
                          position: absolute;
                          top: ${2.5 * GU}px;
                          right: ${2.5 * GU}px;
                          z-index: 2;
                        `}
                        onClick={handleModalClose}
                      >
                        <IconCross
                          color={
                            graphicHeader
                              ? theme.overlay
                              : theme.surfaceContentSecondary
                          }
                        />
                      </ButtonIcon>
                    )}

                    <MultiModalContent viewportWidth={viewportWidth} />
                  </div>
                </Modal>
              );
            }}
          </Spring>
        );
      }}
    </Viewport>
  );
}

// We memoize this compontent to avoid excessive re-renders when animating
const MultiModalContent = React.memo(function ModalContent({
  viewportWidth,
}: {
  viewportWidth: number;
}) {
  const theme = useTheme();
  const { step, direction, getScreen } = useMultiModal();
  const [applyStaticHeight, setApplyStaticHeight] = useState(false);
  const [height, setHeight] = useState(0);
  const [animationDisabled, enableAnimation] = useDisableAnimation();
  const { layoutName } = useLayout();

  const smallMode = layoutName === "small";

  const onStart = useCallback(() => {
    enableAnimation();

    if (!animationDisabled) {
      setApplyStaticHeight(true);
    }
  }, [animationDisabled, enableAnimation]);

  const renderScreen = useCallback(
    (screen) => {
      const { title, content, graphicHeader, width } = screen;
      const standardPadding = smallMode ? 3 * GU : 5 * GU;

      return (
        <>
          {graphicHeader ? (
            <HeaderContainer
              smallMode={smallMode}
              standardPadding={standardPadding}
            >
              <StyledH1 smallMode={smallMode}>{title}</StyledH1>
            </HeaderContainer>
          ) : (
            title && (
              <TitleContainer
                smallMode={smallMode}
                standardPadding={standardPadding}
              >
                <StyledTitleH1 smallMode={smallMode}>{title}</StyledTitleH1>
              </TitleContainer>
            )
          )}

          <Root.Provider>
            <StyledContent
              title={title}
              standardPadding={standardPadding}
              width={Math.min(viewportWidth, width || DEFAULT_MODAL_WIDTH)}
            >
              {content}
            </StyledContent>
          </Root.Provider>
        </>
      );
    },
    [smallMode, theme, viewportWidth]
  );

  return (
    <Spring
      config={springs.tight}
      to={{ height }}
      immediate={animationDisabled}
    >
      {({ height }) => (
        <AnimatedDiv
          style={{
            position: "relative",
            height: applyStaticHeight ? height : "auto",
          }}
        >
          <Transition
            config={(_, state) =>
              // TransitionPhase LEAVE
              state === 3 ? springs.instant : springs.tight
            }
            items={step}
            immediate={animationDisabled}
            from={{
              opacity: 0,
              transform: `translate3d(0, ${5 * GU * direction}px, 0)`,
            }}
            enter={{
              opacity: 1,
              transform: "translate3d(0, 0, 0)",
            }}
            leave={{
              position: "absolute",
              top: 0,
              left: 0,
              opacity: 0,
              transform: `translate3d(0, ${5 * GU * -direction}px, 0)`,
            }}
            onRest={(_: any, status: any) => {
              if (status === "update") {
                setApplyStaticHeight(false);
              }
            }}
            onStart={onStart}
          >
            {(step) => (animProps: any) => {
              const stepScreen = getScreen(step);

              return (
                <>
                  {stepScreen && (
                    <AnimatedDiv
                      ref={(elt) => {
                        if (elt) {
                          setHeight(elt.clientHeight);
                        }
                      }}
                      style={{
                        width: "100%",
                        ...animProps,
                      }}
                    >
                      {renderScreen(stepScreen)}
                    </AnimatedDiv>
                  )}
                </>
              );
            }}
          </Transition>
        </AnimatedDiv>
      )}
    </Spring>
  );
});
/* eslint-enable react/prop-types */

export default MultiModalScreens;

const HeaderContainer = styled.div<{
  standardPadding: number;
  smallMode: boolean;
}>`
  position: relative;
  overflow: hidden;
  ${({ standardPadding }) =>
    `padding: ${1.5 * GU}px ${standardPadding}px ${
      1.5 * GU
    }px ${standardPadding}px;`}
  margin-bottom: ${({ smallMode }) => (smallMode ? 3 * GU : 5 * GU)}px;
`;

const StyledH1 = styled.h1<{
  smallMode: boolean;
}>`
  position: relative;
  z-index: 1;
  ${({ smallMode }) => (smallMode ? textStyle("title3") : textStyle("title2"))};
  font-weight: 600;
  color: ${({ theme }) => theme.overlay};
`;

const TitleContainer = styled.div<{
  standardPadding: number;
  smallMode: boolean;
}>`
  padding: ${({ smallMode, standardPadding }) =>
    `smallMode ? 3 * GU : 5 * GU}px
    ${standardPadding}px ${smallMode ? 1.5 * GU : 2.5 * GU}px
    ${standardPadding}px;`};
`;

const StyledTitleH1 = styled.h1<{
  smallMode: boolean;
}>`
  ${({ smallMode }) => (smallMode ? textStyle("title3") : textStyle("title2"))};
  margin-top: -${0.5 * GU}px;
`;

const StyledContent = styled.div<{
  title: any;
  width: number;
  standardPadding: number;
}>`
  /* For better performance we avoid reflowing long text between screen changes by matching the screen width with the modal width */
  width: ${({ width }) => `${width}px;`}
    ${({ title, standardPadding }) => `padding: ${
      title ? 0 : standardPadding
    }px ${standardPadding}px
    ${standardPadding}px ${standardPadding}px;`};
`;
