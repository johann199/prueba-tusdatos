import React, { createContext, useState, useContext, useEffect } from 'react';
import AuthApi from '../../api/AuthApi';

// Crear el contexto
const AuthContext = createContext();

// Hook personalizado para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

// Provider del contexto
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verificar autenticación al cargar la aplicación
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = AuthApi.getToken();
        
        if (token) {
          // Configurar el token en axios
          AuthApi.setToken(token);
          
          // IMPORTANTE: Marcar como autenticado si hay token
          setIsAuthenticated(true);
          
          // Obtener datos del usuario (opcional)
          const userData = localStorage.getItem('user_data');
          if (userData) {
            setUser(JSON.parse(userData));
          }
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        AuthApi.logout();
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    // Configurar interceptors
    AuthApi.setupInterceptors();
    initializeAuth();
  }, []);

  // Función de login
  const login = async (credentials) => {
    try {
      setIsLoading(true);
      
      const response = await AuthApi.login(credentials);
      
      // Guardar token
      AuthApi.setToken(response.access_token);
      
      // CRÍTICO: Usar callback para asegurar actualización inmediata
      setIsAuthenticated(true);
      
      // Opcional: guardar datos del usuario si los tienes
      // const userProfile = await AuthApi.getProfile();
      // setUser(userProfile);
      // localStorage.setItem('user_data', JSON.stringify(userProfile));
      
      return response;
    } catch (error) {
      setIsAuthenticated(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Función de logout
  const logout = () => {
    AuthApi.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  // Función de registro
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