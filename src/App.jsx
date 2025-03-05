import "./App.css";
import React from "react";
import NoiseRenderer from "./Components/NoiseRenderer";
import Header from "./Components/Header";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./Pages/Home";
import Simplex from "./Pages/Simplex";
import BSP from "./Pages/BSP";
import NoiseRenderTesting from "./Components/NoiseRenderTesting";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/NoiseRenderTesting"
          element={<NoiseRenderTesting />}
        />{" "}
        <Route path="/simplex" element={<Simplex />} />
        <Route path="/bsp" element={<BSP />} />
      </Routes>
    </Router>
  );
}

export default App;
