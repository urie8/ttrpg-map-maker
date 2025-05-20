import React, { useEffect, useState, useRef } from "react";
import { bspApi, noiseApi } from "../constants/api";
import { biomes } from "../constants/biomes";

const tileSize = 64;

const FullMapRenderer = ({ width, height, scale }) => {
  const [noiseData, setNoiseData] = useState([]);
  const [bspData, setbspData] = useState([]);
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef(null);
  const overlayRef = useRef(null);
  const tileActionsRef = useRef(null);
  const selectedTileRef = useRef(null);

  const postData = {
    X: 10,
    Y: 10,
    Width: 100,
    Height: 100,
    MinRoomWidth: 50,
    MinRoomHeight: 40,
  };

  // 🧭 Get color from biome
  const getBiomeColor = (e) => {
    if (e < 0.5) return biomes.MANGROVE;
    else if (e < 0.8) return biomes.LIGHT_FOREST;
    else if (e < 0.9) return biomes.DENSE_FOREST;
    else if (e < 1.1) return biomes.RAINFOREST;
    else return biomes.TAIGA;
  };

  // 📦 Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [noiseRes, bspRes] = await Promise.all([
          fetch(noiseApi, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ width, height, noisescale: scale }),
          }),
          fetch(bspApi, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(postData),
          }),
        ]);

        const [noiseJson, bspJson] = await Promise.all([
          noiseRes.json(),
          bspRes.json(),
        ]);
        setNoiseData(noiseJson);
        setbspData(bspJson);
      } catch (err) {
        console.error("Error fetching map data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [width, height, scale]);

  // 🎨 Draw noise on canvas
  useEffect(() => {
    if (noiseData.length > 0 && bspData.length > 0) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const overlay = overlayRef.current;
      overlay.style.width = `${canvas.width}px`;
      overlay.style.height = `${canvas.height}px`;
      overlay.style.left = `${canvas.offsetLeft}px`;
      overlay.style.top = `${canvas.offsetTop}px`;
      overlay.style.pointerEvents = "auto";
      overlay.style.position = "absolute";
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

      ctx.strokeStyle = "rgb(0 0 0 / 40%)";
      for (let i = 0; i < canvas.width; i += 64) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
      }

      for (let i = 0; i < canvas.height; i += 64) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }
    }
  }, [noiseData, bspData, width, height]);

  // 🧱 Room data renderer
  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;

    fetch("rooms.json")
      .then((res) => res.json())
      .then((rooms) => {
        overlay.innerHTML = "";
        rooms.forEach((roomData) => {
          const room = roomData.Room;
          const cols = Math.floor(room.Width / tileSize);
          const rows = Math.floor(room.Height / tileSize);

          // Floor
          for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
              const tile = document.createElement("div");
              tile.className = "tile floor_wood";
              tile.style.position = "absolute";
              tile.style.left = `${room.X + x * tileSize}px`;
              tile.style.top = `${room.Y + y * tileSize}px`;
              tile.style.width = `${tileSize}px`;
              tile.style.height = `${tileSize}px`;
              overlay.appendChild(tile);
            }
          }

          // Doors
          roomData.Doors.forEach((doorStr) => {
            const [x, y] = doorStr.split(",").map(Number);
            const door = document.createElement("div");
            door.className = "tile door";
            door.style.position = "absolute";
            door.style.left = `${x}px`;
            door.style.top = `${y}px`;
            door.style.width = `${tileSize}px`;
            door.style.height = `${tileSize}px`;
            door.style.zIndex = 3;
            overlay.appendChild(door);
          });
        });
      });
  }, []);

  // 🖱️ Drag and Drop setup
  useEffect(() => {
    const overlay = overlayRef.current;
    const tileActions = tileActionsRef.current;

    const handleDragStart = (e) => {
      e.dataTransfer.setData("tileType", e.target.dataset.type);
    };

    const handleDrop = (e) => {
      e.preventDefault();
      const tileType = e.dataTransfer.getData("tileType");
      const rect = overlay.getBoundingClientRect();
      const x = Math.floor((e.clientX - rect.left) / tileSize) * tileSize;
      const y = Math.floor((e.clientY - rect.top) / tileSize) * tileSize;

      const tile = document.createElement("div");
      tile.className = `tile ${tileType}`;
      tile.style.position = "absolute";
      tile.style.left = `${x}px`;
      tile.style.top = `${y}px`;
      tile.style.width = `${tileSize}px`;
      tile.style.height = `${tileSize}px`;

      switch (tileType) {
        case "floor_wood":
        case "floor_tiles":
          tile.style.zIndex = 1;
          break;
        case "wall":
        case "wall_corner":
          tile.style.zIndex = 2;
          break;
        case "door":
          tile.style.zIndex = 3;
          break;
        default:
          tile.style.zIndex = 1;
      }

      overlay.appendChild(tile);
    };

    const handleClick = (e) => {
      const target = e.target;
      if (target.classList.contains("tile")) {
        if (selectedTileRef.current) {
          selectedTileRef.current.classList.remove("selected");
        }
        selectedTileRef.current = target;
        selectedTileRef.current.classList.add("selected");

        const tileRect = selectedTileRef.current.getBoundingClientRect();
        const overlayRect = overlay.getBoundingClientRect();

        const x = tileRect.left - overlayRect.left;
        const y =
          tileRect.top - overlayRect.top + selectedTileRef.current.offsetHeight;

        tileActions.style.left = `${x}px`;
        tileActions.style.top = `${y}px`;
        tileActions.style.display = "flex";
      } else {
        if (selectedTileRef.current) {
          selectedTileRef.current.classList.remove("selected");
          selectedTileRef.current = null;
        }
        tileActions.style.display = "none";
      }
    };

    document.querySelectorAll(".tile-palette .tile").forEach((tile) => {
      tile.addEventListener("dragstart", handleDragStart);
    });

    overlay.addEventListener("dragover", (e) => e.preventDefault());
    overlay.addEventListener("drop", handleDrop);
    overlay.addEventListener("click", handleClick);

    return () => {
      overlay.removeEventListener("drop", handleDrop);
      overlay.removeEventListener("click", handleClick);
    };
  }, []);

  // 🔁 Rotate / Delete buttons
  useEffect(() => {
    const rotateBtn = document.getElementById("rotate-btn");
    const deleteBtn = document.getElementById("delete-btn");

    rotateBtn.addEventListener("click", () => {
      const tile = selectedTileRef.current;
      if (!tile) return;

      // Get current rotation from dataset
      let currentRotation = parseInt(tile.dataset.rotation || "0");
      if (isNaN(currentRotation)) currentRotation = 0;

      // Increase by 90, keep within 0–270
      currentRotation = (currentRotation + 90) % 360;

      // Save and apply
      tile.dataset.rotation = currentRotation;
      tile.style.transform = `rotate(${currentRotation}deg)`;
    });

    deleteBtn.addEventListener("click", () => {
      if (selectedTileRef.current) {
        selectedTileRef.current.remove();
        selectedTileRef.current = null;
        tileActionsRef.current.style.display = "none";
      }
    });
  }, []);

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    const link = document.createElement("a");
    link.download = "karta.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="flex flex-col items-center">
      {loading && <p className="text-gray-400 mb-2">Laddar karta...</p>}
      <canvas ref={canvasRef} className="border border-gray-600" />

      <div
        id="tile-overlay"
        ref={overlayRef}
        style={{ position: "absolute", pointerEvents: "auto" }}
      />

      <div id="tile-actions" ref={tileActionsRef} className="absolute hidden">
        <button id="rotate-btn">⟳</button>
        <button id="delete-btn">✖</button>
      </div>

      <div className="tile-palette mt-4 flex gap-2 flex-wrap">
        {[
          "floor_wood",
          "floor_tiles",
          "stairs",
          "wall",
          "wall_half",
          "wall_diagonal",
          "wall_inner_diagonal",
          "wall_corner",
          "door",
          "barrels_stacked",
          "bed",
          "table",
        ].map((type) => (
          <div
            key={type}
            className={`tile ${type}`}
            draggable
            data-type={type}
          ></div>
        ))}
      </div>

      <button
        onClick={downloadCanvas}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Ladda ner karta
      </button>
    </div>
  );
};

export default FullMapRenderer;
