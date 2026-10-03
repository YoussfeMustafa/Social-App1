import axiosInstance from './axiosInstance';

export const authApi = {
  // POST /users/signup
  signup: async (userData) => {
    const response = await axiosInstance.post('/users/signup', userData);
    return response.data;
  },

  // POST /users/signin (accepts email, username, or login + password)
  signin: async (credentials) => {
    const response = await axiosInstance.post('/users/signin', credentials);
    return response.data;
  },

  // GET /users/profile-data
  getMyProfile: async () => {
    const response = await axiosInstance.get('/users/profile-data');
    return response.data;
  },

  // PATCH /users/change-password
  changePassword: async (passwords) => {
    const response = await axiosInstance.patch('/users/change-password', passwords);
    return response.data;
  },

  // PUT /users/upload-photo (FormData with 'photo' file)
  uploadPhoto: async (formData) => {
    const response = await axiosInstance.put('/users/upload-photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
