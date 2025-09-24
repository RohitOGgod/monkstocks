import axios from "axios";

// Use .env if present; fall back to localhost:5000
const fallback = "http://localhost:5000";
const baseURL =
  (process.env.REACT_APP_STOCKS_API && process.env.REACT_APP_STOCKS_API.trim()) ||
  fallback;

// Default axios instance
const api = axios.create({ baseURL });
// Attach auth token if present
api.interceptors.request.use((config) => {
  try {
    const profileRaw = localStorage.getItem('profile');
    if (profileRaw) {
      const profile = JSON.parse(profileRaw);
      const token = profile?.token;
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  } catch (e) {
    // ignore malformed profile
  }
  return config;
});

// ===== Stocks =====
export const fetchStocks = () => api.get("/stocks");
export const fetchStockById = (id) => api.get(`/stocks/${id}`);
// Compatibility
export const fetchStock = fetchStockById;

// ===== Purchased (investments) =====
export const getPurchasedStocks = () => api.get("/purchased");
export const purchasedStocks = getPurchasedStocks; // expected by actions
export const purchasedStock = (id) => api.get(`/purchased/${id}`); // GET one
export const addPurchasedStock = (data) => api.post("/purchased", data);
export const updatePurchasedStock = (id, data) => api.patch(`/purchased/${id}`, data);
export const removePurchasedStock = (id) => api.delete(`/purchased/${id}`);
// Compatibility aliases
export const fetchPurchasedStocks = getPurchasedStocks;
// ===== Transactions =====
export const getTransactions = () => api.get("/transactions");
export const addTransaction = (data) => api.post("/transactions", data);
// Compatibility
export const fetchTransactions = getTransactions;

// ===== User/Auth =====
export const register = (data) => api.post("/user/register", data);
export const login = (data) => api.post("/user/login", data);
export const logout = () => api.post("/user/logout");
// Additional user endpoints expected by actions
export const userInfo = () => api.get("/user/userinfo");
export const updateUsername = (data) => api.patch("/user/username", data);
export const removeUser = () => api.delete("/user/removeuser");

// ===== Logs =====
export const getLogs = () => api.get("/logs");
export const addLog = (data) => api.post("/logs", data);
// Compatibility
export const fetchLogs = getLogs;

export default api;
