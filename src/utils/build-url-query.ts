export function buildUrlWithQueryParams(baseUrl: string, filter: any): string {
  const queryParams = Object.keys(filter || {})
    .filter(
      (key) =>
        filter[key] !== undefined &&
        filter[key] !== null &&
        !Number.isNaN(filter[key]) &&
        filter[key] !== "",
    )
    .map(
      (key) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(String(filter[key]))}`,
    )
    .join("&");

  return queryParams ? `${baseUrl}?${queryParams}` : baseUrl;
}
