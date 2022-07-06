import { RADIUS, useViewport, GU, useTheme } from "@blossom-labs/rosette-ui";
import type { Theme } from "@uniswap/widgets";
import { SwapWidget } from "@uniswap/widgets";
import styled from "styled-components";
import { useSigner } from "wagmi";
import { AppScreen } from "~/components/AppLayout/AppScreen";
import { SmoothDisplayContainer } from "~/components/SmoothDisplayContainer";

export default function EntriesRoute() {
  const { below } = useViewport();
  const theme = useTheme();
  const [{ data }] = useSigner();

  const uniswapTheme: Theme = {
    primary: `${theme.content}`,
    secondary: `${theme.contentSecondary}`,
    interactive: `${theme.border}`,
    container: `${theme.surface.alpha(0.5)}`,
    module: `${theme.floatingContent}`,
    accent: `${theme.accent}`,
    outline: `${theme.borderDark}`,
    dialog: `${theme.surface}`,
    fontFamily: "rosette-ui",
    borderRadius: RADIUS,
    active: `${theme.selected}`,
    error: `${theme.negative}`,
    success: `${theme.positive}`,
    warning: `${theme.warning}`,
  };

  return (
    <AppScreen hideBottomBar>
      <SmoothDisplayContainer>
        <Container compactMode={below("medium")}>
          <SwapWidget
            provider={data?.provider as any}
            jsonRpcEndpoint={window.ENV.RPC_URL}
            theme={uniswapTheme}
          />
        </Container>
      </SmoothDisplayContainer>
    </AppScreen>
  );
}

const Container = styled.div<{ compactMode: boolean }>`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: ${({ compactMode }) => (compactMode ? 7 * GU : 23 * GU)}px;
  width: 100%;
  height: 100%;
`;
