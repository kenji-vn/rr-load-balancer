type RequestInitWithTimeout = NodeJS.fetch.RequestInit & { timeout: number };

/**
 * Normal fetch but with a timeout.
 * It will throw an exception and abort the fetch if the timeout is met.
 */
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

/**
 * Fetch data with an url, if it fails it will try one more time with an alternative url.
 * The getFetchUrl() should return a new url everytime it gets called.
 */
async function fetchAndRetryDifferentUrl(getFetchUrl: () => string, options: RequestInitWithTimeout): Promise<Response> {
  let url = getFetchUrl();
  try {
    let response = await fetchWithTimeout(url, options);
    return response;
  } catch (error) {
    //Retry 1 more time with an alternative url
    let altUrl = getFetchUrl();
    altUrl = altUrl !== url ? altUrl : getFetchUrl(); // Make sure altUrl is not the same with the fail url

    let response = await fetchWithTimeout(altUrl, options);
    return response;
  }
}

export { fetchWithTimeout, fetchAndRetryDifferentUrl, RequestInitWithTimeout };
