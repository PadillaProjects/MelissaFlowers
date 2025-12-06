import React from "react";
import { FaInstagram, FaPhone, FaMapMarkerAlt, FaHeart } from "react-icons/fa";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3 className="footer-title">Galería de Melissa</h3>
          <p className="footer-description">
            Arreglos florales y más
          </p>
        </div>

        <div className="footer-section">
          <h4 className="footer-heading">Contacto</h4>
          <div className="footer-links">
            <a href="tel:915-207-4262" className="footer-link">
              <FaPhone className="footer-icon" />
              <span>915-207-4262</span>
            </a>
            <div className="footer-link">
              <FaMapMarkerAlt className="footer-icon" />
              <span>El Paso, TX</span>
            </div>
          </div>
        </div>

        <div className="footer-section">
          <h4 className="footer-heading">Sígueme</h4>
          <div className="footer-links">
            <a
              href="https://www.instagram.com/melissa_soto3/"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link social-link"
            >
              <FaInstagram className="footer-icon" />
              <span>@melissa_soto3</span>
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p className="footer-copyright">
          Hecho con amor <FaHeart className="heart-icon" /> por Melissa © {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
