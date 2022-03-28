import { GU } from "@1hive/1hive-ui";
import styled from "styled-components";
import { PaginationItem } from "./PaginationItem";
import { PaginationSeparator } from "./PaginationSeparator";

function paginationItems(
  pages: number,
  selected: number,
  visibleItemsLength: number
): number[] {
  const all = [...Array(pages)].map((_, i) => i);
  /**
   * When having odd lengths use the previous odd length number to get
   * an even distribution amount of visible items on both sides of the
   * selected number.
   */
  const normalizedLength =
    visibleItemsLength % 2 === 0 ? visibleItemsLength : visibleItemsLength - 1;

  if (all.length <= normalizedLength) {
    return all;
  }

  const first = 0;
  const last = all.length - 1;
  const amountBySide = Math.floor(normalizedLength / 2);
  const itemsToLast = last - selected;
  const prevSize =
    Math.min(amountBySide, Math.max(0, selected - first)) +
    /**
     * Add the missing items on one side to the other to keep
     * the visible items length at all times.
     */
    (itemsToLast < amountBySide ? amountBySide - itemsToLast : 0);
  const nextSize = normalizedLength - prevSize;

  const lowerPrevBound = Math.min(all.length, Math.max(0, selected - prevSize));
  const upperNextBound = Math.min(all.length, Math.max(0, selected + nextSize));

  const items = [];

  items.push(...all.slice(lowerPrevBound, upperNextBound + 1));

  // Ellipsises
  if (lowerPrevBound > first + 1) {
    items.unshift(-1);
  }
  if (upperNextBound < last - 1) {
    items.push(-1);
  }

  // Always display the first & last items
  if (lowerPrevBound >= first + 1) {
    items.unshift(all[0]);
  }
  if (upperNextBound <= last - 1) {
    items.push(all[all.length - 1]);
  }

  return items;
}

type PaginationProps = {
  direction?: "horizontal" | "vertical";
  pages: number;
  visibleItems?: number;
  selected: number;
  touchMode?: boolean;
  onChange(index: number): void;
};

export const Pagination = ({
  direction = "horizontal",
  pages,
  visibleItems = 9,
  selected,
  touchMode = false,
  onChange,
}: PaginationProps) => {
  const items = paginationItems(pages, selected, visibleItems);
  const isHorizontal = direction === "horizontal";

  return (
    <Container isHorizontal={isHorizontal} touchMode={touchMode}>
      {items.map((pageIndex, i) =>
        pageIndex === -1 ? (
          <PaginationSeparator
            isHorizontal={isHorizontal}
            key={`separator-${i}`}
          />
        ) : (
          <PaginationItem
            key={pageIndex}
            direction={direction}
            index={pageIndex}
            selected={selected === pageIndex}
            onChange={onChange}
            touchMode={touchMode}
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
