import http from "./http";
export const productService = {
  list: () => http.get("/products"),
  create: (d) => http.post("/products", d),
  update: (id, d) => http.patch(`/products/${id}`, d),
  remove: (id) => http.delete(`/products/${id}`),
};
