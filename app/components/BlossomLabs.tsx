import styled from "styled-components";

import blossomLabsLogo from "~/assets/blossom-logo.svg";
import blossomLabsIcon from "~/assets/blossom-icon.svg";

export const BlossomLabsLogo = () => (
  <OutterWrapper>
    <a
      style={{
        textDecoration: "none",
      }}
      target="_blank"
      href="https://github.com/BlossomLabs"
      rel="noreferrer"
    >
      <img src={blossomLabsLogo} alt="" />
    </a>
  </OutterWrapper>
);

export const BlossomLabsIcon = () => (
  <img
    style={{
      width: "48px",
      height: "48px",
    }}
    src={blossomLabsIcon}
    alt=""
  />
);

const OutterWrapper = styled.span`
  display: inline-block;
  vertical-align: middle;
`;
