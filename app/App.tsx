import { useTheme } from "@blossom-labs/rosette-ui";
import { ThemeProvider } from "styled-components";
import { useState } from "react";

import { AppReady } from "~/providers/AppReady";
import Wagmi from "~/providers/Wagmi";
import { AppLayout } from "~/components/AppLayout";
import { Outlet } from "@remix-run/react";
import { RosetteStone } from "./providers/RosetteStone";
import { FnEntriesFilters } from "./providers/FnEntriesFilters";

export type AppContext = {
  displayTopBar(display: boolean): void;
  displayBottomBar(display: boolean): void;
};

export const App = () => {
  const theme = useTheme();

  const [displayTopBar, setDisplayTopBar] = useState(true);
  const [displayBottomBar, setDisplayBottomBar] = useState(true);

  return (
    <ThemeProvider theme={theme}>
      <Wagmi>
        <RosetteStone>
          <AppReady>
            <FnEntriesFilters>
              <AppLayout
                displayTopBar={displayTopBar}
                displayBottomBar={displayBottomBar}
              >
                <Outlet
                  context={{
                    displayTopBar: setDisplayTopBar,
                    displayBottomBar: setDisplayBottomBar,
                  }}
                />
              </AppLayout>
            </FnEntriesFilters>
          </AppReady>
        </RosetteStone>
      </Wagmi>
    </ThemeProvider>
  );
};
