// src/utils/auth.js

export const getToken = () => {
  return sessionStorage.getItem("token") || localStorage.getItem("token");
};

export const getUser = () => {
  const user = sessionStorage.getItem("user") || localStorage.getItem("user");
  try {
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

export const isAuthenticated = () => {
  return !!getToken();
};

export const setAuth = (token, user) => {
  if (token) {
    sessionStorage.setItem("token", token);
    localStorage.setItem("token", token);
  }
  if (user) {
    const userStr = JSON.stringify(user);
    sessionStorage.setItem("user", userStr);
    localStorage.setItem("user", userStr);
  }
};

export const logout = () => {
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("user");
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/login";
};