import Cookies from "js-cookie";

const getToken = Cookies.get("_token");

export const AppHeader = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken}`,
};

