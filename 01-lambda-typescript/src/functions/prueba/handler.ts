const principal = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Hola mundo modificado",
    }),
  };
};

export const main = principal;
