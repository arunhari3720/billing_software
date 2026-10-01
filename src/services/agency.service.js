import http from "./http";
export const agencyService = {
  list: () => http.get("/agencies"),
  create: (d) => http.post("/agencies", d),
  toggle: (id, active) => http.patch(`/agencies/${id}/status`, { active }),
};
