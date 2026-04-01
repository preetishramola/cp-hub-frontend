import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080",
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token to every request if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const signup = (data: {
  name: string; username: string; email: string; password: string;
  codeforcesHandle?: string; leetcodeHandle?: string; codechefHandle?: string;
}) => api.post("/auth/signup", data);

export const login = (data: { email: string; password: string }) =>
  api.post("/auth/login", data);

// Tracker
export const getMyStats = () => api.get("/tracker/stats");
export const refreshStats = (platform: string) =>
  api.post(`/tracker/refresh/${platform}`);

// Profile
export const getMyProfile = () => api.get("/users/me");
export const updateMyProfile = (data: {
  name?: string; codeforcesHandle?: string;
  leetcodeHandle?: string; codechefHandle?: string;
}) => api.put("/users/me", data);
export const getPublicProfile = (username: string) =>
  api.get(`/users/${username}`);

// Leaderboard
export const getLeaderboard = () => api.get("/leaderboard");
export const getLeaderboardByPlatform = (platform: string) =>
  api.get(`/leaderboard/${platform}`);

// Blogs
export const getAllBlogs = () => api.get("/blogs");
export const getBlog = (id: number) => api.get(`/blogs/${id}`);
export const getBlogsByUser = (username: string) =>
  api.get(`/blogs/user/${username}`);
export const createBlog = (data: { title: string; content: string }) =>
  api.post("/blogs", data);
export const updateBlog = (id: number, data: { title: string; content: string }) =>
  api.put(`/blogs/${id}`, data);
export const deleteBlog = (id: number) => api.delete(`/blogs/${id}`);
export const toggleUpvote = (id: number) => api.post(`/blogs/${id}/upvote`);
export const addComment = (id: number, data: { content: string; parentId?: number }) =>
  api.post(`/blogs/${id}/comments`, data);
export const deleteComment = (commentId: number) =>
  api.delete(`/blogs/comments/${commentId}`);

export default api;
