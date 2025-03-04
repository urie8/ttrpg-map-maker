import React, { useEffect, useState, useRef } from "react";

const forestBiomes = {
  LIGHT_FOREST: "#9acd32", // Yellow Green
  MEDIUM_FOREST: "#6b8e23", // Olive Drab
  DENSE_FOREST: "#556b2f", // Dark Olive Green
  JUNGLE: "#228b22", // Forest Green
  DARK_FOREST: "#013220", // Very Dark Green
};

const worldMapBiomes = {
  WATER: "#1f78b4",
  BEACH: "#ffe29a",
  GRASS: "#8dc63f",
  MEDIUM_FOREST: "#3a5d0b",
  JUNGLE: "#228b22",
  SAVANNAH: "#c2b280",
  DESERT: "#edc9af",
  SNOW: "#ffffff",
};

const getBiomeColor = (e) => {
  if (e < 0.4) return forestBiomes.LIGHT_FOREST;
  else if (e < 0.7) return forestBiomes.MEDIUM_FOREST;
  else if (e < 1) return forestBiomes.DENSE_FOREST;
  else if (e < 1.2) return forestBiomes.JUNGLE;
  else return forestBiomes.DARK_FOREST;
};

const apiurl = "https://localhost:7085/api/Noise/generate";

const NoiseCanvas = () => {
  const [noiseData, setNoiseData] = useState([]);
  const [postData, setPostData] = useState({});
  const canvasRef = useRef(null);

  function generateData() {}
  function drawMap(biomes) {}

  useEffect(() => {
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

  return (
    <>
      <canvas ref={canvasRef} width={500} height={500} />
      <button>Generate forest</button>
      <button>Generate worldmap</button>
    </>
  );
};

export default NoiseCanvas;
