import http from "./http";
export const optionalBillService = {
  list: () => http.get("/optional-bills"),
  create: (d) => http.post("/optional-bills", d),
};
