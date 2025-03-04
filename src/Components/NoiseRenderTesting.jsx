import React, { useEffect, useState, useRef } from "react";

const biomes = {
  WATER: "#1f78b4",
  BEACH: "#ffe29a",
  FOREST: "#006400",
  JUNGLE: "#228b22",
  SAVANNAH: "#c2b280",
  DESERT: "#edc9af",
  SNOW: "#ffffff",
};

const getBiomeColor = (e) => {
  if (e < 0.1) return biomes.WATER;
  else if (e < 0.2) return biomes.BEACH;
  else if (e < 0.3) return biomes.FOREST;
  else if (e < 0.5) return biomes.JUNGLE;
  else if (e < 0.7) return biomes.SAVANNAH;
  else if (e < 0.9) return biomes.DESERT;
  else return biomes.SNOW;
};

const apiurl = "https://localhost:7085/api/Noise/generate";

const NoiseRenderTesting = ({ width, height, scale }) => {
  const [noiseData, setNoiseData] = useState([]);
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(apiurl, {
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

    fetchData();
  }, [width, height, scale]);

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
    }
  }, [noiseData, width, height]);

  return (
    <div className="flex flex-col items-center">
      {loading && <p className="text-gray-400 mb-2">Laddar karta...</p>}
      <canvas ref={canvasRef} className="border border-gray-600" />
    </div>
  );
};

export default NoiseRenderTesting;
