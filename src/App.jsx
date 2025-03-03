import "./App.css";
import React from "react";
import ColourfulCanvas from "./Components/ColorfulCanvas";
import Header from "./Components/Header";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./Pages/Home";
import Simplex from "./Pages/Simplex";
import BSP from "./Pages/BSP";

function App() {
  return (
    <Router>
      <Header page={{ title: "Home" }} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/simplex" element={<Simplex />} />
        <Route path="/bsp" element={<BSP />} />
      </Routes>
      <ColourfulCanvas />
    </Router>
  );
}

export default App;
