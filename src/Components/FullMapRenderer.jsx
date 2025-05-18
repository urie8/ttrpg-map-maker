import React, { useEffect, useState, useRef } from "react";
import { bspApi, noiseApi } from "../constants/api";
import { biomes } from "../constants/biomes";

const FullMapRenderer = ({ width, height, scale }) => {
  const [noiseData, setNoiseData] = useState([]);
  const [bspData, setbspData] = useState([]);
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef(null);

  const postData = {
    X: 10,
    Y: 10,
    Width: 100,
    Height: 100,
    MinRoomWidth: 50,
    MinRoomHeight: 40,
  };

  useEffect(() => {
    const fetchNoiseData = async () => {
      setLoading(true);
      try {
        const response = await fetch(noiseApi, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ width, height, noisescale: scale }),
        });
        const data = await response.json();
        setNoiseData(data);
      } catch (error) {
        console.error("Error fetching noise data:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchBSPData = async () => {
      try {
        const response = await fetch(bspApi, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(postData),
        });
        const data = await response.json();
        setbspData(data); // Adjust this according to the structure of your JSON
      } catch (error) {
        console.error("Error fetching noise data:", error);
      }
    };

    fetchNoiseData();
    fetchBSPData();
  }, [width, height, scale]);

  function drawRooms(rooms) {
    if (!rooms || rooms.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const gridSize = 50;

    const minX = Math.min(...rooms.map((r) => r.x));
    const minY = Math.min(...rooms.map((r) => r.y));
    const maxX = Math.max(...rooms.map((r) => r.x + r.width));
    const maxY = Math.max(...rooms.map((r) => r.y + r.height));

    const buildingWidth = maxX - minX;
    const buildingHeight = maxY - minY;

    const buildingWidthInCells = Math.ceil(buildingWidth / gridSize);
    const buildingHeightInCells = Math.ceil(buildingHeight / gridSize);

    const maxCols = Math.floor(canvas.width / gridSize);
    const maxRows = Math.floor(canvas.height / gridSize);

    const maxOffsetCol = maxCols - buildingWidthInCells;
    const maxOffsetRow = maxRows - buildingHeightInCells;

    const offsetCol = Math.floor(Math.random() * maxOffsetCol);
    const offsetRow = Math.floor(Math.random() * maxOffsetRow);

    const offsetX = offsetCol * gridSize;
    const offsetY = offsetRow * gridSize;

    rooms.forEach((room) => {
      const localX = room.x - minX;
      const localY = room.y - minY;

      const alignedX = offsetX + Math.round(localX / gridSize) * gridSize;
      const alignedY = offsetY + Math.round(localY / gridSize) * gridSize;
      const alignedWidth = Math.round(room.width / gridSize) * gridSize;
      const alignedHeight = Math.round(room.height / gridSize) * gridSize;

      ctx.fillStyle = "lightblue";
      ctx.fillRect(alignedX, alignedY, alignedWidth, alignedHeight);

      ctx.strokeStyle = "darkblue";
      ctx.lineWidth = 2;
      ctx.strokeRect(alignedX, alignedY, alignedWidth, alignedHeight);
    });
  }

  const getBiomeColor = (e) => {
    if (e < 0.5) return biomes.MANGROVE; // Lowland swampy areas
    else if (e < 0.8) return biomes.LIGHT_FOREST; // Sparse trees
    else if (e < 0.9) return biomes.DENSE_FOREST; // Normal dense forest
    else if (e < 1.1) return biomes.RAINFOREST; // Tropical forest
    else return biomes.TAIGA; // Cold, northern forest
  };

  // Your current useEffect
  useEffect(() => {
    if (noiseData.length > 0 && bspData.length > 0) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      canvas.width = width * 5;
      canvas.height = height * 5;

      const cellWidth = canvas.width / width;
      const cellHeight = canvas.height / height;

      // ✅ Draw noise map first
      noiseData.forEach((row, rowIndex) => {
        row.forEach((value, colIndex) => {
          const x = colIndex * cellWidth;
          const y = rowIndex * cellHeight;
          ctx.fillStyle = getBiomeColor(value);
          ctx.fillRect(x, y, cellWidth, cellHeight);
        });
      });

      // ✅ Then draw rooms on top
      drawRooms(bspData);

      // ✅ Then draw grid lines
      ctx.strokeStyle = "rgb(0 0 0 / 40%)";
      for (let i = 0; i < canvas.width; i += 50) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
      }

      for (let i = 0; i < canvas.height; i += 50) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }
    }
  }, [noiseData, bspData, width, height]);

  return (
    <div>
      <div className="flex flex-col items-center">
        {loading && <p className="text-gray-400 mb-2">Laddar karta...</p>}
        <canvas ref={canvasRef} className="border border-gray-600" />
      </div>
    </div>
  );
};

export default FullMapRenderer;
