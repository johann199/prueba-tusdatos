import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import AuthApi from '../../api/AuthApi';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const initializeRef = useRef(false);

  useEffect(() => {
    // Prevenir doble ejecución en StrictMode
    if (initializeRef.current) return;
    initializeRef.current = true;

    const initializeAuth = async () => {
      try {
        const token = AuthApi.getToken();
        
        if (token) {
          AuthApi.setToken(token);
          
          const userData = localStorage.getItem('user_data');
          if (userData) {
            try {
              const parsedUser = JSON.parse(userData);
              setUser(parsedUser);
              setIsAuthenticated(true);
            } catch (parseError) {
              localStorage.removeItem('user_data');
              setIsAuthenticated(true);
            }
          } else {
            setIsAuthenticated(true);
          }
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        AuthApi.logout();
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    AuthApi.setupInterceptors();
    initializeAuth();
  }, []);

  const login = async (credentials) => {
    try {
      setIsLoading(true);
      
      const response = await AuthApi.login(credentials);
      
      if (!response.access_token) {
        throw new Error('No se recibió token de acceso del servidor');
      }
      
      AuthApi.setToken(response.access_token);
      setIsAuthenticated(true);
      
      if (response.user) {
        setUser(response.user);
        
        try {
          localStorage.setItem('user_data', JSON.stringify(response.user));
        } catch (storageError) {
          // Silencioso - no fallar el login por esto
        }
      }
      
      return response;
      
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
      AuthApi.logout();
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    AuthApi.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const register = async (userData) => {
    try {
      setIsLoading(true);
      const response = await AuthApi.register(userData);
      return response;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    register,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;