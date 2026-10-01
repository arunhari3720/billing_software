import http from "./http";
export const authService={
 login:data=>http.post("/auth/login",data),
 register:data=>http.post("/auth/register",data),
 me:()=>http.get("/auth/me")
};
