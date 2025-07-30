// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';


import { server } from './mocks/serve';

// Establece el servidor de MSW antes de que se ejecuten todas las pruebas.
beforeAll(() => server.listen());

// Restablece cualquier controlador de solicitud que pueda haberse añadido
// durante las pruebas, para que no interfieran con otras pruebas.
afterEach(() => server.resetHandlers());

// Limpia el servidor de MSW después de que todas las pruebas hayan terminado.
afterAll(() => server.close());

// Mock para localStorage, ya que no existe en el entorno de prueba de JSDOM
const localStorageMock = (function() {
  let store = {};
  return {
    getItem: function(key) {
      return store[key] || null;
    },
    setItem: function(key, value) {
      store[key] = value.toString();
    },
    removeItem: function(key) {
      delete store[key];
    },
    clear: function() {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });