import { createRef, useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import { Carousel } from "./Carousel";
import { FunctionDescriptor } from "./FunctionDescriptor";
import {
  actions,
  useContractDescriptorStore,
} from "./use-contract-descriptor-store";
import { canTab, getSelectionRange } from "~/utils/client/selection.client";

type FnDescriptorsCarouselProps = {
  compactMode: boolean;
};

export const FnDescriptorsCarousel = ({
  compactMode,
}: FnDescriptorsCarouselProps) => {
  const {
    fnDescriptorEntries,
    fnSelected,
    lastCaretPos,
    userFnDescriptions,
    readyToFocus,
  } = useContractDescriptorStore();
  const descriptorRefs = useRef<RefObject<HTMLTextAreaElement>[]>([]);
  const prevDescriptorIndexRef = useRef(-1);
  const currentDescriptorIndexRef = useRef(0);
  const [carouselMoveAnimationEnded, setCarouselMoveEnded] = useState(false);

  /**
   * Generate descriptor refs
   */
  useEffect(() => {
    descriptorRefs.current = fnDescriptorEntries.map(
      (_, i) => descriptorRefs.current[i] ?? createRef<HTMLTextAreaElement>()
    );

    // Wait a little bit for the ref to be attached before focusing first element
    setTimeout(() => descriptorRefs.current[0].current?.focus(), 200);
  }, [fnDescriptorEntries]);

  /**
   * Focus on current element once the transition animation ended.
   */
  useEffect(() => {
    if (
      carouselMoveAnimationEnded &&
      descriptorRefs.current[fnSelected]?.current
    ) {
      descriptorRefs.current[fnSelected]?.current?.focus();
      setCarouselMoveEnded(false);
    }
  }, [carouselMoveAnimationEnded, fnSelected]);

  /**
   * Lost focus on last element when a new one was selected to not mess up
   * the transition animation if user type in.
   */
  useEffect(() => {
    if (prevDescriptorIndexRef.current === -1) {
      prevDescriptorIndexRef.current = fnSelected;
    } else {
      prevDescriptorIndexRef.current = currentDescriptorIndexRef.current;

      descriptorRefs.current[prevDescriptorIndexRef.current]?.current?.blur();
    }

    currentDescriptorIndexRef.current = fnSelected;
  }, [fnSelected]);

  /**
   * Focus on current element when function was selected and set
   * selection on first paramenter.
   */
  useEffect(() => {
    if (!readyToFocus || !descriptorRefs.current[fnSelected]?.current) {
      return;
    }

    const selectedDescriptor = descriptorRefs.current[fnSelected].current!;

    selectedDescriptor.focus();

    const [start, end] = getSelectionRange(
      selectedDescriptor.value,
      lastCaretPos
    );

    selectedDescriptor.setSelectionRange(start, end);
  }, [lastCaretPos, readyToFocus, fnSelected]);

  return (
    <Carousel
      selected={fnSelected}
      items={fnDescriptorEntries.map((f, i) => (
        <FunctionDescriptor
          ref={descriptorRefs.current[i]}
          key={f.sigHash}
          description={userFnDescriptions[f.sigHash]?.description}
          fnDescriptorEntry={f}
          onEntryChange={actions.upsertFnDescription}
          onKeyDown={(e) => {
            const text = userFnDescriptions[f.sigHash]?.description;
            const offset = e.target.selectionStart;

            if (e.code === "Tab" && text && canTab(text, offset)) {
              e.preventDefault();
              const [start, end] = getSelectionRange(text, offset);

              descriptorRefs.current[i].current?.setSelectionRange(start, end);
            }
          }}
        />
      ))}
      direction={compactMode ? "horizontal" : "vertical"}
      itemSpacing={450}
      onTransitionEnd={() => setCarouselMoveEnded(true)}
    />
  );
};
