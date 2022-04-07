import { GU } from "@1hive/1hive-ui";
import styled from "styled-components";
import { PaginationItem } from "./PaginationItem";
import { PaginationSeparator } from "./PaginationSeparator";

function paginationItems(
  pages: number,
  selected: number,
  inbetweenRange: number
): number[] {
  // visibleItems + first and final item + ellipses
  const totalVisibleItems = inbetweenRange + 2 + 2;
  const all = [...Array(pages)].map((_, i) => i);
  /**
   * When having odd lengths use the previous number to get
   * an even distribution amount of visible items on both sides of the
   * selected number.
   */
  const normalizedLength =
    inbetweenRange % 2 === 0 ? inbetweenRange : inbetweenRange - 1;

  if (all.length <= totalVisibleItems) {
    return all;
  }

  const first = 0;
  const last = all.length - 1;
  const amountBySide = Math.floor(inbetweenRange / 2);
  const itemsToLast = last - selected;
  const prevSize =
    Math.min(amountBySide, Math.max(0, selected - first)) +
    /**
     * Add the missing items on one side or the other to keep
     * the visible items length at all times.
     */
    (itemsToLast < amountBySide ? amountBySide - itemsToLast : 0);
  const nextSize = normalizedLength - prevSize;

  let lowerPrevBound = Math.min(all.length, selected - prevSize);
  let upperNextBound = Math.min(all.length, selected + nextSize);

  const items = [];

  items.push(...all.slice(lowerPrevBound, upperNextBound + 1));

  // Add ellipses
  let leftEllipsisAdded = false,
    rightEllipsisAdded = false;

  if (lowerPrevBound > first + 1) {
    items.unshift(-1);
    leftEllipsisAdded = true;
  }
  if (upperNextBound < last - 1) {
    items.push(-1);
    rightEllipsisAdded = true;
  }

  // Always display the first & last items
  if (lowerPrevBound >= first + 1) {
    items.unshift(all[0]);
  }
  if (upperNextBound <= last - 1) {
    items.push(all[all.length - 1]);
  }

  const missingItems = totalVisibleItems - items.length;

  /**
   * To keep a constant pagination size we always add enough items
   * to reach the total total amount of visible items.
   * We add them on the left or right side of the selected item based on
   * where we put the ellipsis.
   */
  if (missingItems > 0 && !(leftEllipsisAdded && rightEllipsisAdded)) {
    if (leftEllipsisAdded) {
      items.splice(
        2,
        0,
        ...all.slice(lowerPrevBound - missingItems, lowerPrevBound)
      );
    } else {
      items.splice(
        items.length - 2,
        0,
        ...all.slice(upperNextBound + 1, upperNextBound + missingItems + 1)
      );
    }
  }

  return items;
}

type PaginationProps = {
  direction?: "horizontal" | "vertical";
  pages: number;
  // Length of elements between ellipses.
  inbetweenRange?: number;
  selected: number;
  size: number;
  touchMode?: boolean;
  onChange(index: number): void;
};

export const Pagination = ({
  direction = "horizontal",
  pages,
  inbetweenRange = 9,
  selected,
  size,
  touchMode = false,
  onChange,
}: PaginationProps) => {
  const items = paginationItems(pages, selected, inbetweenRange);
  const isHorizontal = direction === "horizontal";

  return (
    <Container isHorizontal={isHorizontal} touchMode={touchMode}>
      {items.map((pageIndex, i) =>
        pageIndex === -1 ? (
          <PaginationSeparator
            isHorizontal={isHorizontal}
            key={`separator-${i}`}
            size={size}
          />
        ) : (
          <PaginationItem
            key={pageIndex}
            direction={direction}
            index={pageIndex}
            selected={selected === pageIndex}
            onChange={onChange}
            touchMode={touchMode}
            size={size}
          />
        )
      )}
    </Container>
  );
};

const Container = styled.div<{ isHorizontal: boolean; touchMode: boolean }>`
  display: flex;
  flex-direction: ${({ isHorizontal }) => (isHorizontal ? "row" : "column")};
  gap: ${({ touchMode }) => (touchMode ? 0 : `${2 * GU}px`)};
`;
