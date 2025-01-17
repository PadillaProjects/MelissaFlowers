// App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ItemDetails from "./pages/ItemDetails";
import Header from "./components/Header";

const App = () => {
  return (
    <Router>
      {/* Header is displayed on all pages */}
      <Header />

      {/* Define routes */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/item/:id" element={<ItemDetails />} />
      </Routes>
    </Router>
  );
};

export default App;
