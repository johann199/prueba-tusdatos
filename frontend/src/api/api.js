import axios from 'axios';
const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json', 
    },
    timeout: 10000, 
});

api.interceptors.request.use(
  (config) => {
    console.log('Haciendo request a:', config.baseURL + config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log('Respuesta recibida:', response.status);
    return response;
  },
  (error) => {
    console.error('Error en respuesta:', error.response?.status, error.message);
    return Promise.reject(error);
  }
);

export default api;