import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  GU,
  SearchInput,
  TextInput,
  useTheme,
} from "@blossom-labs/rosette-ui";
import styled from "styled-components";
import Select from "react-select";
import DateRangeCustom from "~/components/EntriesFilters/DateRangeCustom";
import { useOnClickOutside } from "~/hooks/useOutsideAlerter";

export function EntriesFilters({
  externalFilters,
  internalFilters,
  clearValues,
  compactMode,
  tabletMode,
}: {
  externalFilters: any;
  internalFilters: any;
  clearValues: any;
  compactMode: any;
  tabletMode: any;
}) {
  const theme = useTheme();
  const [toggleDate, setToggleDate] = useState(false);

  const { submitterFilter, statusFilter, dateRangeFilter, searchFilter } =
    externalFilters;

  const { sortingOption } = internalFilters;

  const [submitterFilterValue, setSubmitterFilter] = submitterFilter;
  const [, setStatusFilter, statusRef] = statusFilter;
  const [dateRange, setDateRange] = dateRangeFilter;
  const [search, setSearch] = searchFilter;

  const [, setSorting, sortingRef] = sortingOption;

  const handleStatusFilterChange = (selected: any) => {
    if (selected) {
      setStatusFilter(selected.value);
    }
  };

  const handleSortingOptionChange = (selected: any) => {
    if (selected) {
      setSorting(selected.value);
    }
  };

  const handleSubmitterFilterChange = (e: any) => {
    setSubmitterFilter(e.target.value);
  };

  const handleDateRangeChange = (ranges: any) => {
    if (ranges.selection) {
      setDateRange({
        startDate: ranges.selection.startDate,
        endDate: ranges.selection.endDate,
        active: true,
      });
    }
    if (ranges.range1) {
      setDateRange({
        startDate: ranges.range1.startDate,
        endDate: ranges.range1.endDate,
        active: true,
      });
    }
  };

  return (
    <FiltersContainer>
      <Filters compactMode={compactMode} tabletMode={tabletMode}>
        <Filter>
          <SearchInput
            placeholder="Search by function name"
            value={search}
            onChange={setSearch}
            style={{
              background: "rgba(14, 13, 13, 0.5)",
              width: tabletMode ? "335px" : compactMode ? "300px" : "250px",
              height: "48px",
              color: "#FDE9BC",
            }}
          />
        </Filter>
        <Filter>
          <Select
            ref={sortingRef}
            placeholder={"Sort by"}
            styles={getSelectStyles(compactMode, tabletMode, theme)}
            options={[
              { label: "Newest", value: "newest" },
              { label: "Relevance", value: "relevance" },
            ]}
            onChange={handleSortingOptionChange}
          />
        </Filter>
        <Filter>
          <Select
            ref={statusRef}
            placeholder={"Status"}
            styles={getSelectStyles(compactMode, tabletMode, theme)}
            options={[
              { label: "All", value: "" },
              { label: "Available", value: "available" },
              { label: "Added", value: "added" },
              { label: "Pending", value: "pending" },
              { label: "Challenged", value: "challenged" },
            ]}
            onChange={handleStatusFilterChange}
          />
        </Filter>
        <Filter>
          <SubmitterFilter
            tabletMode={tabletMode}
            compactMode={compactMode}
            placeholder={"Paste here submitter address"}
            value={submitterFilterValue}
            onChange={handleSubmitterFilterChange}
          />
        </Filter>
        <Filter>
          <Button
            style={{
              width: tabletMode ? "100%" : compactMode ? "100%" : "",
              border: "1px solid #8A8069",
              height: "48px",
              display: "flex",
              justifyContent: "center",
            }}
            label={`${dateRange.startDate
              .toString()
              .substring(3, 15)} | ${dateRange.endDate
              .toString()
              .substring(3, 15)}`}
            onClick={() => setToggleDate(true)}
          />
          <DateRangeCustom
            show={toggleDate}
            setShow={setToggleDate}
            onChange={handleDateRangeChange}
            ranges={[dateRange]}
          />
        </Filter>
        <ClearButton
          tabletMode={tabletMode}
          compactMode={compactMode}
          onClick={() => clearValues()}
        >
          Clear
        </ClearButton>
      </Filters>
    </FiltersContainer>
  );
}

const SubmitterFilter = ({
  tabletMode,
  compactMode,
  placeholder,
  value,
  onChange,
}: any) => {
  const [showInput, setShowInput] = useState(false);
  const ref = useRef(null);

  useOnClickOutside(ref, () => setShowInput(false));

  useEffect(() => {
    const focusOnElement = (ref: any): void => {
      ref.current.focus();
    };
    if (showInput === true) {
      focusOnElement(ref);
    }
  }, [showInput]);

  return (
    <>
      <SubmitterContainer
        tabletMode={tabletMode}
        compactMode={compactMode}
        showInput={showInput}
        onClick={() => setShowInput(true)}
      >
        Submitter
        {showInput && (
          <TextInputContainer>
            <TextInput
              ref={ref}
              placeholder={placeholder}
              value={value}
              onChange={onChange}
            />
          </TextInputContainer>
        )}
      </SubmitterContainer>
    </>
  );
};

const TextInputContainer = styled.div`
  position: absolute;
  top: 55px;
  left: 10px;
  height: 48px;
  z-index: 1;
`;

