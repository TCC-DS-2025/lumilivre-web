import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL; // http://localhost:8080

console.log('API está configurada para a URL:', baseURL);

const api = axios.create({
  baseURL: baseURL,
});

export default api;
