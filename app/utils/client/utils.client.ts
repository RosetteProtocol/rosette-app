export const DEBOUNCE_TIME = 400; // ms

export const buildHref = (
  href: string,
  searchParams: [string, any][]
): string => {
  const urlSearchParams = new URLSearchParams(searchParams);

  return `${href}?${urlSearchParams.toString()}`;
};
