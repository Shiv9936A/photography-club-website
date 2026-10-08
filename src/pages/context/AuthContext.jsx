import { useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
  authClient,
  setStoredAuthToken,
  getStoredAuthToken,
  subscribeAuthEvents,
} from "../components/util/authClient";
import { AuthContext } from "./authContext";

const normalizeUser = (user) => {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    picture: user.picture ?? null,
    role: user.role ?? "user",
    isNitk: Boolean(user.isNitk),
  };
};

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getStoredAuthToken());
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authNotice, setAuthNotice] = useState(null);

  const clearSession = () => {
    setStoredAuthToken(null);
    setToken(null);
    setUser(null);
  };

  const applySession = (nextToken, nextUser) => {
    setStoredAuthToken(nextToken);
    setToken(nextToken);
    setUser(normalizeUser(nextUser));
    setAuthNotice(null);
  };

  const restoreSession = useCallback(async () => {
    const storedToken = getStoredAuthToken();

    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    setToken(storedToken);

    try {
      const { data } = await authClient.get("/auth/profile");
      const profile = data?.profile || data?.user;

      if (profile) {
        setUser(normalizeUser(profile));
      } else {
        clearSession();
      }
    } catch {
      clearSession();
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void restoreSession();
  }, [restoreSession]);

  useEffect(() => {
    const unsubscribe = subscribeAuthEvents((event) => {
      if (event.type !== "auth-error") {
        return;
      }

      setAuthNotice({
        code: event.code,
        message: event.message,
      });

      if (event.clearSession) {
        clearSession();
      }
    });

    return unsubscribe;
  }, []);

  const loginWithGoogle = async (credentialResponse) => {
    const credential = credentialResponse?.credential;

    if (!credential) {
      setAuthNotice({
        code: "login_failure",
        message: "Login failed. Please try again.",
      });
      throw new Error("Missing Google credential");
    }

    const { data } = await authClient.post("/auth/google", {
      token: credential,
    });

    if (!data?.token || !data?.user) {
      throw new Error("Login failed");
    }

    applySession(data.token, data.user);
    return data;
  };

  const logout = async () => {
    try {
      if (token) {
        await authClient.post("/auth/logout");
      }
    } finally {
      clearSession();
    }
  };

  const clearAuthNotice = () => {
    setAuthNotice(null);
  };

  const value = {
    token,
    user,
    role: user?.role ?? null,
    isNitk: Boolean(user?.isNitk),
    isAuthenticated: Boolean(token && user),
    isLoading,
    authNotice,
    loginWithGoogle,
    logout,
    refreshSession: restoreSession,
    clearAuthNotice,
    setAuthNotice,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
