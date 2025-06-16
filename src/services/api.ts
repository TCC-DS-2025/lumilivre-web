import axios from 'axios';

// instância do Axios com a URL base da API
const api = axios.create({
  baseURL: 'http://localhost:8080' 
});

export default api;