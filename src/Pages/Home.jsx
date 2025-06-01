import React from "react";
import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-4">
        Välkommen till TTRPG Map Maker
      </h1>
      <p className="text-lg mb-6">Skapa dynamiska kartor med BSP och Noise.</p>

      <div className="flex space-x-4">
        {/* <Link
          to="/bsp"
          className="px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-600 transition"
        >
          Skapa BSP Karta
        </Link> */}
        <Link
          to="/simplex"
          className="px-4 py-2 bg-green-500 rounded-lg hover:bg-green-600 transition"
        >
          Skapa karta!
        </Link>
      </div>
    </div>
  );
}

export default Home;
