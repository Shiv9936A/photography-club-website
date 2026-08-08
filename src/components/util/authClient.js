import axios from "axios";

const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL || "http://localhost:5000/api";
const AUTH_TOKEN_KEY = "pclub_auth_token";
const authEventListeners = new Set();

const AUTH_ERROR_MESSAGES = {
  expired_session: "Your session expired. Please sign in again.",
  unauthorized_access: "You do not have access to this area.",
  email_domain_restriction: "NITK email required for this page.",
  login_failure: "Login failed. Please try again.",
  access_denied: "You do not have access to this area.",
};

const emitAuthEvent = (event) => {
  authEventListeners.forEach((listener) => {
    listener(event);
  });
};

const normalizeAuthMessage = (status, message = "") => {
  const text = message.toLowerCase();

  if (text.includes("expired token")) {
    return { code: "expired_session", message: AUTH_ERROR_MESSAGES.expired_session, clearSession: true };
  }

  if (
    text.includes("invalid token") ||
    text.includes("missing bearer token") ||
    text.includes("account not found")
  ) {
    return {
      code: "unauthorized_access",
      message: AUTH_ERROR_MESSAGES.unauthorized_access,
      clearSession: true,
    };
  }

  if (text.includes("non-nitk email")) {
    return {
      code: "email_domain_restriction",
      message: AUTH_ERROR_MESSAGES.email_domain_restriction,
      clearSession: false,
    };
  }

  if (text.includes("insufficient role")) {
    return {
      code: "access_denied",
      message: AUTH_ERROR_MESSAGES.access_denied,
      clearSession: false,
    };
  }

  if (
    text.includes("invalid google token") ||
    text.includes("email not verified") ||
    text.includes("google token is required") ||
    text.includes("login failed")
  ) {
    return {
      code: "login_failure",
      message: AUTH_ERROR_MESSAGES.login_failure,
      clearSession: false,
    };
  }

  if (status === 401) {
    return {
      code: "unauthorized_access",
      message: AUTH_ERROR_MESSAGES.unauthorized_access,
      clearSession: true,
    };
  }

  if (status === 403) {
    return {
      code: "access_denied",
      message: AUTH_ERROR_MESSAGES.access_denied,
      clearSession: false,
    };
  }

  return null;
};

export const getStoredAuthToken = () => localStorage.getItem(AUTH_TOKEN_KEY);

export const setStoredAuthToken = (token) => {
  if (token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }
};

export const authClient = axios.create({
  baseURL: AUTH_API_URL,
  timeout: 10000,
});

export const subscribeAuthEvents = (listener) => {
  authEventListeners.add(listener);

  return () => {
    authEventListeners.delete(listener);
  };
};

authClient.interceptors.request.use((config) => {
  const token = getStoredAuthToken();

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

authClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message || "";
    const normalized = normalizeAuthMessage(status, message);

    if (normalized) {
      emitAuthEvent({
        type: "auth-error",
        ...normalized,
      });
    }

    return Promise.reject(error);
  },
);

export { AUTH_TOKEN_KEY };
