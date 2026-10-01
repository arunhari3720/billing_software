import http from "./http";
export const storeService = {
  list: () => http.get("/stores"),
  create: (d) => http.post("/stores", d),
  update: (id, d) => http.patch(`/stores/${id}`, d),
  remove: (id) => http.delete(`/stores/${id}`),
};
