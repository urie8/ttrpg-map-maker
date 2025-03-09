import React, { useState } from "react";
import { Link } from "react-router-dom";
import NoiseRenderTesting from "../Components/NoiseRenderTesting";
import FullMapRenderer from "../Components/FullMapRenderer";

const Simplex = () => {
  const [width, setWidth] = useState(100);
  const [height, setHeight] = useState(100);
  const [scale, setScale] = useState(2.5);

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white p-6">
      {/* Navigeringsknappar */}
      <div className="flex justify-start space-x-4 mb-6">
        <Link
          to="/"
          className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
        >
          🏠 Hem
        </Link>
        <Link
          to="/bsp"
          className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
        >
          🔲 BSP Karta
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-center mb-6 ml-20">
        Generera Noise Karta
      </h1>

      {/* Layout: Parameterruta + Canvas */}
      <div className="flex flex-row items-center justify-center gap-16">
        {/* Parameterruta - Mindre storlek */}
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg w-56">
          <h2 className="text-lg font-semibold mb-2 text-center">Parametrar</h2>

          <div className="grid grid-cols-1 gap-2 mb-3">
            <div>
              <label className="block text-xs mb-1">Bredd</label>
              <input
                type="number"
                value={width}
                onChange={(e) => setWidth(parseInt(e.target.value))}
                className="w-full p-1 bg-gray-700 text-white border border-gray-500 rounded-md text-sm"
              />
            </div>

            <div>
              <label className="block text-xs mb-1">Höjd</label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(parseInt(e.target.value))}
                className="w-full p-1 bg-gray-700 text-white border border-gray-500 rounded-md text-sm"
              />
            </div>

            <div>
              <label className="block text-xs mb-1">Noise Skala</label>
              <input
                type="number"
                value={scale}
                onChange={(e) => setScale(parseInt(e.target.value))}
                className="w-full p-1 bg-gray-700 text-white border border-gray-500 rounded-md text-sm"
              />
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex flex-col items-center">
          <NoiseRenderTesting width={width} height={height} scale={scale} />
          {/* <FullMapRenderer width={width} height={height} scale={scale} /> */}
        </div>
      </div>
    </div>
  );
};

export default Simplex;

/*

import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";

const apiurl = "https://localhost:7085/api/Noise/generate";

const Simplex = () => {
  const [width, setWidth] = useState(100);
  const [height, setHeight] = useState(100);
  const [scale, setScale] = useState(3);
  const [noiseData, setNoiseData] = useState([]);
  const canvasRef = useRef(null);

  const fetchNoise = async () => {
    const postData = { width, height, noisescale: scale };
    try {
      const response = await fetch(apiurl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
      });
      const data = await response.json();
      setNoiseData(data);
    } catch (error) {
      console.error("Error fetching noise data:", error);
    }
  };

  useEffect(() => {
    if (noiseData.length > 0) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      const cellWidth = canvas.width / width;
      const cellHeight = canvas.height / height;

      noiseData.forEach((row, rowIndex) => {
        row.forEach((value, colIndex) => {
          const x = colIndex * cellWidth;
          const y = rowIndex * cellHeight;
          ctx.fillStyle = `rgb(${value * 255}, ${value * 255}, ${value * 255})`;
          ctx.fillRect(x, y, cellWidth, cellHeight);
        });
      });
    }
  }, [noiseData]);

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white p-6">
      
      <div className="flex justify-start space-x-4 mb-6">
        <Link
          to="/"
          className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
        >
          🏠 Hem
        </Link>
        <Link
          to="/bsp"
          className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
        >
          🔲 BSP Karta
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-center mb-6 ml-20">
        Generera Noise Karta
      </h1>

      <div className="flex flex-row items-center justify-center gap-16">

        <div className="bg-gray-800 p-4 rounded-lg shadow-lg w-56">
          <h2 className="text-lg font-semibold mb-2 text-center">Parametrar</h2>

          <div className="grid grid-cols-1 gap-2 mb-3">
            <div>
              <label className="block text-xs mb-1">Bredd</label>
              <input
                type="number"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                className="w-full p-1 bg-gray-700 text-white border border-gray-500 rounded-md text-sm"
              />
            </div>

            <div>
              <label className="block text-xs mb-1">Höjd</label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full p-1 bg-gray-700 text-white border border-gray-500 rounded-md text-sm"
              />
            </div>

            <div>
              <label className="block text-xs mb-1">Noise Skala</label>
              <input
                type="number"
                value={scale}
                onChange={(e) => setScale(e.target.value)}
                className="w-full p-1 bg-gray-700 text-white border border-gray-500 rounded-md text-sm"
              />
            </div>
          </div>

          <button
            onClick={fetchNoise}
            className="w-full px-4 py-1.5 bg-blue-500 rounded-lg hover:bg-blue-600 transition text-sm"
          >
            Generera Karta
          </button>
        </div>
        <div className="flex flex-col items-center">
          <canvas
            ref={canvasRef}
            width={500}
            height={500}
            className="border border-gray-600"
          />
        </div>
      </div>
    </div>
  );
};

export default Simplex;

*/
