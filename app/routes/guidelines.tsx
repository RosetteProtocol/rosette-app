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
          <Title>Guideline v0 📕</Title>
          <Content>
            Lorem ipsum dolor sit amet consectetur adipiscing elit blandit
            imperdiet, mauris inceptos lacinia at non aliquet nostra etiam duis
            nibh, bibendum facilisi arcu est malesuada convallis nunc mattis.
            Magnis interdum rutrum elementum lectus tempor ultricies ultrices
            aptent ullamcorper, viverra scelerisque porttitor auctor condimentum
            natoque cubilia sem potenti feugiat, mollis fringilla ut euismod
            nunc at donec in. Elementum iaculis pharetra auctor magnis gravida
            sollicitudin sociosqu, sodales accumsan nibh mollis curabitur eros
            scelerisque, malesuada lacus tincidunt praesent hendrerit ultricies.
            Nibh nulla nunc ut enim facilisi dictum convallis tincidunt a
            cubilia, ultricies suscipit morbi hac pellentesque per blandit
            praesent sociis. Feugiat morbi cursus condimentum ridiculus
            vestibulum nisi penatibus, mollis nec ultricies tristique conubia
            eget congue vivamus, tellus aenean netus elementum class sed. Vitae
            cum aenean purus malesuada duis litora vehicula posuere donec
            taciti, vel faucibus mi est augue fermentum eget torquent lacinia
            pulvinar facilisis, elementum et metus laoreet per semper placerat
            aliquam nullam.
          </Content>
          <Button>Sign Guideline</Button>
        </Container>
      </SmoothDisplayContainer>
    </AppScreen>
  );
}

const Container = styled.div<{ compactMode: boolean }>`
  display: flex;
  flex-direction: column;
  justify-content: top;
  align-items: center;
  padding-top: ${({ compactMode }) => (compactMode ? 7 * GU : 23 * GU)}px;
  width: 100%;
  height: 100%;
`;

const Title = styled.div`
  ${textStyle("title1")};
  color: ${({ theme }) => theme.content};
  margin-bottom: ${2 * GU}px;
`;

const Content = styled.div`
  ${textStyle("body2")};
  color: ${({ theme }) => theme.content};
  max-width: 35%;
  margin-bottom: ${2 * GU}px;
`;
