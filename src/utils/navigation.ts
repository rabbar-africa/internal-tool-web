export const matchPath = (pathname: string, href: string, paths?: string[]) => {
  if (pathname === href) return true;

  return (
    paths?.some((path) =>
      path === "/" ? pathname === "/" : pathname.startsWith(path),
    ) ?? false
  );
};

export const processUrlVariables = (
  url: string,
  variables: Record<string, any> & { query?: Record<string, any> },
): string => {
  const values = { ...variables };
  const query = values.query;
  delete values.query;

  // for path variables
  let processedUrl = Object.entries(values).reduce((result, [key, value]) => {
    if (value === undefined || value === null) {
      throw new Error(`Missing value for URL variable ":${key}"`);
    }
    return result.replace(`:${key}`, encodeURIComponent(String(value)));
  }, url);

  const remainingVars = processedUrl.match(/:[a-zA-Z0-9_]+/g);
  if (remainingVars?.length) {
    throw new Error(
      `Missing values for URL variables: ${remainingVars.join(", ")}`,
    );
  }

  // for query params
  if (query && Object.keys(query).length > 0) {
    const queryParams = new URLSearchParams();

    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach((v) => queryParams.append(key, String(v)));
        } else {
          queryParams.append(key, String(value));
        }
      }
    });

    const queryString = queryParams.toString();
    if (queryString) {
      processedUrl += (processedUrl.includes("?") ? "&" : "?") + queryString;
    }
  }

  return processedUrl;
};
