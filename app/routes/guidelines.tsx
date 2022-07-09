import { useViewport, GU, textStyle, Button } from "@blossom-labs/rosette-ui";
import styled from "styled-components";

import { AppScreen } from "~/components/AppLayout/AppScreen";
import { SmoothDisplayContainer } from "~/components/SmoothDisplayContainer";

export default function EntriesRoute() {
  const { below } = useViewport();

  return (
    <AppScreen hideBottomBar>
      <SmoothDisplayContainer>
          <Container compactMode={below("medium")}>
        <ContentContainer>
              <Title>Guideline v0 📕</Title>
              <Content>
                Lorem ipsum dolor sit amet consectetur adipiscing elit blandit
                imperdiet, mauris inceptos lacinia at non aliquet nostra etiam duis
                nibh, bibendum facilisi arcu est malesuada convallis nunc mattis.
                aliquam nullam.
              </Content>
              <Content>
                Lorem ipsum dolor sit amet consectetur adipiscing elit blandit
                imperdiet, mauris inceptos lacinia at non. 
              </Content>
              <Content>
                Lorem ipsum mauris inceptos lacinia at non aliquet nostra etiam duis
                nibh, bibendum facilisi arcu est malesuada convallis nunc mattis.
              </Content>
              <Content>
                Lorem ipsum dolor sit amet consectetur adipiscing elit blandit
                imperdiet, mauris inceptos lacinia at non aliquet nostra etiam duis
                nibh, bibendum facilisi arcu est malesuada convallis nunc mattis.
                aliquam nullam.
              </Content>
              <StyledButton>Sign Guideline</StyledButton>
          </ContentContainer>
            </Container>
      </SmoothDisplayContainer>
    </AppScreen>
  );
}

const Container = styled.div<{ compactMode: boolean }>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  /* padding-top: ${({ compactMode }) => (compactMode ? 7 * GU : 15 * GU)}px; */
  width: 100%;
  height: 100%;
`;

const ContentContainer = styled.div<{ compactMode: boolean }>`
  display: flex;
  flex-direction: column;
  justify-content: top;
  align-items: flex-start;
  /* padding-top: ${({ compactMode }) => (compactMode ? 7 * GU : 15 * GU)}px; */
  max-width: 773px;
  border: 1px solid #A2957A;
  border-radius: 20px;
  padding: 56px 48px 48px;
`;

const Title = styled.div`
  ${textStyle("title1")};
  color: ${({ theme }) => theme.content};
  margin-bottom: ${4 * GU}px;
  width: 100%;
  
  
`;

const Content = styled.p`
  ${textStyle("body2")};
  color: ${({ theme }) => theme.content};
  max-width: 100%;
  margin-bottom: ${4 * GU}px;
  `;
  
const StyledButton = styled(Button)`
  
  min-width: 100%;
  border-radius: 8px;
  padding: 24px  ;
`