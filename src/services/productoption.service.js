import http from "./http";

export const productOptionService = {
  list: async (type) => {
    const response = await http.get("/product-options/getproducts", {
      params: { type },
    });

    return response.data;
  },

  create: async (data) => {
    const response = await http.post("/product-options/createproducts", data);

    return response.data;
  },
};