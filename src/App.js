// App.js
import React, { useLayoutEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigationType } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import HomePage from "./pages/HomePage";
import ArrangementPage from "./pages/ArrangementPage";
import AdminPage from "./pages/AdminPage";
import ClubPage from "./pages/ClubPage";
import CookieBanner from "./components/CookieBanner";
import { CatalogProvider } from "./catalog/CatalogContext";

const ScrollToTop = () => {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();

  useLayoutEffect(() => {
    // When returning to the home page gallery via back button (POP), let HomePage restore the user's spot.
    if (pathname === "/" && navigationType === "POP") {
      return;
    }
    // Always start at top for arrangements, contact, admin, and forward page navigation.
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname, navigationType]);

  return null;
};

const App = () => {
  return (
    <MotionConfig reducedMotion="user">
      <Router>
        <ScrollToTop />
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
