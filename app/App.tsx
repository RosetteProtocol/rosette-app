import { useTheme } from "@1hive/1hive-ui";
import { ThemeProvider } from "styled-components";
import type { ReactNode } from "react";

import { AppReady } from "~/providers/AppReady";
import Wagmi from "~/providers/Wagmi";
import { AppLayout } from "~/components/AppLayout";

export const App = ({ children }: { children: ReactNode }) => {
  const theme = useTheme();

  return (
    <ThemeProvider theme={theme}>
      <Wagmi>
        <AppReady>
          <AppLayout>{children}</AppLayout>
        </AppReady>
      </Wagmi>
    </ThemeProvider>
  );
};
