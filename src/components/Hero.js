import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FaFacebook } from "react-icons/fa";
import { FiMessageSquare, FiMapPin } from "react-icons/fi";
import { track } from "../analytics";
import "./Hero.css";
import logoFull from "../assets/webp/melibee-logo-full.webp";

const FACEBOOK_URL =
  "https://www.facebook.com/people/%F0%9D%99%B5%F0%9D%9A%95%F0%9D%9A%98%F0%9D%9A%A0%F0%9D%9A%8E%F0%9D%9A%9B%F0%9D%9A%9C-%F0%9D%9A%8B%F0%9D%9A%A2-%F0%9D%95%84%F0%9D%95%96%F0%9D%95%9D%F0%9D%95%9A%F0%9D%95%93%F0%9D%95%96%F0%9D%95%96/61578006152375/";

// Welcome screen: the big logo. The name and contact links live in the
// site header above it, and the contact row sits under the buttons.
const Hero = () => {
  const scrollToGallery = () => {
    try { track("click_navigation", { destination: "gallery" }); } catch (e) {}
    const target = document.getElementById("destacado");
    if (target) target.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="hero">
      <div className="hero-background" aria-hidden="true">
        <div className="hero-gradient-orb orb-1"></div>
        <div className="hero-gradient-orb orb-2"></div>
        <div className="hero-gradient-orb orb-3"></div>
      </div>

      <div className="hero-content">
        <motion.div
          className="hero-logo-container"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <h1 className="hero-logo-heading">
            <img
              src={logoFull}
              alt="Flowers by Melibee, florería en Canutillo y El Paso, TX"
              className="hero-logo-main"
            />
          </h1>
        </motion.div>

        <motion.div
          className="hero-cta"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <button type="button" className="mb-btn mb-btn--primary" onClick={scrollToGallery}>
            Explorar galería
          </button>
          <Link
            className="mb-btn mb-btn--outline"
            to="/contacto"
            onClick={() => { try { track("click_navigation", { destination: "connect" }); } catch (e) {} }}
          >
            Conéctate con nosotros
          </Link>
        </motion.div>

        <motion.ul
          className="hero-contact"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <li>
            <span className="hero-contact-item">
              <FiMapPin aria-hidden="true" />
              Canutillo · El Paso, TX
            </span>
          </li>
          <li>
            <a
              className="hero-contact-item hero-contact-link"
              href="sms:+19152074262"
              onClick={() => { try { track("click_contact", { method: "sms", location: "hero" }); } catch (e) {} }}
            >
              <FiMessageSquare aria-hidden="true" />
              Text: 915-207-4262
            </a>
          </li>
          <li>
            <a
              className="hero-contact-item hero-contact-link"
              href={FACEBOOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => { try { track("click_social", { platform: "facebook", location: "hero" }); } catch (e) {} }}
            >
              <FaFacebook aria-hidden="true" />
              Facebook
            </a>
          </li>
        </motion.ul>
      </div>
    </section>
  );
};

export default Hero;
