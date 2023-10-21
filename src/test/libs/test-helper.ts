function jsonOk(body: Record<string, unknown>) {
  var mockResponse: Response = new Response(JSON.stringify(body), {
    // & { json: () => any }
    status: 200,
    headers: {
      "Content-type": "application/json",
    },
  });

  // mockResponse.json = () => Promise.resolve(body);

  return Promise.resolve(mockResponse);
}

// function jsonOk(body: unknown) {
//   const mockedResponse = {
//     status: 200,
//     json: () => body,
//   };

//   return Promise.resolve(mockedResponse);
// }

export { jsonOk };
