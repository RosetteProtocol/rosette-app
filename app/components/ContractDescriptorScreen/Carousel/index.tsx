import { GU, useViewport } from "@1hive/1hive-ui";
import type { ReactNode } from "react";
import { useCallback, useEffect, useState, useRef } from "react";
import { a, useSpring } from "react-spring";
import styled from "styled-components";
import { PrevNext } from "./PrevNext";

type CarouselProps = {
  items: ReactNode[];
  selected: number;
  compactMode?: boolean;
  direction?: "horizontal" | "vertical";
  itemSpacing?: number;
  customSideSpace?: number;
  showPrevNext?: boolean;
  onItemSelected?(selected: number): void;
};

const DEFAULT_SIZE = { width: 0, height: 0 };

export const Carousel = ({
  items,
  selected = 0,
  compactMode = false,
  direction = "vertical",
  itemSpacing = 3 * GU,
  customSideSpace,
  showPrevNext = false,
  onItemSelected = () => {},
}: CarouselProps) => {
  const [containerSize, setContainerSize] = useState({ ...DEFAULT_SIZE });
  const container = useRef(null);
  const { width: vw } = useViewport();
  const isHorizontal = direction === "horizontal";
  const itemSize = containerSize[isHorizontal ? "width" : "height"];
  // The space on one side of the visible items
  const sideSpace =
    customSideSpace && customSideSpace >= 0 ? customSideSpace : 0;

  // const allowDrag = compactMode || (items && items.length > visibleItems);

  useEffect(() => {
    onItemSelected(selected);
  }, [onItemSelected, selected]);

  const updateContainerSize = useCallback((element) => {
    setContainerSize(
      element
        ? { width: element.clientWidth, height: element.clientHeight }
        : { ...DEFAULT_SIZE }
    );
  }, []);

  useEffect(() => {
    if (container.current) {
      updateContainerSize(container.current);
    }
  }, [vw, updateContainerSize]);

  const handleContainerRef = useCallback(
    (element) => {
      container.current = element;
      updateContainerSize(element);
    },
    [updateContainerSize]
  );

  // Get the container x position from an item index
  const xFromItem = useCallback(
    (index) => {
      return sideSpace - (itemSize + itemSpacing) * index;
    },
    [sideSpace, itemSize, itemSpacing]
  );

  // The current x position, before the drag
  const selectedX = xFromItem(selected);

  // The x position of the last item, before the drag
  // const lastX = xFromItem(items.length - 1);

  // Handles the actual x position, with the drag
  const [{ x, drag }, setX] = useSpring(() => ({
    x: selectedX,
    drag: Number(false),
    immediate: true,
  }));

  // TODO: Implement dragging feature for mobile screens
  // Update the transition during drag
  // const bindDrag = useDrag(({ down, delta }) => {
  //   const updatedX = Math.max(lastX, Math.min(sideSpace, selectedX + delta[0]));

  //   if (!allowDrag) {
  //     return;
  //   }

  //   if (down) {
  //     setX({
  //       x: updatedX,
  //       immediate: true,
  //     });
  //   } else {
  //     let target = selected;
  //     if (Math.abs(delta[0]) > itemWidth / 2) {
  //       const sP = delta[0] > 0 ? -sideSpace : sideSpace;
  //       const deltaSelected = Math.abs(
  //         Math.round((delta[0] + sP) / (itemWidth + itemSpacing))
  //       );
  //       // Moving to the left
  //       if (delta[0] > 0) {
  //         target = Math.max(0, selected - deltaSelected);
  //         // Move to the right
  //       } else {
  //         target = Math.min(
  //           items.length - visibleItems,
  //           selected + deltaSelected
  //         );
  //       }
  //     }

  //     setX({
  //       x: xFromItem(target),
  //       immediate: false,
  //     });
  //     setSelected(target);
  //   }
  // });

  // Update the transition when the base x position updates
  useEffect(() => {
    setX({
      x: selectedX,
      immediate: false,
    });
  }, [selectedX, setX]);

  return (
    <Container ref={handleContainerRef} isHorizontal={isHorizontal}>
      {showPrevNext && (
        <>
          {selected > 0 && (
            <PrevNext
              type="previous"
              onClick={() => onItemSelected(Math.max(0, selected - 1))}
              isHorizontal={isHorizontal}
            />
          )}
          {selected < items.length - 1 && (
            <PrevNext
              type="next"
              onClick={() =>
                onItemSelected(Math.min(items.length - 1, selected + 1))
              }
              isHorizontal={isHorizontal}
            />
          )}
        </>
      )}

      <AnimatedContainer
        // {...bindDrag()}
        /**
         * Use transient props as for some reason setting camel case
         * props on styled animated components triggers a react warning
         */
        $isHorizontal={isHorizontal}
        style={{
          transform: x.to(
            (x) =>
              `translate3d(${
                isHorizontal ? `${x || 0}px, 0, 0` : `0, ${x || 0}px, 0`
              })`
          ),
        }}
      >
        {items.map((item, i) => (
          <AnimatedItemContainer
            key={i}
            style={{
              opacity: drag.to((drag) => {
                return drag || (i >= selected && i < selected + 1) ? 1 : 0.15;
              }),
            }}
            $isFirst={i === 0}
            $isHorizontal={isHorizontal}
            $itemHeight={containerSize.height}
            $itemWidth={containerSize.width}
            $itemSpacing={itemSpacing}
          >
            {item}
          </AnimatedItemContainer>
        ))}
      </AnimatedContainer>
    </Container>
  );
};

const Container = styled.div<{
  isHorizontal: boolean;
}>`
  position: relative;
  overflow: hidden;
  touch-action: none;
  height: 100%;
  width: 100%;
`;

const AnimatedContainer = styled(a.div)<{ $isHorizontal: boolean }>`
  position: absolute;
  display: flex;
  width: 100%;
  box-sizing: border-box;

  align-items: center;
  touch-action: none;
  ${(props) =>
    props.$isHorizontal
      ? `
        flex-direction: row;
        justify-content: flex-start;
        height: 100%;
      `
      : `
        flex-direction: column;
        justify-content: center;
      `};
`;

const AnimatedItemContainer = styled(a.div)<{
  $isHorizontal: boolean;
  $isFirst: boolean;
  $itemWidth: number;
  $itemHeight: number;
  $itemSpacing: number;
}>`
  width: ${(props) => props.$itemWidth}px;
  height: ${(props) => props.$itemHeight}px;
  transition: opacity 150ms ease-in-out;
  flex-grow: 0;
  flex-shrink: 0;
  ${(props) => (props.$isHorizontal ? "margin-left" : "margin-top")}: ${({
  $isFirst,
  $itemSpacing: itemSpacing,
}) => (!$isFirst ? `${itemSpacing}px` : 0)}};
`;
