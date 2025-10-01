import apiClient from './apiClient';

export const getReservations = async () => {
  try {
    const response = await apiClient.get('/reservations');
    return response.data;
  } catch (error) {
    console.error('Error fetching reservations:', error);
    throw error;
  }
};

export const createReservation = async (seatId) => {
  try {
    const response = await apiClient.post('/reservations', { seatId });
    return response.data;
  } catch (error) {
    console.error('Error creating reservation:', error);
    throw error;
  }
};

export const cancelReservation = async (reservationId) => {
  try {
    const response = await apiClient.delete(`/reservations/${reservationId}`);
    return response.data;
  } catch (error) {
    console.error('Error canceling reservation:', error);
    throw error;
  }
};
