import { createContext, useContext, useState, useEffect } from 'react';
import { login as loginAPI, register as registerAPI } from '../api/authService';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const res = await loginAPI(credentials);
      const data = res.data;
      if (data.success) {
        const authData = data.data;
        const tokenValue = authData.accessToken;
        const userData = {
          id: authData.userId,
          name: authData.name,
          email: authData.email,
          role: authData.role,
        };
        localStorage.setItem('token', tokenValue);
        localStorage.setItem('user', JSON.stringify(userData));
        setToken(tokenValue);
        setUser(userData);
        toast.success('Welcome back! 🎉');
        return { success: true, role: authData.role };
      }
      toast.error(data.message || 'Login failed');
      return { success: false, message: data.message };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const signup = async (userData) => {
    try {
      const res = await registerAPI(userData);
      const data = res.data;
      if (data.success) {
        toast.success('Account created successfully! Please login.');
        return { success: true };
      }
      toast.error(data.message || 'Registration failed');
      return { success: false, message: data.message };
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully');
  };

  const value = { user, token, loading, login, signup, logout, isAuthenticated: !!token };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
