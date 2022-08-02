import React, { useRef } from "react";
import { DateRange } from "react-date-range";
import styled from "styled-components";
import { useOnClickOutside } from "~/hooks/useOutsideAlerter";

const DateRangeCustom = ({
  show,
  setShow,
  onChange,
  ranges = [{ startDate: new Date(), endDate: new Date(), key: "selection" }],
}: any) => {
  const ref = useRef();

  const handleClose = React.useCallback(() => {
    setShow(false);
  }, [setShow]);

  useOnClickOutside(ref, handleClose);

  return (
    show && (
      <DateRangeContainer ref={ref}>
        <DateRange
          rangeColors={["#F86E38"]}
          ranges={ranges}
          onChange={onChange}
        />
      </DateRangeContainer>
    )
  );
};

const DateRangeContainer = styled.div`
  z-index: 1;
  position: absolute;
  margin-left: auto;
  margin-right: auto;
  background-color: rgba(0, 0, 0, 1);
  text-align: center;
`;

export default DateRangeCustom;
