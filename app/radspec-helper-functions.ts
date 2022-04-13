export enum ParamType {
  Address = "address",
  Bool = "bool",
  Bytes = "bytes",
  Uint = "uint",
  String = "string",
}

export type Param = {
  name: string;
  type: ParamType;
  description: string;
  defaultValue?: string | number;
};
export type HelperFunction = {
  name: string;
  description: string;
  params?: Param[];
};

export const HELPER_FUNCTIONS: HelperFunction[] = [
  {
    name: "formatDate",
    description: "Format a timestamp as a string.",
    params: [
      {
        name: "timestamp",
        type: ParamType.Uint,
        description: " Unix timestamp in seconds.",
      },
      {
        name: "format",
        type: ParamType.String,
        description:
          'Format for the date, defaults to a format like "Jan. 1st 2000".',
      },
    ],
  },
  {
    name: "formatPct",
    description: "Format a percentage amount.",
    params: [
      {
        name: "value",
        type: ParamType.Uint,
        description: "The number to be formatted as a percentage.",
      },
      {
        name: "format",
        type: ParamType.Uint,
        description:
          "The number that is considered to be 100% when calculating the percentage.",
        defaultValue: "10^18",
      },
      {
        name: "precision",
        type: ParamType.Uint,
        description: "The number of decimal places to format to.",
        defaultValue: 2,
      },
    ],
  },
  {
    name: "fromHex",
    description: "Returns the string representation of a given hex value.",
    params: [
      {
        name: "hex",
        type: ParamType.String,
        description: "The hex string.",
      },
      {
        name: "to",
        type: ParamType.String,
        description:
          "The type to convert the hex from (supported types: 'utf8', 'number').",
      },
    ],
  },
  {
    name: "radspec",
    description: "Interpret calldata using radspec recursively.",
    params: [
      {
        name: "addr",
        type: ParamType.Address,
        description: "The target address of the call.",
      },
      {
        name: "data",
        type: ParamType.Bytes,
        description: "The calldata of the call.",
      },
    ],
  },
  {
    name: "tokenAmount",
    description: "Format token amounts taking decimals into account.",
    params: [
      {
        name: "tokenAddress",
        type: ParamType.Address,
        description: "The address of the token.",
      },
      {
        name: "amount",
        type: ParamType.Uint,
        description: "The absolute amount for the token quantity (wei).",
      },
      {
        name: "showSymbol",
        type: ParamType.Bool,
        description:
          "Whether the token symbol will be printed after the amount.",
      },
      {
        name: "precision",
        type: ParamType.Uint,
        description:
          "The number of decimal places to format to. If set, the precision is always enforced.",
      },
    ],
  },
  {
    name: "transformTime",
    description: "Transform between time units.",
    params: [
      {
        name: "time",
        type: ParamType.Uint,
        description: "The base time amount.",
      },
      {
        name: "toUnit",
        type: ParamType.String,
        description:
          "The unit to convert the time to (supported units: 'second', 'minute', 'hour', 'day', 'week', 'month', 'year').",
        defaultValue: "'best'",
      },
      {
        name: "fromUnit",
        type: ParamType.String,
        description:
          "The unit to convert the time from (supported units: 'millisecond', 'second', 'minute', 'hour', 'day', 'week', 'month', 'year').",
        defaultValue: "'second'",
      },
    ],
  },
  {
    name: "withDecimals",
    description: "Format an numerical amount with its decimals.",
    params: [
      {
        name: "amount",
        type: ParamType.Uint,
        description: "The absolute amount, without any decimals.",
      },
      {
        name: "decimals",
        type: ParamType.Uint,
        description: "The number of decimal places to format to.",
        defaultValue: 18,
      },
    ],
  },
];
