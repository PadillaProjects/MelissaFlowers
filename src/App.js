// App.js
import React from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AdminPage from "./pages/AdminPage";
import SalePage from "./pages/SalePage";
import CheckoutPage from "./pages/CheckoutPage";
import { CartProvider } from "./context/CartContext";

const App = () => {
  return (
    <CartProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/sale/:saleSlug" element={<SalePage />} />
          <Route path="/sale/:saleSlug/checkout" element={<CheckoutPage />} />
        </Routes>
      </Router>
    </CartProvider>
  );
};

export default App;
