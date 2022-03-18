import { useTheme } from "@1hive/1hive-ui";
import { ReactNode } from "react";
import { ThemeProvider } from "styled-components";
import { AppLayout } from "./components/AppLayout";
import { AppReady } from "./providers/AppReady";
import Wagmi from "./providers/Wagmi";

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
