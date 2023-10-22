type RequestInitWithTimeout = NodeJS.fetch.RequestInit & { timeout: number };

async function fetchWithTimeout(url: string, options: RequestInitWithTimeout) {
  options.timeout = options.timeout ?? 5000;
  const controller = new AbortController();

  const id = setTimeout(() => controller.abort(), options.timeout);

  const response = await fetch(url, {
    ...options,
    signal: controller.signal,
  });
  clearTimeout(id);
  if (!response.ok) {
    throw new Error("Fail result returned from fetch");
  }
  return response;
}

async function fetchAndRetryDifferentUrl(
  getFetchUrl: () => string,
  options: RequestInitWithTimeout,
  shouldRetry = true,
): Promise<Response> {
  try {
    const url = getFetchUrl();
    const response = await fetchWithTimeout(url, options);
    return response;
  } catch (error) {
    if (shouldRetry) {
      return fetchAndRetryDifferentUrl(getFetchUrl, options, false);
    } else {
      throw error;
    }
  }
}

export { fetchWithTimeout, fetchAndRetryDifferentUrl, RequestInitWithTimeout };
