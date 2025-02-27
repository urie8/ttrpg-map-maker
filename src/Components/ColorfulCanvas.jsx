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

const NoiseCanvas = () => {
  const [noiseData, setNoiseData] = useState([]);
  const canvasRef = useRef(null);

  useEffect(() => {
    const postData = {
      width: 100,
      height: 100,
      noisescale: 3,
    };

    // POST request to fetch noise data
    const fetchData = async () => {
      try {
        const response = await fetch(apiurl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(postData),
        });
        const data = await response.json();
        setNoiseData(data); // Adjust this according to the structure of your JSON
      } catch (error) {
        console.error("Error fetching noise data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    // Draw on canvas once data is fetched
    if (noiseData.length > 0) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const width = canvas.width;
      const height = canvas.height;

      const maxRows = noiseData.length;
      const maxCols = Math.max(...noiseData.map((row) => row.length));

      const cellWidth = width / maxCols;
      const cellHeight = height / maxRows;

      noiseData.forEach((row, rowIndex) => {
        row.forEach((value, colIndex) => {
          const x = colIndex * cellWidth;
          const y = rowIndex * cellHeight;

          // Get biome color based on noise value
          const color = getBiomeColor(value);
          ctx.fillStyle = color;
          ctx.fillRect(x, y, cellWidth, cellHeight);
        });
      });
    }
  }, [noiseData]);

  return <canvas ref={canvasRef} width={500} height={500} />;
};

export default NoiseCanvas;
