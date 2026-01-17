import { createContext, useContext, useState } from "react";
import api from "../utils/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("accessToken"));
  const [user, setUser] = useState(token ? { username: "User" } : null);

  const login = async (username, password) => {
    try {
      const response = await api.post("login/", { username, password });
      const { access, refresh } = response.data;

      localStorage.setItem("accessToken", access);
      localStorage.setItem("refreshToken", refresh);
      setToken(access);
      setUser({ username });
      return true;
    } catch (error) {
      console.error("Login failed", error);
      throw error;
    }
  };

  const register = async (username, email, password) => {
    try {
      await api.post("register/", { username, email, password });
      return true;
    } catch (error) {
      console.error("Registration failed", error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
