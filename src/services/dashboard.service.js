import http from "./http";
export const dashboardService = {
  agency: () => http.get("/dashboard/agency"),
  master: () => http.get("/dashboard/master"),
};
