const { broadcast } = require('../utils/websocket');
const FirestoreSeat = require('../models/FirestoreSeat');

const seatController = {
  /**
   * 하드웨어로부터 좌석 상태 업데이트 요청을 처리합니다.
   * PATCH /api/seats/:seatId/status
   */
  async updateSeatStatus(req, res, next) {
    const { seatId } = req.params;
    const { status } = req.body; // e.g., 'occupied', 'available'

    if (!seatId || !status) {
      return res.status(400).json({ message: 'seatId와 status는 필수입니다.' });
    }

    try {
      // 1. 데이터베이스에서 좌석 상태 업데이트
      const updatedSeat = await FirestoreSeat.updateStatus(seatId, status);

      if (!updatedSeat) {
        return res.status(404).json({ message: `ID가 ${seatId}인 좌석을 찾을 수 없습니다.` });
      }

      // 2. 웹소켓으로 모든 클라이언트에게 변경사항 브로드캐스트
      broadcast({
        type: 'SEAT_STATUS_UPDATED',
        payload: updatedSeat
      });

      // 3. 성공 응답 전송
      res.status(200).json({
        message: `좌석 ${seatId}의 상태가 ${status}(으)로 업데이트되었습니다.`,
        data: updatedSeat
      });

    } catch (error) {
      next(error); // 에러 핸들링 미들웨어로 전달
    }
  }

  // 다른 좌석 관련 컨트롤러 함수들...
};

module.exports = seatController;