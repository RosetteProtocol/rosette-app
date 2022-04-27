import { GU } from "@1hive/1hive-ui";
import styled from "styled-components";
import type { Param } from "~/radspec-helper-functions";

type DescriptionProps = {
  description: string;
  params?: Param[];
};

export const Entry = ({ description, params = [] }: DescriptionProps) => (
  <Container>
    <div>{description}</div>
    {params.length && (
      <ParametersContainer>
        <div>Parameters</div>
        <ul>
          {params.map(({ name, defaultValue, description, type }) => (
            <Parameter key={name}>
              <span>{name}:</span>
              <span>
                {type.toString()}&nbsp;
                {defaultValue && <span>(optional)</span>}
              </span>

              <div>{description}</div>
              {defaultValue && <span>Default: {defaultValue}</span>}
            </Parameter>
          ))}
        </ul>
      </ParametersContainer>
    )}
  </Container>
);

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${1 * GU}px;

  & > div {
    color: ${({ theme }) => theme.surfaceContentSecondary};
  }
`;

const ParametersContainer = styled.div`
  & > div:first-child {
    color: ${({ theme }) => theme.surfaceContent};
  }

  & > ul {
    margin-left: ${1 * GU}px;
  }

  & > ul > li {
    margin-left: ${1 * GU}px;
  }
`;

const Parameter = styled.li`
  & > span:nth-child(1) {
    color: ${({ theme }) => theme.surfaceContent};
  }
  & > span:nth-child(2) {
    font-style: italic;
  }
`;
