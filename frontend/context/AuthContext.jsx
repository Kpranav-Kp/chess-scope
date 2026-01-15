import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem("access_token"));

    useEffect(() => {
        // Determine auth state from presence of token
        if (token) {
            // In a real app, you might validate the token here via an API call
            // For now, we assume if we have a token, we are logged in
            // We could decode the JWT to get the username if needed
            setUser({ username: "User" });
        } else {
            setUser(null);
        }
        setLoading(false);
    }, [token]);

    const login = async (username, password) => {
        try {
            const response = await fetch("http://localhost:8000/api/login/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                throw new Error("Invalid credentials");
            }

            const data = await response.json();
            localStorage.setItem("access_token", data.access);
            localStorage.setItem("refresh_token", data.refresh);
            setToken(data.access);
            return true;
        } catch (error) {
            console.error("Login failed:", error);
            throw error;
        }
    };

    const register = async (username, email, password) => {
        try {
            const response = await fetch("http://localhost:8000/api/register/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, email, password }),
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(JSON.stringify(err));
            }
            return true;
        } catch (error) {
            console.error("Registration failed:", error);
            throw error;
        }
    }

    const logout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading, token }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
