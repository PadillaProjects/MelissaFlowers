// CookieBanner.js — asks before turning on Google Analytics.
import React, { useEffect, useState } from "react";
import {
  CONSENT_RESET_EVENT,
  acceptAnalytics,
  declineAnalytics,
  getStoredConsent,
  initAnalyticsFromStoredConsent,
} from "../analytics";
import "./CookieBanner.css";

const CookieBanner = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    initAnalyticsFromStoredConsent();
    if (!getStoredConsent()) setVisible(true);
    const reopen = () => setVisible(true);
    window.addEventListener(CONSENT_RESET_EVENT, reopen);
    return () => window.removeEventListener(CONSENT_RESET_EVENT, reopen);
  }, []);

  if (!visible) return null;

  return (
    <div className="cookie-banner" role="dialog" aria-live="polite" aria-label="Cookies">
      <p className="cookie-text">
        <span lang="es">
          Usamos cookies de Google Analytics para saber cómo se usa nuestro sitio, solo si aceptas.
        </span>{" "}
        <span lang="en" className="cookie-en">
          We use Google Analytics cookies to understand how our site is used, only if you accept.
        </span>{" "}
        <a href="/privacidad.html#cookies" target="_blank" rel="noopener noreferrer">
          Más información / Learn more
        </a>
      </p>
      <div className="cookie-actions">
        <button
          type="button"
          className="cookie-btn"
          onClick={() => {
            declineAnalytics();
            setVisible(false);
          }}
        >
          Rechazar / Decline
        </button>
        <button
          type="button"
          className="cookie-btn"
          onClick={() => {
            acceptAnalytics();
            setVisible(false);
          }}
        >
          Aceptar / Accept
        </button>
      </div>
    </div>
  );
};

export default CookieBanner;
