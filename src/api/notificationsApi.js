import axiosInstance from './axiosInstance';

export const notificationsApi = {
  // GET /notifications?unread=false&page=1&limit=10
  getNotifications: async ({ unread = false, page = 1, limit = 10 } = {}) => {
    const response = await axiosInstance.get('/notifications', {
      params: { unread, page, limit },
    });
    return response.data;
  },

  // GET /notifications/unread-count
  getUnreadCount: async () => {
    const response = await axiosInstance.get('/notifications/unread-count');
    return response.data;
  },

  // PATCH /notifications/:notificationId/read
  markAsRead: async (notificationId) => {
    const response = await axiosInstance.patch(`/notifications/${notificationId}/read`);
    return response.data;
  },

  // PATCH /notifications/read-all
  markAllAsRead: async () => {
    const response = await axiosInstance.patch('/notifications/read-all');
    return response.data;
  },
};
