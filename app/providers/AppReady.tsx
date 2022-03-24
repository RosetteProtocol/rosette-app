import { springs } from "@1hive/1hive-ui";
import styled from "styled-components";
import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { a, TransitionFn, useTransition } from "react-spring";

import { BlossomLabsLogo } from "~/components/BlossomLabsLogo";

export type AppReadyTransition = TransitionFn<
  boolean,
  {
    progress: number;
    topBarTransform: string;
    bottomBarTransform: string;
    screenTransform: string;
  }
>;

type AppReadyContextProps = {
  appReady: boolean;
  appReadyTransition: AppReadyTransition;
};

const AppReadyContext = createContext<AppReadyContextProps>(
  {} as AppReadyContextProps
);

type AppReadyProps = { children: ReactNode };

export function AppReady({ children }: AppReadyProps) {
  const [ready, setReady] = useState(false);

  const appReadyTransition = useTransition(ready, {
    config: springs.lazy,
    from: {
      progress: 0,
      topBarTransform: "translate3d(0, -100%, 0)",
      bottomBarTransform: "translate3d(0, 100%, 0)",
      screenTransform: "scale3d(0.9, 0.9, 1)",
    },
    enter: {
      progress: 1,
      topBarTransform: "translate3d(0, 0, 0)",
      bottomBarTransform: "translate3d(0, 0, 0)",
      screenTransform: "scale3d(1, 1, 1)",
    },
    leave: {
      progress: 0,
      topBarTransform: "translate3d(0, -100%, 0)",
      bottomBarTransform: "translate3d(0, 100%, 0)",
      screenTransform: "scale3d(0.9, 0.9, 1)",
    },
  });

  const splashTransition = useTransition(!ready, {
    config: springs.swift,
    from: {
      opacity: 1,
      logoTransform: " rotate3d(0, 0, 1, 0deg)",
    },
    enter: {
      opacity: 1,
      logoTransform: "rotate3d(0, 0, 1, 360deg)",
    },
    leave: {
      opacity: 0,
      // logoTransform: "rotate3d(0, 0, 1, 360deg)",
    },
  });

  useEffect(() => {
    const id = setTimeout(() => setReady(true), 400);
    return () => clearTimeout(id);
  }, []);

  return (
    <AppReadyContext.Provider value={{ appReady: ready, appReadyTransition }}>
      {splashTransition(
        ({ opacity, logoTransform }, loading) =>
          loading && (
            <AnimatedSplashContainer
              style={{ opacity, transform: logoTransform }}
            >
              <a.div
                style={{
                  height: "48px",
                }}
              >
                <BlossomLabsLogo iconSize="40px" showIconOnly />
              </a.div>
            </AnimatedSplashContainer>
          )
      )}
      {children}
    </AppReadyContext.Provider>
  );
}

export function useAppReady() {
  return useContext(AppReadyContext);
}

const AnimatedSplashContainer = styled(a.div)`
  position: fixed;
  transition-duration: 500ms;
  z-index: 9;
  inset: 0;
  display: grid;
  place-items: center;
`;
