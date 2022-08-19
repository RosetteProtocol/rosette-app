import { useEffect, useState } from "react";
import { Button, GU } from "@blossom-labs/rosette-ui";
import styled from "styled-components";

type StatusModuleProps = {
  status: string | undefined;
};

export const StatusModule = ({ status }: StatusModuleProps) => {
  const [currentStatus, setCurrentStatus] = useState<string>();

  useEffect(() => {
    if (status) {
      setCurrentStatus(status);
    }
  }, [status]);

  const renderDynamicSection = () => {
    switch (status) {
      case "challenged":
        return <Button>View Dispute</Button>;
      case "added":
        return <Button>Challenge</Button>;
      case "pending":
        return <div>Timer</div>;
    }
  };

  return (
    <Container>
      <StatusContainer>
        <Label>Status</Label>
        <StatusTitle>{currentStatus}</StatusTitle>
      </StatusContainer>
      <DynamicSection>{renderDynamicSection()}</DynamicSection>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 363px;
  height: 200px;
  justify-content: space-around;
  border: 1px solid #8a8069;
  border-radius: 20px;
  outline: 0;
`;

const StatusContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${2 * GU}px;
  padding: ${1 * GU}px;
`;

const DynamicSection = styled.div`
  display: flex;
  flex-direction: column;
  width: ${35 * GU}px;
  margin: auto;
`;

const Label = styled.div`
  font-size: 16px;
  color: #a2957a;
  margin-left: ${4 * GU}px;
  margin-top: ${3 * GU}px;
`;
const StatusTitle = styled.div`
  font-weight: 400;
  font-size: 20px;
  color: #fde9bc;
  margin-left: ${4 * GU}px;
`;
