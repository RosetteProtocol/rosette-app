import styled from "styled-components";
import { AppScreen } from "~/components/AppLayout/AppScreen";

export default function Index() {
  return (
    <AppScreen>
      <MainContainer></MainContainer>
    </AppScreen>
  );
}

const MainContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
`;
