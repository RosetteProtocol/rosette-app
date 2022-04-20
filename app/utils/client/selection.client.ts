export const SELECTION_SEPARATOR = "%";
export const CLOSING_SEPARATOR = "`";

export const TAB_KEYS_WHITELIST = [SELECTION_SEPARATOR, CLOSING_SEPARATOR];

const END_POSITION_KEYS_WHITELIST = [",", ")"];

export const canTab = (text: string, offset = 0) =>
  TAB_KEYS_WHITELIST.find((k) => text.includes(k, offset));

export const getSelectionRange = (
  text: string,
  offset = 0
): [number, number] => {
  const startPosition = text.indexOf(SELECTION_SEPARATOR, offset);
  const fallbackEndPosition = text.length - 1;

  if (startPosition === -1) {
    const closingPosition = text.indexOf(CLOSING_SEPARATOR, offset);
    if (closingPosition > -1) {
      return [closingPosition + 1, closingPosition + 1];
    }

    return [fallbackEndPosition, fallbackEndPosition];
  }
  let i = 0,
    endPosition = -1;

  while (endPosition === -1 && i < END_POSITION_KEYS_WHITELIST.length) {
    const closingKey = END_POSITION_KEYS_WHITELIST[i];
    endPosition = text.indexOf(closingKey, startPosition);
    i++;
  }

  return [startPosition, endPosition === -1 ? startPosition : endPosition];
};
