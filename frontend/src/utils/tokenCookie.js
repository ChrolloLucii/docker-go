import Cookies from "js-cookie";

export function setToken(token) {
  Cookies.set("token", token, { expires: 7, sameSite: "strict" });
}

export function getToken() {
  return Cookies.get("token");
}

export function removeToken() {
  Cookies.remove("token");
}
