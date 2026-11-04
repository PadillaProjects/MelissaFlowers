// App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import HomePage from "./pages/HomePage";
import ArrangementPage from "./pages/ArrangementPage";
import AdminPage from "./pages/AdminPage";
import ClubPage from "./pages/ClubPage";
import CookieBanner from "./components/CookieBanner";
import { CatalogProvider } from "./catalog/CatalogContext";

const App = () => {
  return (
    <MotionConfig reducedMotion="user">
      <Router>
        <CatalogProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/arreglos/:slug" element={<ArrangementPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/contacto" element={<ClubPage />} />
            <Route path="/club" element={<ClubPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </CatalogProvider>
        <CookieBanner />
      </Router>
    </MotionConfig>
  );
};

export default App;
