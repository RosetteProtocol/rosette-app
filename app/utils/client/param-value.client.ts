import { utils, wordlists } from "ethers";

export type ParamValues = { decimals?: number; value: any };

const SOLIDITY_TYPES_REGEX =
  /^(?<type>address|bool|bytes?|uint|int|u?fixed|string)(?<range>(?<=uint|int)\d{1,3}|(?<=u?fixed)\d{1,2}x\d{1,3}|(?<=bytes)\d{1,2})?(?<array>\[(?<arrayLength>\d)?])?$/;

const getRandomInt = (upperLimit: number): number =>
  Math.floor(Math.random() * upperLimit);

const generateRandomHexadecimal = (bytesLength: number): string => {
  const bytesLength_ =
    typeof bytesLength === "string" ? Number(bytesLength) : bytesLength;

  return (
    "0x" +
    // taken from https://stackoverflow.com/questions/60738424/javascript-generate-random-hexadecimal
    [...crypto.getRandomValues(new Uint8Array(bytesLength_))]
      .map((m) => ("0" + m.toString(16)).slice(-2))
      .join("")
  );
};

const generateCollection = (
  length: number,
  generateElement: () => any
): any[] => {
  return [...Array(length)].map(() => generateElement());
};

const generateRandomText = (): string =>
  generateCollection(7, () => wordlists.en.getWord(getRandomInt(1000))).join(
    " "
  );

const generateParamValue = (type: string, range?: number): ParamValues => {
  const v: ParamValues = { value: "" };

  switch (type) {
    case "address":
      v.value = generateRandomHexadecimal(20);
      break;
    case "bool":
      v.value = [true, false][getRandomInt(2)];
      break;
    case "byte":
      v.value = generateRandomHexadecimal(1);
      break;
    case "bytes":
      if (range) {
        v.value = generateRandomHexadecimal(range);
      }

      const text = generateRandomText();
      v.value = utils.hexlify(utils.toUtf8Bytes(text));
      break;
    case "int":
    case "uint":
    case "fixed":
    case "ufixed":
      v.value = getRandomInt(256);
      v.decimals = 0;
      break;
    case "string":
      v.value = generateRandomText();
      break;
  }

  return v;
};

export const getDefaultParamValues = (
  type: string
): ParamValues | ParamValues[] => {
  const res = SOLIDITY_TYPES_REGEX.exec(type);
  let defaultValue: ParamValues | ParamValues[] = { value: "" };

  if (!res) {
    return defaultValue;
  }

  const { type: rawType, range, array, arrayLength } = res.groups || {};
  const arrayLength_ = Number(arrayLength ?? 1);
  const range_ = Number(range);

  if (array) {
    return generateCollection(Number(arrayLength_), () =>
      generateParamValue(rawType, Number(range_))
    );
  }

  return generateParamValue(rawType, range_);
};
