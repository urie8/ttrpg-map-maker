import React, { useState } from "react";
import { Link } from "react-router-dom";
import BSPRenderingCanvas from "../Components/BSPRenderingCanvas";

const BSP = () => {
  const [width, setWidth] = useState(500);
  const [height, setHeight] = useState(500);
  const [minRoomWidth, setMinRoomWidth] = useState(50);
  const [minRoomHeight, setMinRoomHeight] = useState(50);
  const [generateKey, setGenerateKey] = useState(0); // För att uppdatera komponenten vid knapptryck

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
          to="/simplex"
          className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
        >
          🎲 Noise Karta
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-center mb-6 ml-32">
        BSP Dungeon Generator
      </h1>

      {/* Flex-row layout för input och canvas */}
      <div className="flex flex-row items-center justify-center gap-16">
        {/* Parameterruta */}
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg w-56">
          <h2 className="text-lg font-semibold mb-2 text-center">Parametrar</h2>

          <div className="grid grid-cols-1 gap-2 mb-3">
            <div>
              <label className="block text-xs mb-1">Dungeon Bredd</label>
              <input
                type="number"
                value={width}
                onChange={(e) => setWidth(parseInt(e.target.value) || 0)}
                className="w-full p-1 bg-gray-700 text-white border border-gray-500 rounded-md text-sm"
              />
            </div>

            <div>
              <label className="block text-xs mb-1">Dungeon Höjd</label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(parseInt(e.target.value) || 0)}
                className="w-full p-1 bg-gray-700 text-white border border-gray-500 rounded-md text-sm"
              />
            </div>

            <div>
              <label className="block text-xs mb-1">Minsta Rum Bredd</label>
              <input
                type="number"
                value={minRoomWidth}
                onChange={(e) => setMinRoomWidth(parseInt(e.target.value) || 0)}
                className="w-full p-1 bg-gray-700 text-white border border-gray-500 rounded-md text-sm"
              />
            </div>

            <div>
              <label className="block text-xs mb-1">Minsta Rum Höjd</label>
              <input
                type="number"
                value={minRoomHeight}
                onChange={(e) =>
                  setMinRoomHeight(parseInt(e.target.value) || 0)
                }
                className="w-full p-1 bg-gray-700 text-white border border-gray-500 rounded-md text-sm"
              />
            </div>
          </div>

          <button
            onClick={() => setGenerateKey((prevKey) => prevKey + 1)}
            className="w-full px-4 py-1.5 bg-blue-500 rounded-lg hover:bg-blue-600 transition text-sm"
          >
            Generera Karta
          </button>
        </div>

        {/* BSP Rendering Canvas */}
        <div className="flex flex-col items-center">
          <BSPRenderingCanvas
            key={generateKey} // Forcerar komponenten att uppdateras vid nytt knapptryck
            width={width}
            height={height}
            minRoomWidth={minRoomWidth}
            minRoomHeight={minRoomHeight}
          />
        </div>
      </div>
    </div>
  );
};

export default BSP;
