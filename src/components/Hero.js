import React from "react";
import { motion } from "framer-motion";
import { FaInstagram } from "react-icons/fa";
import "./Hero.css";
import logoFull from "../assets/melibee-logo-full.png";

const Hero = () => {
  const scrollToGallery = () => {
    const gallery = document.getElementById("gallery");
    if (gallery) {
      gallery.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="hero">
      <div className="hero-background">
        <div className="hero-gradient-orb orb-1"></div>
        <div className="hero-gradient-orb orb-2"></div>
        <div className="hero-gradient-orb orb-3"></div>
      </div>

      {/* Header content merged into hero */}
      <motion.div 
        className="hero-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="hero-header-title">Galería de Melissa</h1>
        <div className="hero-header-contact">
          <p className="hero-header-address">El Paso, TX</p>
          <p className="hero-header-phone">Text: 915-207-4262</p>
          <a
            className="hero-instagram"
            href="https://www.instagram.com/melissa_soto3/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaInstagram size={20} style={{ marginRight: "6px" }} />
            melissa_soto3
          </a>
        </div>
      </motion.div>

      <div className="hero-content">
        <motion.div
          className="hero-logo-container"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <img 
            src={logoFull} 
            alt="Melibee - Arreglos Florales y Más" 
            className="hero-logo-main"
          />
        </motion.div>

        <motion.div
          className="hero-cta"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <button className="cta-button" onClick={scrollToGallery}>
            Explorar Galería
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
