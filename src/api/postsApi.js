import axiosInstance from './axiosInstance';

export const postsApi = {
  // GET /posts?page=1&limit=10
  getAllPosts: async ({ page = 1, limit = 10 } = {}) => {
    const response = await axiosInstance.get('/posts', {
      params: { page, limit },
    });
    return response.data;
  },

  // GET /posts/feed?only=following&limit=10&page=1
  getFeed: async ({ only = 'following', page = 1, limit = 10, cursor } = {}) => {
    const params = { only, limit };
    if (page) params.page = page;
    if (cursor) params.cursor = cursor;
    const response = await axiosInstance.get('/posts/feed', { params });
    return response.data;
  },

  // GET /posts/:postId
  getPost: async (postId) => {
    const response = await axiosInstance.get(`/posts/${postId}`);
    return response.data;
  },

  // POST /posts (FormData or JSON)
  createPost: async (data) => {
    const isFormData = data instanceof FormData;
    const response = await axiosInstance.post('/posts', data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return response.data;
  },

  // PUT /posts/:postId
  updatePost: async (postId, data) => {
    const isFormData = data instanceof FormData;
    const response = await axiosInstance.put(`/posts/${postId}`, data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return response.data;
  },

  // DELETE /posts/:postId
  deletePost: async (postId) => {
    const response = await axiosInstance.delete(`/posts/${postId}`);
    return response.data;
  },

  // PUT /posts/:postId/like
  toggleLike: async (postId) => {
    const response = await axiosInstance.put(`/posts/${postId}/like`);
    return response.data;
  },

  // PUT /posts/:postId/bookmark
  toggleBookmark: async (postId) => {
    const response = await axiosInstance.put(`/posts/${postId}/bookmark`);
    return response.data;
  },

  // POST /posts/:postId/share
  sharePost: async (postId, shareData) => {
    const response = await axiosInstance.post(`/posts/${postId}/share`, shareData);
    return response.data;
  },

  // GET /posts/:postId/likes?page=1&limit=20
  getPostLikes: async (postId, { page = 1, limit = 20 } = {}) => {
    const response = await axiosInstance.get(`/posts/${postId}/likes`, {
      params: { page, limit },
    });
    return response.data;
  },
};
