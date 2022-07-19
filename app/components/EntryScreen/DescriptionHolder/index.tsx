import styled from 'styled-components'

export const DescriptionHolder = ({notice}: any) => {

  return (
      <Container>
        <Title>Description</Title>
        <Description>{notice}</Description>
        <Description>{`Example: ${notice}`}</Description>
      </Container>
  );
};

const Container = styled.div`
    display: flex;
    flex-direction: column;
`

const Title = styled.div`
  display: flex;
  justify-content: start;
  align-items: start;
  height: 100%;
  width: 100%;
  color: #A2957A;
  font-weight: 400;
  font-size: 24px;
  line-height: 24px;
`;

const Description = styled.div`
  font-family: 'Avenir';
  font-style: normal;
  font-weight: 400;
  font-size: 20px;
  line-height: 32px;
  color: #FDE9BC;
`