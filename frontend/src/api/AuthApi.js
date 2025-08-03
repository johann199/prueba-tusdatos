import axios from "./api";

class AuthApi {
  // Login de usuario
  static login = async (credentials) => {
    try {
      // Verificar que tenemos las credenciales
      if (!credentials.email || !credentials.password) {
        throw new Error('Email y contraseña son requeridos');
      }
      const formData = new FormData();
      formData.append('username', credentials.email); // FastAPI OAuth2 espera 'username'
      formData.append('password', credentials.password);

      const response = await axios.post('/api/auth/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      // Validar que tenemos los datos necesarios
      if (!response.data.access_token) {
        throw new Error('El servidor no devolvió un token de acceso');
      }
      return response.data;
    } catch (error) {      
      throw error;
    }
  };

  // Registrar usuario
  static register = async (userData) => {
    try {
      const response = await axios.post('/api/auth/registrar/', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  // Obtener perfil del usuario actual
  static getProfile = async () => {
    try {
      const response = await axios.get('/api/auth/me');
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  // Logout (limpiar token del lado cliente)
  static logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_data');
    delete axios.defaults.headers.common['Authorization'];
  };

  // Verificar si el usuario está autenticado
  static isAuthenticated = () => {
    const token = localStorage.getItem('access_token');
    const isAuth = !!token;
    return isAuth;
  };

  // Obtener token del localStorage
  static getToken = () => {
    const token = localStorage.getItem('access_token');
    return token;
  };

  // Guardar token en localStorage y configurar axios
  static setToken = (token) => {
    if (!token) {
      return;
    }
    localStorage.setItem('access_token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  // Configurar interceptor para agregar token automáticamente
  static setupInterceptors = () => {
    // Request interceptor para agregar token
    axios.interceptors.request.use(
      (config) => {
        const token = AuthApi.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor para manejar errores de autenticación
    axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          AuthApi.logout();
          // Redirigir al login o mostrar mensaje
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  };
}

export default AuthApi;