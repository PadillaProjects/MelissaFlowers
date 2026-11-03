import React from "react";
import { Link } from "react-router-dom";
import { FaInstagram, FaFacebook, FaPhone, FaMapMarkerAlt, FaHeart, FaEnvelope } from "react-icons/fa";
import { reopenConsentBanner, track } from "../analytics";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3 className="footer-title">Flowers by Melibee</h3>
          <p className="footer-description">
            Flores naturales y flores eternas de listón. Entrega a domicilio y recogida.
          </p>
        </div>

        <div className="footer-section">
          <h4 className="footer-heading">Contacto</h4>
          <div className="footer-links">
            <a href="sms:9152074262" className="footer-link" onClick={() => { try { track('click_contact', { method: 'sms' }); } catch (e) {} }}>
              <FaPhone className="footer-icon" />
              <span>Text: 915-207-4262</span>
            </a>
            <Link to="/contacto" className="footer-link">
              <FaEnvelope className="footer-icon" />
              <span>Conéctate con nosotros</span>
            </Link>
            <div className="footer-link">
              <FaMapMarkerAlt className="footer-icon" />
              <span>Canutillo · El Paso, TX</span>
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
              onClick={() => { try { track('click_social', { platform: 'instagram', location: 'footer' }); } catch (e) {} }}
            >
              <FaInstagram className="footer-icon" />
              <span>@melissa_soto3</span>
            </a>
            <a
              href="https://www.facebook.com/people/%F0%9D%99%B5%F0%9D%9A%95%F0%9D%9A%98%F0%9D%9A%A0%F0%9D%9A%8E%F0%9D%9A%9B%F0%9D%9A%9C-%F0%9D%9A%8B%F0%9D%9A%A2-%F0%9D%95%84%F0%9D%95%96%F0%9D%95%9D%F0%9D%95%9A%F0%9D%95%93%F0%9D%95%96%F0%9D%95%96/61578006152375/"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link social-link"
              onClick={() => { try { track('click_social', { platform: 'facebook', location: 'footer' }); } catch (e) {} }}
            >
              <FaFacebook className="footer-icon" />
              <span>Flowers by Melibee</span>
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p className="footer-copyright">
          Hecho con amor <FaHeart className="heart-icon" /> por Melissa © {new Date().getFullYear()}
        </p>
        <p className="footer-legal">
          <a href="/privacidad.html">Privacidad / Privacy</a>
          {" · "}
          <a href="/terminos.html">Términos / Terms</a>
          {" · "}
          <button type="button" className="footer-privacy-choices" onClick={reopenConsentBanner}>
            Cookies
          </button>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
