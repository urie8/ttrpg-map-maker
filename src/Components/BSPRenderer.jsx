import React, { useEffect, useState, useRef } from "react";

const apiurl = "https://localhost:7085/api/BSP/generateBSP";

const BSPRenderer = () => {
  const [bspData, setbspData] = useState([]);
  const canvasRef = useRef(null);
  const postData = {
    X: 10,
    Y: 10,
    Width: 100,
    Height: 100,
    MinRoomWidth: 50,
    MinRoomHeight: 40,
  };

  function drawRooms(rooms) {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas before drawing new rooms

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

  useEffect(() => {
    // POST request to fetch bsp data
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
        setbspData(data); // Adjust this according to the structure of your JSON
      } catch (error) {
        console.error("Error fetching noise data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    drawRooms(bspData);
  }, [bspData]);

  return (
    <div>
      BSPRenderer
      <canvas ref={canvasRef} width={500} height={500} />
    </div>
  );
};

export default BSPRenderer;
