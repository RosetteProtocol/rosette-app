import { GU } from "@1hive/1hive-ui/";
import styled from "styled-components";
import blossomLabsIcon from "~/assets/blossom-labs.svg";

type BlossomLabsLogoProps = {
  iconSize?: string;
  opacity?: number | string;
  showIconOnly?: boolean;
};

export const BlossomLabsLogo = ({
  iconSize = "20px",
  opacity,
  showIconOnly = false,
}: BlossomLabsLogoProps) => (
  <OutterWrapper opacity={opacity}>
    <a
      style={{
        textDecoration: "none",
      }}
      target="_blank"
      href="https://github.com/BlossomLabs"
      rel="noreferrer"
    >
      <div
        style={{
          display: "flex",
          gap: 1 * GU,
        }}
      >
        <img
          style={{
            width: iconSize,
            height: iconSize,
          }}
          src={blossomLabsIcon}
          alt=""
        />{" "}
        {!showIconOnly && "Blossom Labs"}
      </div>
    </a>
  </OutterWrapper>
);

const OutterWrapper = styled.span<{ opacity?: number | string }>`
  display: inline-block;
  color: #f8b9b6;
  opacity: ${(p) => p.opacity};
  font-weight: bold;
  vertical-align: middle;
`;
