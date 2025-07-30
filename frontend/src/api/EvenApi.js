import axios from "./api";

class EventApi {
    static fetchEvents = () => {
        return axios.get(`/api/events`);
    }

    static createEvent(eventData) {
        return axios.post('/api/events/registrar/', eventData);
    }

    static getEvent(eventId) {
        return axios.get(`/api/events/${eventId}`);
    }

    static updateEvent(eventId, eventData) {
        return axios.put(`/api/events/actualizar/${eventId}`, eventData);
    }

    static deleteEvent(eventId) {
        return axios.delete(`/api/events/eliminar/${eventId}`);
    }

    static registerEventUser(eventId){
        return axios.post(`/api/events/registro/evento/${eventId}`);

    }
}

export default EventApi;