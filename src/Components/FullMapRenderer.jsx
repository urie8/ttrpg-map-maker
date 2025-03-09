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
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    // ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas before drawing new rooms

    console.log("Drawing rooms:", rooms); // Log rooms to check data

    rooms.forEach((room) => {
      console.log(
        `Drawing room at X: ${room.x}, Y: ${room.y}, Width: ${room.width}, Height: ${room.height}`
      ); // Log each room's details

      // Draw the floor of the room (light blue)
      ctx.fillStyle = "lightblue";
      ctx.fillRect(room.x, room.y, room.width, room.height);

      // Draw the walls of the room (darker color)
      ctx.strokeStyle = "darkblue"; // Color of the walls
      ctx.lineWidth = 2; // Set the thickness of the walls
      ctx.strokeRect(room.x, room.y, room.width, room.height); // Draw the walls as a border around the room
    });
  }

  const getBiomeColor = (e) => {
    if (e < 0.5) return biomes.MANGROVE; // Lowland swampy areas
    else if (e < 0.8) return biomes.LIGHT_FOREST; // Sparse trees
    else if (e < 0.9) return biomes.DENSE_FOREST; // Normal dense forest
    else if (e < 1.1) return biomes.RAINFOREST; // Tropical forest
    else return biomes.TAIGA; // Cold, northern forest
  };

  useEffect(() => {
    if (noiseData.length > 0) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      canvas.width = width * 5;
      canvas.height = height * 5;

      const cellWidth = canvas.width / width;
      const cellHeight = canvas.height / height;

      noiseData.forEach((row, rowIndex) => {
        row.forEach((value, colIndex) => {
          const x = colIndex * cellWidth;
          const y = rowIndex * cellHeight;
          ctx.fillStyle = getBiomeColor(value);
          ctx.fillRect(x, y, cellWidth, cellHeight);
        });
      });

      drawRooms(bspData);

      ctx.strokeRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = "rgb(0 0 0 / 40%)";

      for (let i = 0; i < canvas.width; i += 50) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.closePath();
        ctx.stroke();
      }

      for (let i = 0; i < canvas.height; i += 50) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.closePath();
        ctx.stroke();
      }
    }
  }, [noiseData, width, height]);

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
