import { GU, LoadingRing, Switch, Tag, textStyle } from "@1hive/1hive-ui";
import type { MouseEventHandler } from "react";
import { useEffect, useState } from "react";
import { a, useTransition } from "@react-spring/web";
import styled from "styled-components";
import type { ContractData, AggregateContract } from "~/types";
import { getNetworkLogo } from "~/utils/client/icons.client";

type ContractItemProps = {
  contract: AggregateContract;
  loaderText?: string;
  onClick(contractData: ContractData): void;
};

export const ContractItem = ({
  contract: { proxy, implementation },
  loaderText = "Fetching data…",
  onClick,
}: ContractItemProps) => {
  const [itemClicked, setItemClicked] = useState(false);
  const [displayProxy, setDisplayProxy] = useState(!implementation);
  const contractData = displayProxy ? proxy : implementation;
  const { address, name, network } = contractData!;
  const implementationFound = !!implementation;
  const displaySwitch = !!proxy && !!implementation;

  const clickTransition = useTransition(itemClicked, {
    from: {
      loaderOpacity: 0,
    },
    enter: {
      loaderOpacity: 1,
    },
  });

  useEffect(() => {
    if (!itemClicked || !contractData) {
      return;
    }

    /**
     * Wait a little bit before handling click to display loader
     * for a period of time.
     */
    let timeoutId = setTimeout(() => onClick(contractData), 500);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [contractData, itemClicked, onClick]);

  const handleViewClick: MouseEventHandler<HTMLDivElement> = (e) => {
    e.stopPropagation();

    setDisplayProxy((prev) => !prev);
  };

  return (
    <Wrapper
      onClick={() => {
        setItemClicked(true);
      }}
      isClicked={itemClicked}
    >
      {clickTransition(({ loaderOpacity }, clicked) => (
        <>
          <a.div style={{ opacity: clicked ? 0.1 : 1 }}>
            <ItemHeader>
              <Tag
                mode="indicator"
                size="normal"
                label={network.name}
                icon={
                  <NetworkImg
                    src={getNetworkLogo(network.id)}
                    isTestnet={!!network.testnet}
                  />
                }
              />
              {displaySwitch && (
                <>
                  <ProxySwitchWrapper>
                    Show proxy:{" "}
                    <div onClick={handleViewClick}>
                      <Switch checked={displayProxy} />
                    </div>
                  </ProxySwitchWrapper>
                </>
              )}
            </ItemHeader>
            <ItemContent>
              <div>{name}</div>
              <div>{address}</div>
            </ItemContent>
            {!implementationFound && (
              <InfoError>*Implementation source code not found.</InfoError>
            )}
          </a.div>
          {clicked && (
            <Loader style={{ opacity: loaderOpacity }}>
              <LoadingRing mode="half-circle" /> <span>{loaderText}</span>
            </Loader>
          )}
        </>
      ))}
    </Wrapper>
  );
};

const Wrapper = styled.div<{ isClicked: boolean }>`
  position: relative;
  padding: ${2 * GU}px;
  background-color: ${({ theme }) => theme.surface};
  border-radius: 10px;
  transition: background-color ease-out 200ms;
  min-width: 45vmin;
  max-width: 85vmin;
  cursor: pointer;

  ${({ isClicked, theme }) =>
    !isClicked
      ? `&:hover {
    background-color: ${theme.surfaceHighlight};
  }`
      : ""};
`;

const ItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: ${1.5 * GU}px;
`;

const ItemContent = styled.div`
  & > div:nth-child(1) {
    ${textStyle("body1")};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  & > div:nth-child(2) {
    ${textStyle("body3")};
    color: ${({ theme }) => theme.contentSecondary};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const InfoError = styled.span`
  color: ${({ theme }) => theme.negative};
  margin-top: ${1 * GU}px;
  ${textStyle("body4")};
`;

const ProxySwitchWrapper = styled.div`
  display: flex;
  gap: ${0.5 * GU}px;
  ${({ theme }) => theme.contentSecondary};
  ${textStyle("body3")};

  & > div {
    display: flex;
    align-items: center;
  }
`;

const Loader = styled(a.div)`
  width: 100%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: nowrap;
  gap: ${1 * GU}px;
  ${textStyle("body3")};
`;

const NetworkImg = styled.img<{ isTestnet: boolean }>`
  border-radius: 50%;
  width: 20px;
  height: 20px;
  margin-left: -${1.2 * GU}px;
  margin-right: ${0.5 * GU}px;
  ${(props) => (props.isTestnet ? "filter: grayscale(80%);" : "")};
`;
