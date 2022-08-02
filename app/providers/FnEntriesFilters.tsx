import React, { useContext } from "react";
import { FnDescriptionStatus } from "~/types";
import type { FnEntry } from "~/types";

enum FnSorting {
  Newest = "newest",
  Relevance = "relevance",
}

type FnEntriesFiltersContextProps = {
  entries: FnEntry[];
  setEntries: (entries: FnEntry[]) => void;
  filteredEntries: FnEntry[];
  externalFilters: {
    submitterFilter: [string, (submitter: string) => void];
    statusFilter: [string, (status: string) => void];
    dateRangeFilter: [any, (dateRange: any) => void];
    searchFilter: [string, (query: string) => void];
  };
  internalFilters: {
    sortingOption: [FnSorting, (option: FnSorting) => void];
  };
  clearValues: () => void;
  loading: boolean;
};

const FnEntriesFiltersContext =
  React.createContext<FnEntriesFiltersContextProps>(
    {} as FnEntriesFiltersContextProps
  );

export function FnEntriesFilters({ children }: { children: React.ReactNode }) {
  console.log("Start computing");
  const [entries, setEntries] = React.useState<FnEntry[]>([]);
  const [sortingOption, setSortingOption] = React.useState<FnSorting>(
    FnSorting.Newest
  );
  const [dateRange, setDateRange] = React.useState<any>({
    startDate: new Date(),
    endDate: new Date(),
    key: "selection",
    active: false,
  });

  // todo: add types
  const [submitterFilter, setSubmitterFilter] = React.useState<string>("");
  const [statusFilter, setStatusFilter] = React.useState<string>("");
  const [abiSearchFilter, setAbiSearchFilter] = React.useState<string>("");

  const [filteredEntries, setFilteredEntries] = React.useState<FnEntry[]>([]);

  // filter by status
  React.useEffect(() => {
    let filtered = entries;
    console.log(entries, filtered);

    const statusFiltering = () => {
      switch (statusFilter) {
        case FnDescriptionStatus.Added:
          filtered = filtered.filter(
            (e) => e.status === FnDescriptionStatus.Added
          );
          break;
        case FnDescriptionStatus.Available:
          filtered = filtered.filter(
            (e) => e.status === FnDescriptionStatus.Available
          );
          break;
        default:
          filtered = entries;
          break;
      }
    };

    const searchFiltering = () => {
      filtered = filtered.filter((e) => {
        return e.abi.toLowerCase().includes(abiSearchFilter.toLowerCase());
      });
    };
    const sorting = () => {
      switch (sortingOption) {
        case "newest":
          filtered = filtered.sort((a, b) => {
            return b.upsertAt - a.upsertAt;
          });
          break;
        // how to sort by relevance?
        case "relevance":
          filtered = filtered.slice().sort((a, b) => {
            if (a.abi > b.abi) {
              return 1;
            }
            if (a.abi < b.abi) {
              return -1;
            }
            return 0;
          });
          break;
      }
    };
    const submitterFiltering = () => {
      if (submitterFilter !== "") {
        filtered = filtered.filter((entry) => {
          return entry.submitter
            .toLowerCase()
            .includes(submitterFilter.toLowerCase());
        });
      }
    };
    const rangeFiltering = () => {
      if (
        dateRange &&
        dateRange.active &&
        dateRange.startDate &&
        dateRange.endDate
      ) {
        filtered = filtered.filter((entry) => {
          return (
            entry.upsertAt >= dateRange.startDate.getTime() &&
            entry.upsertAt <= dateRange.endDate.getTime()
          );
        });
        console.log(filtered);
      }
    };

    statusFiltering();
    submitterFiltering();
    rangeFiltering();
    searchFiltering();
    sorting();
    setFilteredEntries(filtered);
  }, [
    entries,
    statusFilter,
    sortingOption,
    setFilteredEntries,
    submitterFilter,
    dateRange,
    abiSearchFilter,
  ]);

  const handleSortingOptionChange = React.useCallback((option: FnSorting) => {
    setSortingOption(option);
  }, []);

  const handleSubmitterFilterChange = React.useCallback((newSubmitter: any) => {
    setSubmitterFilter(newSubmitter);
  }, []);

  const handleStatusFilterChange = React.useCallback(
    (status: FnDescriptionStatus | string) => {
      setStatusFilter(status);
    },
    []
  );

  const handleSearchChange = React.useCallback((newSearch: any) => {
    setAbiSearchFilter(newSearch);
  }, []);

  const clearValues = () => {
    setSubmitterFilter("");
    setDateRange({
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
      active: false,
    });
    handleStatusFilterChange("");
    setAbiSearchFilter("");
    setFilteredEntries(entries);
  };
  console.log(entries);

  return (
    <FnEntriesFiltersContext.Provider
      value={{
        entries,
        filteredEntries,
        setEntries,
        externalFilters: {
          submitterFilter: [submitterFilter, handleSubmitterFilterChange],
          statusFilter: [statusFilter, handleStatusFilterChange],
          dateRangeFilter: [dateRange, setDateRange],
          searchFilter: [abiSearchFilter, handleSearchChange],
        },
        internalFilters: {
          sortingOption: [sortingOption, handleSortingOptionChange],
        },
        loading: false,
        clearValues,
      }}
    >
      {children}
    </FnEntriesFiltersContext.Provider>
  );
}

export const useFnEntriesFilters = () => {
  console.log("I have tried");
  return useContext(FnEntriesFiltersContext);
};
