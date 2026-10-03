import axiosInstance from './axiosInstance';

export const usersApi = {
  // GET /users/:userId/profile
  getUserProfile: async (userId) => {
    const response = await axiosInstance.get(`/users/${userId}/profile`);
    return response.data;
  },

  // GET /users/:userId/posts
  getUserPosts: async (userId, { page = 1, limit = 20 } = {}) => {
    const response = await axiosInstance.get(`/users/${userId}/posts`, {
      params: { page, limit },
    });
    return response.data;
  },

  // PUT /users/:userId/follow
  toggleFollow: async (userId) => {
    const response = await axiosInstance.put(`/users/${userId}/follow`);
    return response.data;
  },

  // GET /users/suggestions?limit=10&page=1
  getSuggestions: async ({ limit = 10, page = 1 } = {}) => {
    const response = await axiosInstance.get('/users/suggestions', {
      params: { limit, page },
    });
    return response.data;
  },

  // GET /users/bookmarks?page=1&limit=20
  getBookmarks: async ({ page = 1, limit = 20 } = {}) => {
    const response = await axiosInstance.get('/users/bookmarks', {
      params: { page, limit },
    });
    return response.data;
  },
};
