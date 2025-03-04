import React, { useState, useRef } from "react";

const apiurl = "https://localhost:7085/api/BSP/generateBSP";

const BSPRenderingCanvas = ({ width, height, minRoomWidth, minRoomHeight }) => {
  const [rum, setRum] = useState([]);
  const [laddar, setLaddar] = useState(false);
  const canvasRef = useRef(null);

  const genereraBSP = async () => {
    setLaddar(true);
    const requestData = {
      X: 0,
      Y: 0,
      Width: width,
      Height: height,
      MinRoomWidth: minRoomWidth,
      MinRoomHeight: minRoomHeight,
    };

    try {
      const response = await fetch(apiurl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });
      const data = await response.json();
      setRum(data);
      ritaRum(data);
    } catch (error) {
      console.error("Fel vid generering av BSP:", error);
    } finally {
      setLaddar(false);
    }
  };

  const ritaRum = (rum) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "white"; // Kantfärg för rummen
    ctx.lineWidth = 2;

    rum.forEach((rum) => {
      ctx.strokeRect(rum.X, rum.Y, rum.Width, rum.Height);
    });
  };

  return (
    <div className="flex flex-col items-center">
      {laddar && <p className="text-gray-400">Genererar dungeon...</p>}
      <canvas
        ref={canvasRef}
        width={500}
        height={500}
        className="border border-gray-600 bg-black"
      />
    </div>
  );
};

export default BSPRenderingCanvas;
