import React, { useEffect, useState, useRef } from "react";
import { bspApi, noiseApi } from "../constants/api";
import { biomes } from "../constants/biomes";

const tileSize = 64;

const FullMapRenderer = ({
  bspPositionX,
  bspPositionY,
  bspWidth,
  bspHeight,
  width,
  height,
  scale,
}) => {
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
      ctx.imageSmoothingEnabled = false;

      const overlay = overlayRef.current;

      const canvasWidth = 1280;
      const canvasHeight = 768;

      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      overlay.style.width = `${canvasWidth}px`;
      overlay.style.height = `${canvasHeight}px`;
      overlay.style.left = `${canvas.offsetLeft}px`;
      overlay.style.top = `${canvas.offsetTop}px`;
      overlay.style.pointerEvents = "auto";
      overlay.style.position = "absolute";

      const noiseCols = noiseData[0].length;
      const noiseRows = noiseData.length;

      const cellWidth = canvasWidth / noiseCols;
      const cellHeight = canvasHeight / noiseRows;

      for (let y = 0; y < noiseRows; y++) {
        for (let x = 0; x < noiseCols; x++) {
          const value = noiseData[y][x];
          ctx.fillStyle = getBiomeColor(value);
          ctx.fillRect(
            Math.floor(x * cellWidth),
            Math.floor(y * cellHeight),
            Math.ceil(cellWidth),
            Math.ceil(cellHeight)
          );
        }
      }

      // ➕ Overlay grid at 64px intervals (not tied to noise)
      ctx.strokeStyle = "rgb(0 0 0 / 40%)";
      for (let i = 0; i <= canvasWidth; i += 64) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvasHeight);
        ctx.stroke();
      }

      for (let i = 0; i <= canvasHeight; i += 64) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvasWidth, i);
        ctx.stroke();
      }
    }
  }, [noiseData, bspData]);

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

    // Define handlers separately so we can clean them up
    const handleRotate = () => {
      const tile = selectedTileRef.current;
      if (!tile) return;

      let currentRotation = parseInt(tile.dataset.rotation || "0", 10);
      if (isNaN(currentRotation)) currentRotation = 0;

      currentRotation = (currentRotation + 90) % 360;
      tile.dataset.rotation = currentRotation;

      const currentTransform = tile.style.transform || "";
      const newTransform = currentTransform
        .replace(/rotate\([^)]*\)/, "")
        .trim();
      tile.style.transform =
        `${newTransform} rotate(${currentRotation}deg)`.trim();
    };

    const handleDelete = () => {
      if (selectedTileRef.current) {
        selectedTileRef.current.remove();
        selectedTileRef.current = null;
        tileActionsRef.current.style.display = "none";
      }
    };

    rotateBtn?.addEventListener("click", handleRotate);
    deleteBtn?.addEventListener("click", handleDelete);

    // Cleanup on unmount or hot reload
    return () => {
      rotateBtn?.removeEventListener("click", handleRotate);
      deleteBtn?.removeEventListener("click", handleDelete);
    };
  }, []);

  const getBSP = async () => {
    setLoading(true);
    try {
      console.log(
        "bspPositionX: " + bspPositionX + ", bspPositionY: " + bspPositionY
      );
      // Make the POST request to the backend API
      const response = await fetch(
        "http://localhost:5102/api/bsp/generateBSP",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            X: bspPositionX, // Include the postData or anything you want to send
            Y: bspPositionY,
            Width: bspWidth,
            Height: bspHeight,
            MinRoomWidth: 192,
            MinRoomHeight: 192,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch room data");
      }

      const rooms = await response.json();
      renderRooms(rooms); // Call a function to render rooms
    } catch (error) {
      console.error("Error loading room data:", error);
    } finally {
      setLoading(false);
    }
  };

  function isWallAtPosition(x, y) {
    const walls = document.querySelectorAll(".wall, .wall_corner");
    for (const wall of walls) {
      const wallX = parseInt(wall.style.left, 10);
      const wallY = parseInt(wall.style.top, 10);
      if (wallX === x && wallY === y) {
        return wall; // return the DOM element (not just true/false)
      }
    }
    return undefined;
  }

  function isHorizontalWall(wall) {
    const t = wall.style.transform;
    return t === "" || t.includes("0deg") || t.includes("180deg");
  }

  function isVerticalWall(wall) {
    const t = wall.style.transform;
    return t.includes("90deg") || t.includes("270deg");
  }

  function isCorner(x, y) {
    const top = isWallAtPosition(x, y - tileSize);
    const bottom = isWallAtPosition(x, y + tileSize);
    const left = isWallAtPosition(x - tileSize, y);
    const right = isWallAtPosition(x + tileSize, y);

    const hasVertical =
      (top && isVerticalWall(top)) || (bottom && isVerticalWall(bottom));
    const hasHorizontal =
      (left && isHorizontalWall(left)) || (right && isHorizontalWall(right));

    return hasVertical && hasHorizontal;
  }

  function isGuidelineViolated(x, y, orientation) {
    const checkPositions =
      orientation === "horizontal"
        ? [
            { dx: 0, dy: -tileSize }, // check above
            { dx: 0, dy: tileSize }, // check below
          ]
        : [
            { dx: -tileSize, dy: 0 }, // check left
            { dx: tileSize, dy: 0 }, // check right
          ];

    // Check neighboring tiles
    for (const offset of checkPositions) {
      const neighborX = x + offset.dx;
      const neighborY = y + offset.dy;
      const neighbor = isWallAtPosition(neighborX, neighborY);

      if (neighbor) {
        const transform = neighbor.style.transform;

        const isNeighborHorizontal =
          transform.includes("0deg") ||
          transform.includes("180deg") ||
          transform === ""; // Default is 0 degrees (horizontal)

        const isNeighborVertical =
          transform.includes("90deg") || transform.includes("270deg");

        const sameOrientation =
          (orientation === "horizontal" && isNeighborHorizontal) ||
          (orientation === "vertical" && isNeighborVertical);

        if (sameOrientation) {
          // Violation: same orientation wall adjacent (horizontal with horizontal or vertical with vertical)
          // Use a semi-thick wall instead of a regular wall
          return "semi-thick"; // Indicate to use semi-thick wall
        } else {
          // No violation, allow if the orientations are different (i.e., T-junction or corner)
          return false; // No violation, continue with regular wall placement
        }
      }
    }

    // If no neighbor is found, there’s no violation, so it's safe to place
    return false; // No violation, safe to place a regular wall
  }

  const renderRooms = (rooms) => {
    const overlay = overlayRef.current;
    overlay.innerHTML = "";

    rooms.forEach((roomData) => {
      const room = roomData.room;

      if (!room) {
        console.error("Missing room data:", roomData);
        return;
      }

      const width = room.right - room.left;
      const height = room.bottom - room.top;
      const cols = Math.floor(width / tileSize);
      const rows = Math.floor(height / tileSize);

      // --- 1. Render Floor Tiles ---
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const tile = document.createElement("div");
          tile.classList.add("tile", "floor_wood");
          tile.style.position = "absolute";
          tile.style.width = tileSize + "px";
          tile.style.height = tileSize + "px";
          tile.style.left = room.left + x * tileSize + "px";
          tile.style.top = room.top + y * tileSize + "px";
          overlay.appendChild(tile);
        }
      }

      // --- 2. Render Doors ---
      // roomData.doors.forEach((door) => {
      //   if (door.isEmpty) return;
      //   const doorTile = document.createElement("div");
      //   doorTile.classList.add("tile", "door");
      //   doorTile.style.position = "absolute";
      //   doorTile.style.width = tileSize + "px";
      //   doorTile.style.height = tileSize + "px";
      //   doorTile.style.left = door.x + "px";
      //   doorTile.style.top = door.y + "px";
      //   doorTile.style.zIndex = 3;
      //   overlay.appendChild(doorTile);
      // });

      // --- 3. Render Perimeter Walls ---

      // Top and Bottom (horizontal walls)
      for (let x = 0; x < cols; x++) {
        ["Top", "Bottom"].forEach((side) => {
          const wallX = room.left + x * tileSize;
          const wallY =
            side === "Top" ? room.top : room.top + (rows - 1) * tileSize;

          const existingWall = isWallAtPosition(wallX, wallY);

          // ✅ Skip wall if already placed, unless it's a corner
          // if (existingWall && !isCorner(wallX, wallY)) return;

          // Skip wall if another horizontal wall is placed above or below it
          // if (isGuidelineViolated(wallX, wallY, "horizontal")) return;

          const wall = document.createElement("div");
          wall.classList.add("tile", "wall");
          wall.style.position = "absolute";
          wall.style.width = tileSize + "px";
          wall.style.height = tileSize + "px";
          wall.style.left = wallX + "px";
          wall.style.top = wallY + "px";

          // Rotate Bottom walls 180 degrees
          if (side === "Bottom") {
            wall.style.transform = "rotate(180deg)";
          }

          wall.style.zIndex = 2;
          overlay.appendChild(wall);
        });
      }

      // Left and Right (vertical walls)
      for (let y = 0; y < rows; y++) {
        ["Left", "Right"].forEach((side) => {
          const wallX =
            side === "Left" ? room.left : room.left + (cols - 1) * tileSize;
          const wallY = room.top + y * tileSize;

          const existingWall = isWallAtPosition(wallX, wallY);

          // ✅ Skip wall if already placed, unless it's a corner
          // if (existingWall && !isCorner(wallX, wallY)) return;

          // Skip wall if another vertical wall is already placed to the left or right of it
          // if (isGuidelineViolated(wallX, wallY, "vertical")) return;

          const wall = document.createElement("div");
          wall.classList.add("tile", "wall");
          wall.style.position = "absolute";
          wall.style.width = tileSize + "px";
          wall.style.height = tileSize + "px";
          wall.style.left = wallX + "px";
          wall.style.top = wallY + "px";

          // Rotate walls depending on side
          wall.style.transform =
            side === "Left" ? "rotate(270deg)" : "rotate(90deg)";

          wall.style.zIndex = 2;
          overlay.appendChild(wall);
        });
      }
    });
  };

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
          "wall_semi_thick",
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
      <button
        onClick={getBSP}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Kör BSP
      </button>
    </div>
  );
};

export default FullMapRenderer;
