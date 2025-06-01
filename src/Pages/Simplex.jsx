import React, { useState } from "react";
import { Link } from "react-router-dom";
import NoiseRenderTesting from "../Components/NoiseRenderTesting";
import FullMapRenderer from "../Components/FullMapRenderer";

const Simplex = () => {
  const MULTIPLIER = 64;
  const [bspPositionX, setBSPPositionX] = useState(MULTIPLIER);
  const [bspPositionY, setBSPPositionY] = useState(MULTIPLIER);
  const [bspWidth, setBSPWidth] = useState(MULTIPLIER * 6);
  const [bspHeight, setBSPHeight] = useState(MULTIPLIER * 6);

  const [width, setWidth] = useState(300);
  const [height, setHeight] = useState(300);
  const [scale, setScale] = useState(2.5);

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white overflow-hidden">
      {/* Top Toolbar */}
      <div className="flex items-center justify-center gap-6 px-4 py-3 bg-gray-900 w-full">
        {/* BSP */}
        <div className="flex gap-2 items-center">
          <h3>BSP:</h3>
          <div className="flex flex-col text-xs">
            <label>Pos X</label>
            <input
              type="number"
              value={bspPositionX / MULTIPLIER}
              onChange={(e) =>
                setBSPPositionX(parseInt(e.target.value) * MULTIPLIER)
              }
              className="w-14 p-1 bg-gray-800 border border-gray-600 rounded text-sm"
            />
          </div>
          <div className="flex flex-col text-xs">
            <label>Pos Y</label>
            <input
              type="number"
              value={bspPositionY / MULTIPLIER}
              onChange={(e) =>
                setBSPPositionY(parseInt(e.target.value) * MULTIPLIER)
              }
              className="w-14 p-1 bg-gray-800 border border-gray-600 rounded text-sm"
            />
          </div>
          <div className="flex flex-col text-xs">
            <label>Width</label>
            <input
              type="number"
              value={bspWidth / MULTIPLIER}
              onChange={(e) =>
                setBSPWidth(parseInt(e.target.value) * MULTIPLIER)
              }
              className="w-14 p-1 bg-gray-800 border border-gray-600 rounded text-sm"
            />
          </div>
          <div className="flex flex-col text-xs">
            <label>Height</label>
            <input
              type="number"
              value={bspHeight / MULTIPLIER}
              onChange={(e) =>
                setBSPHeight(parseInt(e.target.value) * MULTIPLIER)
              }
              className="w-14 p-1 bg-gray-800 border border-gray-600 rounded text-sm"
            />
          </div>
        </div>

        {/* Parameters */}
        <div className="flex gap-2 items-center">
          <h3>Noise:</h3>
          <div className="flex flex-col text-xs">
            <label>Bredd</label>
            <input
              type="number"
              value={width}
              onChange={(e) => setWidth(parseInt(e.target.value))}
              className="w-14 p-1 bg-gray-800 border border-gray-600 rounded text-sm"
            />
          </div>
          <div className="flex flex-col text-xs">
            <label>Höjd</label>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(parseInt(e.target.value))}
              className="w-14 p-1 bg-gray-800 border border-gray-600 rounded text-sm"
            />
          </div>
          <div className="flex flex-col text-xs">
            <label>Noise</label>
            <input
              type="number"
              step="0.1"
              value={scale}
              onChange={(e) => setScale(parseFloat(e.target.value))}
              className="w-14 p-1 bg-gray-800 border border-gray-600 rounded text-sm"
            />
          </div>
        </div>
      </div>

      {/* Map Renderer Fullscreen */}
      <div className="flex-grow flex justify-center items-center overflow-hidden">
        <div className="relative">
          <FullMapRenderer
            bspPositionX={bspPositionX}
            bspPositionY={bspPositionY}
            bspWidth={bspWidth}
            bspHeight={bspHeight}
            width={width}
            height={height}
            scale={scale}
          />
        </div>
      </div>
      <br />
    </div>
  );
};

export default Simplex;
