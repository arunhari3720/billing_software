import http from "./http";
export const userService = {
  list: () => http.get("/users"),
  create: (d) => http.post("/users", d),
  update: (id, d) => http.patch(`/users/${id}`, d),
  remove: (id) => http.delete(`/users/${id}`),
};