const SubmitterContainer = styled.div<{
  tabletMode: boolean;
  compactMode: boolean;
  showInput: boolean;
}>`
  position: relative;
  background: #0e0d0d80;
  height: 48px;
  width: ${({ tabletMode, compactMode }) =>
    tabletMode ? "100%" : compactMode ? "100%" : "140px"};
  padding-left: ${({ tabletMode, compactMode }) =>
    tabletMode ? "30px" : compactMode ? "30px" : "10px"};

  border:  ${({ showInput, theme }) =>
    showInput ? `2px solid ${theme.focus}` : `1px solid ${theme.borderDark}`};
};
  border-radius: 8px;
  display: flex;
  color: ${({ theme }) => theme.positiveContent};
  justify-content: start;
  align-items: center;
  cursor: pointer;
`;

const ClearButton = styled(Button)<{
  tabletMode: boolean;
  compactMode: boolean;
}>`
  color: ${({ theme }) => theme.positiveContent};
  width: ${({ tabletMode, compactMode }) =>
    tabletMode ? "100%" : compactMode ? "100%" : "140px"};
  height: 48px;
  background: linear-gradient(#0e0d0d, #0e0d0d) padding-box,
    linear-gradient(45deg, #fac758, #f7513e) border-box;
  border: 2px solid transparent;
  border-radius: 8px;
`;

const Filter = styled.div`
  display: flex;
  justify-content: start;
`;

const Filters = styled.div<{ compactMode: boolean; tabletMode: boolean }>`
  display: ${({ compactMode, tabletMode }) =>
    compactMode ? "grid" : tabletMode ? "grid" : "flex"};
  grid-gap: ${({ compactMode, tabletMode }) =>
    compactMode ? 1 * GU : tabletMode ? 1 * GU : 0}px;
  grid-template-columns: ${({ compactMode, tabletMode }) =>
    `repeat(${compactMode ? "1" : tabletMode ? "2" : "1"}, ${
      compactMode ? "300" : tabletMode ? `336` : ""
    }px)`};
  margin: ${({ compactMode, tabletMode }) =>
    compactMode ? `auto` : tabletMode ? `` : ``};
  justify-content: ${({ compactMode, tabletMode }) =>
    compactMode ? "start" : tabletMode ? "start" : "space-between"};
  width: ${({ compactMode, tabletMode }) =>
    compactMode ? "" : tabletMode ? "" : "1200px"};
  margin-bottom: ${5 * GU}px;
`;

const FiltersContainer = styled.div`
  display: flex;
  justify-content: center;
  width: 1130px;
  padding-top: ${8 * GU}px;
`;

// should tweak this to look acording to the theme
const getSelectStyles = (
  compactMode: boolean,
  tabletMode: boolean,
  theme: any
) => {
  const customStyles = {
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "rgba(138, 128, 105, 0.7)"
        : "rgba(14, 13, 13)",
      borderColor: state.isSelected ? "#f5f5f5" : "#ddd",
      borderWidth: 1,
      borderRadius: 4,
      padding: "5px 10px",
      fontSize: 18,
      fontWeight: "bold",
      color: `${theme.positiveContent}`,
      cursor: "pointer",
      "&:hover": {
        backgroundColor: state.isSelected
          ? "rgba(138, 128, 105, 0.7)"
          : "rgba(138, 128, 105, 0.2)",
      },
    }),
    menu: (base: any, state: any) => ({
      ...base,
      border: "1px solid #ccc",
      boxShadow: "0 2px 12px rgba(0, 0, 0, 0.1)",
      borderRadius: 8,
      backgroundColor: "rgba(14, 13, 13)",
      padding: "5px 0",
      width: "110%",
    }),
    control: (base: any, state: any) => ({
      ...base,
      height: "48px",
      cursor: "pointer",
      border: state.isFocused
        ? `2px solid ${theme.focus}`
        : `1px solid ${theme.borderDark}`,
      borderRadius: "8px",
      boxShadow: state.isFocused ? 0 : 0,
      background: "rgba(14, 13, 13, 0.5)",
      "&:hover": {
        borderColor: state.isFocused ? "none" : "none",
      },
    }),
    placeholder: (base: any, state: any) => ({
      ...base,
      color: "#FDE9BC",
    }),
    indicatorSeparator: (base: any, state: any) => ({
      ...base,
      display: "none",
    }),
    singleValue: (base: any, state: any) => ({
      ...base,
      color: state.isSelected ? "#FDE9BC" : "#FDE9BC",
    }),
  };

  if (tabletMode) {
    return {
      ...customStyles,
      control: (base: any, state: any) => ({
        ...base,
        padding: " 0 0 0 20px",
        width: "335px",
        height: "48px",
        cursor: "pointer",
        border: state.isFocused
          ? `2px solid ${theme.focus}`
          : `1px solid ${theme.borderDark}`,
        borderRadius: "8px",
        boxShadow: state.isFocused ? 0 : 0,
        background: "rgba(14, 13, 13, 0.5)",
        "&:hover": {
          borderColor: state.isFocused ? "none" : "none",
        },
      }),
    };
  } else if (compactMode) {
    return {
      ...customStyles,
      control: (base: any, state: any) => ({
        ...base,
        padding: " 0 0 0 20px",
        width: "300px",
        height: "48px",
        cursor: "pointer",
        border: state.isFocused
          ? `2px solid ${theme.focus}`
          : `1px solid ${theme.borderDark}`,
        borderRadius: "8px",
        boxShadow: state.isFocused ? 0 : 0,
        background: "rgba(14, 13, 13, 0.5)",
        "&:hover": {
          borderColor: state.isFocused ? "none" : "none",
        },
      }),
    };
  } else {
    return customStyles;
  }
};
