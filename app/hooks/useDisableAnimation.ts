import { useCallback, useState } from "react";

type DisableAnimation = [
  animationDisabled: boolean,
  enableAnimation: () => void
];

// Simple hook for performing Spring animations immediately
export function useDisableAnimation(): DisableAnimation {
  const [animationDisabled, setAnimationDisabled] = useState(true);

  const enableAnimation = useCallback(() => {
    if (animationDisabled) {
      setAnimationDisabled(false);
    }
  }, [animationDisabled]);

  return [animationDisabled, enableAnimation];
}
