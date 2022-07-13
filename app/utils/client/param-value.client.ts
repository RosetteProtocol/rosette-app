import { utils, wordlists } from "ethers";
import type { ValueOrArray } from "~/types";

export type FieldParamValue = { decimals?: number; value: any };

export const SOLIDITY_TYPE_REGEX =
  /^(?<type>[a-z]+)(?<range>\d+x?\d*)?(\[\d*\])*$/;

const getRandomInt = (upperLimit: number): number =>
  Math.floor(Math.random() * upperLimit);

const generateRandomHexadecimal = (bytesLength: number): string => {
  const bytesLength_ =
    typeof bytesLength === "string" ? Number(bytesLength) : bytesLength;

  return (
    "0x" +
    // Taken from https://stackoverflow.com/questions/60738424/javascript-generate-random-hexadecimal
    [...crypto.getRandomValues(new Uint8Array(bytesLength_))]
      .map((m) => ("0" + m.toString(16)).slice(-2))
      .join("")
  );
};

const generateCollection = (
  length: number,
  generateElement: (index: number) => any
): any[] => {
  return [...Array(length)].map((_, i) => generateElement(i));
};

const generateRandomText = (): string =>
  generateCollection(7, () => wordlists.en.getWord(getRandomInt(1000))).join(
    " "
  );

const generateParamValue = (type: string, range?: number): FieldParamValue => {
  const v: FieldParamValue = { value: "" };

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

export const getDefaultParamValues = ({
  arrayChildren,
  arrayLength,
  type,
}: utils.ParamType): ValueOrArray<any> => {
  if (!arrayChildren) {
    const res = SOLIDITY_TYPE_REGEX.exec(type);
    const rawType = res?.groups?.type ?? "uint";
    const range = res?.groups?.range ?? 8;

    return generateParamValue(rawType, Number(range));
  }

  // When having dynamic arrays generate one element only
  const arrayLength_ = arrayLength === -1 ? 1 : arrayLength;

  return generateCollection(arrayLength_, () =>
    getDefaultParamValues(arrayChildren)
  );
};
