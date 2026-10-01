import http from "./http";
export const stockService = { summary: () => http.get("/stock") };
