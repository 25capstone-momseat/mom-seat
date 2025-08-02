import api from '../config/api';

export const seatService = {
  // 좌석 조회
  getAvailableSeats: async (trainId, carNumber) => {
    const response = await api.get(`/seats/available`, {
      params: { trainId, carNumber }
    });
    return response.data;
  },

  // 좌석 예약
  reserveSeat: async (seatData) => {
    const response = await api.post('/seats/reserve', seatData);
    return response.data;
  },

  // 예약 취소
  cancelReservation: async (reservationId) => {
    const response = await api.delete(`/seats/reservation/${reservationId}`);
    return response.data;
  },

  // 내 예약 조회
  getMyReservations: async () => {
    const response = await api.get('/seats/my-reservations');
    return response.data;
  }
};