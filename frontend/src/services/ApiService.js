import axios from "axios";

export const TOKEN_KEY = "authToken";

const api = axios.create({
    baseURL: import.meta.env.VITE_BASE_PATH || "/api",
    timeout: 15000,
});

// attach token to every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(TOKEN_KEY);
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error)
);

// token expired or invalid -> back to login
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error?.response?.status;
        const hadToken = !!error?.config?.headers?.Authorization;
        if (status === 401 && hadToken && !error?.config?.url?.includes("auth/login")) {
            localStorage.removeItem(TOKEN_KEY);
            if (!window.location.pathname.startsWith("/login")) window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

// plain error object for rejectWithValue
export const getApiError = (error) => {
    const result = error?.response?.data;
    const status = error?.response?.status ?? 0;
    // no json body means the api itself did not answer (not running / proxy error)
    const serverDown = !error?.response || (status >= 500 && !result?.message);
    return {
        status,
        message: result?.message || (serverDown ? "Cannot reach the server. Please make sure the API is running." : error?.message) || "Something went wrong",
        errors: result?.errors || null,
    };
};

export default api;
