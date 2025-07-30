import axios  from "./api";

class UserApi {
    static fetchUsers = () => {
        return axios.get(`/api/auth/users`);
    }

    static createUser(userData) {
        return axios.post('/api/auth/registrar/', userData);
    }

    static getUser(userId) {
        return axios.get(`/users/${userId}`);
    }

    static updateUser(userId, userData) {
        return axios.put(`/api/auth/actualizar/${userId}`, userData);
    }

    static deleteUser(userId) {
        return axios.delete(`/api/auth/eliminar/${userId}`);
    }

    static login(credentials) {
        return axios.post(`/auth/login/`, credentials);
    }

    static logout() {
        return axios.post(`/auth/logout/`);
    }

    static changePassword(userId, passwordData) {
        if (!userId || isNaN(userId)) {
            console.warn("User ID inválido:", userId);
            return Promise.reject("User ID inválido");
        }
        return axios.put(`/users/${userId}/password/`, passwordData);
    }
}

export default UserApi;