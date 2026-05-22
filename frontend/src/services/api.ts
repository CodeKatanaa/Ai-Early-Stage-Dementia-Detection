const BASE_URL = "http://localhost:5050/api";

export const getToken = () => localStorage.getItem("mg_token") || "";
export const setToken = (t: string) => localStorage.setItem("mg_token", t);
export const clearToken = () => localStorage.removeItem("mg_token");

async function req(method: string, path: string, body?: unknown, auth = true): Promise<any> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (auth) headers["Authorization"] = "Bearer " + getToken();
  const res = await fetch(BASE_URL + path, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "HTTP " + res.status);
  return data;
}

export const apiSignup = (d: any) => req("POST", "/signup", d, false).then((r: any) => { setToken(r.token); return r; });
export const apiLogin = (email: string, password: string) => req("POST", "/login", { email, password }, false).then((r: any) => { setToken(r.token); return r; });
export const apiLogout = () => clearToken();
export const apiGetMe = () => req("GET", "/me").then((r: any) => r.user);
export const apiGetHistory = () => req("GET", "/history").then((r: any) => r.history);
export const apiAssess = (payload: any) => req("POST", "/assess", payload);
export const apiUpdateProfile = (d: any) => req("PUT", "/profile", d).then((r: any) => r.user);
