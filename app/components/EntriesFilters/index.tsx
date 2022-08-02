import React from "react";
import { Button, GU, SearchInput } from "@blossom-labs/rosette-ui";
import styled from "styled-components";
import Select from "react-select";
import DateRangeCustom from "~/components/EntryScreen/DateRangeCustom";

export function EntriesFilters({
  compactMode,
  tabletMode,
  dateRange,
  setDateRange,
  search,
  setSearch,
  setStatusFilter,
  setSorting,
  clearValues,
  setSubmitterFilter,
}: {
  compactMode: boolean;
  tabletMode: boolean;
  dateRange: any;
  setDateRange: (s: any) => void;
  search: string;
  setSearch: (s: string) => void;
  setStatusFilter: (s: string) => void;
  setSorting: (option: any) => void;
  clearValues: () => void;
  setSubmitterFilter: (s: string) => void;
}) {
  const [toggleDate, setToggleDate] = React.useState(false);

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
              width: "250px",
              color: "#FDE9BC",
            }}
          />
        </Filter>
        <Filter>
          <Select
            placeholder={"Sort by"}
            styles={customStyles}
            options={[
              { label: "Newest", value: "newest" },
              { label: "Relevance", value: "relevance" },
            ]}
            onChange={handleSortingOptionChange}
          />
        </Filter>
        <Filter>
          <Button
            style={{ border: "1px solid #8A8069" }}
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
        {/* <Filter>
          <SearchInput
            placeholder={'Submitter'}
            value={submitterFilter}
            onChange={setSubmitterFilter}
          />
        </Filter> */}
        <Filter>
          <Select
            styles={customStyles}
            placeholder={"Status"}
            options={[
              { label: "All", value: "" },
              { label: "Available", value: "available" },
              { label: "Added", value: "added" },
            ]}
            onChange={handleStatusFilterChange}
          />
        </Filter>
        <Button onClick={() => clearValues()}>Clear</Button>
      </Filters>
    </FiltersContainer>
  );
}

// should tweak this to look acording to the theme
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
    color: "#FDE9BC",
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
    width: "100%",
  }),
  control: (base: any, state: any) => ({
    ...base,
    border: state.isFocused ? "2px solid #8A8069" : "1px solid #8A8069",
    borderRadius: "8px",
    boxShadow: state.isFocused ? 0 : 0,
    width: "200px",
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

const Filter = styled.div`
  display: flex;
  margin: auto;
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
    compactMode ? `auto` : tabletMode ? `auto` : ``};
  justify-content: ${({ compactMode, tabletMode }) =>
    compactMode ? "start" : tabletMode ? "start" : "space-between"};
  width: ${({ compactMode, tabletMode }) =>
    compactMode ? "" : tabletMode ? "" : "1200px"};
  margin-bottom: ${5 * GU}px;
`;

const FiltersContainer = styled.div`
  display: flex;
  margin: auto;
  justify-content: center;
  width: 90%;
  padding-top: ${8 * GU}px;
`;
