export const SELECTION_SEPARATOR = "%";

export const getSelectionRange = (text: string): [number, number] => {
  const startPosition = text.indexOf("%");
  let fallbackEndPosition = text.length - 1;

  if (startPosition === -1) {
    return [fallbackEndPosition, fallbackEndPosition];
  }
  const endPosition = text.indexOf(",", startPosition);

  return [startPosition, endPosition === -1 ? startPosition : endPosition];
};
