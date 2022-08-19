import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { FnDescriptionStatus } from "~/types";
import type { FnEntry } from "~/types";

export type ExternalFilters = {
  submitterFilter: [string, (submitter: string) => void];
  statusFilter: [
    FnDescriptionStatus | "",
    (status: FnDescriptionStatus | "") => void,
    React.Ref<any>
  ];
  dateRangeFilter: [any, (dateRange: any) => void];
  searchFilter: [string, (searchTerm: string) => void];
};

type DateRangeSelection = {
  startDate: Date;
  endDate: Date;
  key: string;
  active: boolean;
};

type FnEntriesFiltersContextProps = {
  entries: FnEntry[];
  setEntries: (entries: FnEntry[]) => void;
  filteredEntries: FnEntry[];
  externalFilters: ExternalFilters;
  internalFilters: {
    sortingOption: [string | null, (option: string) => void, React.Ref<any>];
  };
  clearValues: () => void;
  loading: boolean;
};

const FnEntriesFiltersContext =
  React.createContext<FnEntriesFiltersContextProps>(
    {} as FnEntriesFiltersContextProps
  );

export function FnEntriesFilters({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<FnEntry[]>([]);
  const [sortingOption, setSortingOption] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRangeSelection>({
    startDate: new Date(),
    endDate: new Date(),
    key: "selection",
    active: false,
  });

  // todo: add types
  const [submitterFilter, setSubmitterFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<FnDescriptionStatus | "">(
    ""
  );
  const [abiSearchFilter, setAbiSearchFilter] = useState<string>("");

  const [filteredEntries, setFilteredEntries] = useState<FnEntry[]>([]);

  const sortingRef = useRef();
  const statusRef = useRef();

  useEffect(() => {
    let filtered = entries;

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
        case FnDescriptionStatus.Pending:
          filtered = filtered.filter(
            (e) => e.status === FnDescriptionStatus.Pending
          );
          break;
        case FnDescriptionStatus.Challenged:
          filtered = filtered.filter(
            (e) => e.status === FnDescriptionStatus.Challenged
          );
          break;
        default:
          filtered = entries;
          break;
      }
    };

    const searchFiltering = () => {
      if (abiSearchFilter) {
        filtered = filtered.filter((e) => {
          return e.abi.toLowerCase().includes(abiSearchFilter.toLowerCase());
        });
      }
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
            .includes(submitterFilter.toString().toLowerCase());
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

  const handleSortingOptionChange = useCallback((option: string) => {
    setSortingOption(option);
  }, []);

  const handleSubmitterFilterChange = useCallback((newSubmitter: any) => {
    setSubmitterFilter(newSubmitter);
  }, []);

  const handleStatusFilterChange = useCallback(
    (status: FnDescriptionStatus | "") => {
      setStatusFilter(status);
    },
    []
  );

  const handleSearchChange = useCallback((newSearch: any) => {
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
    setSortingOption("");
    if (sortingRef.current) {
      sortingRef.current.clearValue();
    }
    if (statusRef.current) {
      statusRef.current.clearValue();
    }
  };

  return (
    <FnEntriesFiltersContext.Provider
      value={{
        entries,
        filteredEntries,
        setEntries,
        externalFilters: {
          submitterFilter: [submitterFilter, handleSubmitterFilterChange],
          statusFilter: [statusFilter, handleStatusFilterChange, statusRef],
          dateRangeFilter: [dateRange, setDateRange],
          searchFilter: [abiSearchFilter, handleSearchChange],
        },
        internalFilters: {
          sortingOption: [sortingOption, handleSortingOptionChange, sortingRef],
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
  return useContext(FnEntriesFiltersContext);
};
