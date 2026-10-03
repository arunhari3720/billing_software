import http from "./http";

export const stockService = {
  summary: () => http.get("/stock/get-stock-summary"),

  profitReport: (params = {}) =>
    http.get("/bills/get-profit-report", {
      params,
    }),
};