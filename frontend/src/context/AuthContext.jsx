
import { createContext, useContext, useState, useEffect } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on page reload
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await API.get("/users/profile", { withCredentials: true });
        console.log("res",res.data);
        
        setUser(res.data.data);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  // Login
  const login = async (formData, apiCallFn) => {
    try {
      const res = await apiCallFn(formData);
      setUser(res.data);
      return { success: true, data: res.data };
    } catch (error) {
      console.log("Login error:", error.response?.data || error.message);
      return { success: false, message: "Invalid credentials!" };
    }
  };

  // Logout
  const logout = async () => {
    await API.post("/auth/logout", {}, { withCredentials: true });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading}}>
      {children}
    </AuthContext.Provider>
  );
};

export  const  useAuth = () => useContext(AuthContext);
