import React, { useCallback, useRef } from "react";
import { DateRange } from "react-date-range";
import styled from "styled-components";
import { useOnClickOutside } from "~/hooks/useOutsideAlerter";

type DataRangeCustomProps = {
  show: boolean;
  setShow: (show: boolean) => void;
  onChange: (dateRange: any) => void;
  ranges: [{ startDate: Date; endDate: Date; key: string }];
};

const DateRangeCustom = ({
  show,
  setShow,
  onChange,
  ranges = [{ startDate: new Date(), endDate: new Date(), key: "selection" }],
}: DataRangeCustomProps) => {
  const ref = useRef();

  const handleClose = useCallback(() => {
    setShow(false);
  }, [setShow]);

  useOnClickOutside(ref, handleClose);

  return (
    <DateRangeContainer ref={ref} show={show}>
      <DateRange
        rangeColors={["#F86E38"]}
        ranges={ranges}
        onChange={onChange}
      />
    </DateRangeContainer>
  );
};

const DateRangeContainer = styled.div`
  z-index: 1;
  position: absolute;
  display: ${({ show }: { show: boolean }) => (show ? "block" : "none")};
  text-align: center;
  margin-top: 60px;
  background-color: rgba(0, 0, 0, 1);
`;

export default DateRangeCustom;
