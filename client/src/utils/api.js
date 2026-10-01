import api from "./axios";
import { ENDPOINTS } from "./endpoints";

// ---------- Courses ----------
export const getCourses = async (params = {}) => {
  const res = await api.get(ENDPOINTS.courses, { params });
  return res.data;
};

export const getCourseById = async (id) => {
  const res = await api.get(ENDPOINTS.courseById(id));
  return res.data;
};

// ---------- Smart Recommend ----------
export const getNextQuestion = async (body) => {
  const res = await api.post(ENDPOINTS.smartRecommendNext, body);
  return res.data;
};

export const getSmartRecommendations = async (body) => {
  const res = await api.post(ENDPOINTS.smartRecommend, body);
  return res.data;
};

// ---------- Recommendations ----------
export const getRecommendations = async () => {
  const res = await api.get(ENDPOINTS.recommendations);
  return res.data;
};

// ---------- Career Path ----------
export const generateCareerPathAPI = async (body) => {
  const res = await api.post(ENDPOINTS.careerPath, body);
  return res.data;
};

// ---------- Enrollments ----------
export const getUserEnrollments = async () => {
  const res = await api.get(ENDPOINTS.enrollments);
  return res.data;
};

export const updateProgressAPI = async (enrollmentId, body) => {
  const res = await api.put(`${ENDPOINTS.enrollments}/${enrollmentId}/progress`, body);
  return res.data;
};

export default api;
