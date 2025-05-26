// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import WeatherApp from "./Weather/WeatherApp.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<WeatherApp />} />
    </Routes>
  );
}

export default App;
