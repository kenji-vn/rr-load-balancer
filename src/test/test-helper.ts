function jsonOk(body: Record<string, unknown>) {
  var mockResponse: Response = new Response(JSON.stringify(body), {
    status: 200,
    headers: {
      "Content-type": "application/json",
    },
  });

  return Promise.resolve(mockResponse);
}

export { jsonOk };
