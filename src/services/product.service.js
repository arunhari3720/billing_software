import http from "./http";

export const productService = {
  list: () => http.get("/products/get-products"),

  create: (data) =>
    http.post("/products/create-product", data),

  update: (id, data) =>
    http.patch(`/products/update-product/${id}`, data),

  remove: (id) =>
    http.delete(`/products/delete-product/${id}`),

  profitReport: (params = {}) =>
    http.get("/bills/get-profit-report", {
      params,
    }),
};