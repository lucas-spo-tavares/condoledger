export const handler = async (event) => {
  return {
    statusCode: 200,
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      message: "CondoLedger backend is running.",
      method: event?.requestContext?.http?.method ?? null,
      path: event?.requestContext?.http?.path ?? null,
    }),
  };
};
