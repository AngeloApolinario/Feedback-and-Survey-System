import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:5050/api",
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers["auth-token"] = token;
  }
  return config;
});

export default {
  register(data) {
    return apiClient.post("/user/register", data);
  },
  login(data) {
    return apiClient.post("/user/login", data);
  },
  getSurveys() {
    return apiClient.get("/surveys");
  },
  createSurvey(data) {
    return apiClient.post("/surveys/create", data);
  },
  getDashboardData() {
    return apiClient.get("/surveys/dashboard");
  },

  getSurveyAnalytics(id) {
    return apiClient.get(`/surveys/${id}/analytics`);
  },
  submitAnswer(data) {
    return apiClient.post("/surveys/answer", data);
  },
  updateSurvey(id, data) {
    return apiClient.put(`/surveys/${id}`, data);
  },
  deleteSurvey(id) {
    return apiClient.delete(`/surveys/${id}`);
  },
};
