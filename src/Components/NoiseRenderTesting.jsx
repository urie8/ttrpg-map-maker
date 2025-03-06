import React, { useEffect, useState, useRef } from "react";

const biomes = {
  LIGHT_FOREST: "#7cfc00", // Light green for sparse forest
  DENSE_FOREST: "#006400", // Dark green for deep forest
  RAINFOREST: "#228b22", // Jungle-like rainforest
  TAIGA: "#2e8b57", // Cold, northern forest (Taiga)
  MANGROVE: "#556b2f", // Swampy mangrove forest
};

const getBiomeColor = (e) => {
  if (e < 0.6) return biomes.MANGROVE; // Lowland swampy areas
  else if (e < 0.7) return biomes.LIGHT_FOREST; // Sparse trees
  else if (e < 0.9) return biomes.DENSE_FOREST; // Normal dense forest
  else if (e < 1.1) return biomes.RAINFOREST; // Tropical forest
  else return biomes.TAIGA; // Cold, northern forest
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

      ctx.strokeRect(0, 0, canvas.width, canvas.height);

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
    <div className="flex flex-col items-center">
      {loading && <p className="text-gray-400 mb-2">Laddar karta...</p>}
      <canvas ref={canvasRef} className="border border-gray-600" />
    </div>
  );
};

export default NoiseRenderTesting;
