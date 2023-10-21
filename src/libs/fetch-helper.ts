type RequestInitWithTimeout = NodeJS.fetch.RequestInit & { timeout: number };

async function fetchWithTimeout(url: string, options: RequestInitWithTimeout) {
  const controller = new AbortController();

  const id = setTimeout(() => controller.abort(), options.timeout);

  const response = await fetch(url, {
    ...options,
    signal: controller.signal,
  });
  clearTimeout(id);

  return response;
}

//TODO: is this too complex now ?
//url get from a function, new value every time ?
async function fetchAndRetryDifferentUrl(
  getFetchUrl: (path: string | undefined) => string,
  fetchPath: string | undefined,
  options: RequestInitWithTimeout,
  shouldRetry = true,
): Promise<Response> {
  try {
    const url = getFetchUrl(fetchPath);
    const response = await fetchWithTimeout(url, options);
    return response;
  } catch (error: any) {
    if (shouldRetry && error.name === "AbortError") {
      return fetchAndRetryDifferentUrl(getFetchUrl, fetchPath, options, false);
    } else {
      throw error;
    }
  }
}

export { fetchWithTimeout, fetchAndRetryDifferentUrl };
