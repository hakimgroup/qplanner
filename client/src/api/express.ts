import axios from "axios";

const api = axios.create({
	baseURL: import.meta.env.VITE_EXPRESS_URL,
});

// api.defaults.headers.common['Authorization'] = 'AUTH TOKEN FROM api';
// api.interceptors.request...

export default api;
