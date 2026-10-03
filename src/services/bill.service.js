import http from "./http";

export const billService = {
  list: () => http.get("/bills/get-bills"),

  create: (data) => http.post("/bills/create-bill", data),

  get: (id) => http.get(`/bills/get-bill/${id}`),

  profitReport: (params = {}) =>
    http.get("/bills/get-profit-report", {
      params,
    }),
};