import http from "./http";
export const billService = {
  list: () => http.get("/bills"),
  create: (d) => http.post("/bills", d),
  get: (id) => http.get(`/bills/${id}`),
};
