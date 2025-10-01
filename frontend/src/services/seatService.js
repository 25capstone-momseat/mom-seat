import apiClient from './apiClient';

export const getSeats = async () => {
  try {
    const response = await apiClient.get('/seats');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching seats:', error);
    throw error;
  }
};
