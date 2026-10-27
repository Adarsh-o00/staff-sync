import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const res = await API.get('/auth/me');
          setUser(res.data.data || res.data);
        } catch (err) {
          console.error('Failed to fetch user', err);
          logout();
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await API.post('/auth/login', { email, password });
    const data = res.data;
    const newToken = data.token;
    const currentUser = data.user || data;
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(currentUser);
    return currentUser;
  };

  const register = async (name, email, password, role, department, designation) => {
    const res = await API.post('/auth/register', { name, email, password, role, department, designation });
    const data = res.data;
    const newToken = data.token;
    const currentUser = data.user || data;
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(currentUser);
    return currentUser;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
