const destino = async (event) => {
  const response = { batchItemFailures: [] };

  const promises = event.Records.map(async (record) => {
    const body = JSON.parse(record.body);
    const { name, url } = body;

    if (name === "fail") {
      return {
        status: false,
        id: record.messageId,
      };
    }

    return { status: true, id: record.messageId };
  });

  const settledPromises = await Promise.all(promises);

  settledPromises.forEach((promise) => {
    if (!promise.status) {
      response.batchItemFailures.push({ id: promise.id });
    }
  });


  console.log("🚀 ~ response:", response)
  return response;
};

export const main = destino;
