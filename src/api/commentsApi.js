import axiosInstance from './axiosInstance';

export const commentsApi = {
  // GET /posts/:postId/comments
  getComments: async (postId, { page = 1, limit = 10 } = {}) => {
    const response = await axiosInstance.get(`/posts/${postId}/comments`, {
      params: { page, limit },
    });
    return response.data;
  },

  // POST /posts/:postId/comments (content + optional image)
  createComment: async (postId, data) => {
    const isFormData = data instanceof FormData;
    const response = await axiosInstance.post(`/posts/${postId}/comments`, data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return response.data;
  },

  // PUT /posts/:postId/comments/:commentId
  updateComment: async (postId, commentId, data) => {
    const isFormData = data instanceof FormData;
    const response = await axiosInstance.put(`/posts/${postId}/comments/${commentId}`, data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return response.data;
  },

  // DELETE /posts/:postId/comments/:commentId
  deleteComment: async (postId, commentId) => {
    const response = await axiosInstance.delete(`/posts/${postId}/comments/${commentId}`);
    return response.data;
  },

  // PUT /posts/:postId/comments/:commentId/like
  toggleCommentLike: async (postId, commentId) => {
    const response = await axiosInstance.put(`/posts/${postId}/comments/${commentId}/like`);
    return response.data;
  },

  // GET /posts/:postId/comments/:commentId/replies
  getReplies: async (postId, commentId, { page = 1, limit = 10 } = {}) => {
    const response = await axiosInstance.get(
      `/posts/${postId}/comments/${commentId}/replies`,
      { params: { page, limit } }
    );
    return response.data;
  },

  // POST /posts/:postId/comments/:commentId/replies
  createReply: async (postId, commentId, data) => {
    const isFormData = data instanceof FormData;
    const response = await axiosInstance.post(
      `/posts/${postId}/comments/${commentId}/replies`,
      data,
      { headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {} }
    );
    return response.data;
  },
};
