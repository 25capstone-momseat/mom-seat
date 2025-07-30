import React, { useState } from "react";

function OCR() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);

  const uploadAndOCR = () => {
    if (!file) {
      alert("이미지를 업로드해주세요.");
      return;
    }
    // 임시 OCR 결과
    setResult({
      name: "홍길순",
      hospital: "맘편한병원",
      dueDate: "2025-01-01",
    });
  };

  const editResult = () => alert("수정 기능 (미구현)");
  const registerResult = () => alert("등록 완료");

  return (
    <div className="container">
      <h2>임신확인서를 업로드해주세요</h2>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files[0])}
      />
      <button onClick={uploadAndOCR}>OCR 처리하기</button>

      {result && (
        <div id="ocrResult" style={{ marginTop: "30px" }}>
          <h3>자동 추출된 정보</h3>
          <label>이름</label>
          <input type="text" defaultValue={result.name} />
          <label>기관명</label>
          <input type="text" defaultValue={result.hospital} />
          <label>예정일</label>
          <input type="text" defaultValue={result.dueDate} />
          <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
            <button onClick={editResult}>수정</button>
            <button onClick={registerResult}>등록</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default OCR;
