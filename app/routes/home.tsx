import { useNavigate } from "remix";
import styled from "styled-components";
import { AppScreen } from "~/components/AppLayout/AppScreen";
import { ContractForm } from "~/components/ContractForm";

export default function Home() {
  const navigate = useNavigate();

  return (
    <AppScreen>
      <MainContainer>
        <ContractForm
          onSubmit={(contractAddress) =>
            navigate(`/describe?contract=${contractAddress}`)
          }
        />
      </MainContainer>
    </AppScreen>
  );
}

const MainContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
`;
