import { http } from "/src/utils/http";

//登录
export const login = (data: any) => http({
    url: "login",
    method: "GET",
    data
});