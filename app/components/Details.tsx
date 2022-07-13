import {
  ButtonBase,
  GU,
  IconRight,
  textStyle,
  useTheme,
} from "@blossom-labs/rosette-ui";
import { a, useSpring } from "@react-spring/web";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import styled from "styled-components";

type DetailsProps = {
  children: ReactNode;
  actionLabel?: string;
  label: ReactNode;
  onAction?(payload: any): void;
};

export const Details = ({
  children,
  actionLabel,
  label,
  onAction,
}: DetailsProps) => {
  const theme = useTheme();
  const contentRef = useRef<HTMLDivElement | null>(null);
  const contentHeight = useRef(0);
  const animate = useRef(false);
  const [opened, setOpened] = useState(false);
  const { openProgress } = useSpring({
    from: { openProgress: 0 },
    to: { openProgress: Number(opened) },
    immediate: !animate,
  });

  const handleToggle = () => {
    setOpened((prevOpened) => !prevOpened);
  };

  const updateHeight = () => {
    if (contentRef.current) {
      contentHeight.current = contentRef.current.clientHeight;
    }
  };

  const handleContentRef = (element: HTMLDivElement) => {
    contentRef.current = element;
    updateHeight();
  };

  // Update the height
  useEffect(updateHeight, [opened, updateHeight]);

  // Animate after the initial render
  useEffect(() => {
    animate.current = true;
  }, []);

  return (
    <Container>
      <a.div
        style={{
          borderRadius: 10,
          backgroundColor: openProgress.to((v) => theme.helpContent.alpha(v)),
        }}
      >
        {onAction && (
          <ActionButtonWrapper onClick={onAction}>
            {actionLabel ?? "Run action"}
          </ActionButtonWrapper>
        )}
        <EntryButton onClick={handleToggle}>
          <InnerWrapper>
            <div>
              <a.div
                style={{
                  transform: openProgress.to((v) => `rotate(${v * 90}deg)`),
                  transformOrigin: "50% calc(50% - 0.5px)",
                  marginRight: 0.5 * GU,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <IconRight size="tiny" />
                </div>
              </a.div>
            </div>
            <div style={{ marginTop: 2 }}>{label}</div>
          </InnerWrapper>
        </EntryButton>
        <div
          style={{
            overflow: "hidden",
          }}
        >
          <AnimatedContainer
            style={{
              opacity: openProgress,
              borderBottomLeftRadius: 10,
              borderBottomRightRadius: 10,
              backgroundColor: openProgress.to((v) =>
                theme.helpContent.alpha(v)
              ),
              height: openProgress.to((v) => `${v * contentHeight.current}px`),
            }}
          >
            <div
              ref={handleContentRef}
              style={{ padding: 5, margin: "0 15px" }}
            >
              {children}
            </div>
          </AnimatedContainer>
        </div>
      </a.div>
    </Container>
  );
};

const Container = styled.section`
  cursor: pointer;
  position: relative;
  margin: 0;
`;

const EntryButton = styled.div`
  position: relative;
  width: 100%;
`;

const InnerWrapper = styled.h1`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  height: ${5 * GU}px;
  margin-left: ${0.5 * GU}px;
  color: ${({ theme }) => theme.surfaceContent};
  font-weight: bold;
  ${textStyle("body2")};
`;

const ActionButtonWrapper = styled(ButtonBase)`
  position: absolute;
  top: 10px;
  right: 10px;
  color: ${({ theme }) => theme.link};
  z-index: 2;
  ${textStyle("body2")};
`;

const AnimatedContainer = styled(a.div)`
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
`;
