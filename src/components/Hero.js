import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FaFacebook } from "react-icons/fa";
import { track } from "../analytics";
import "./Hero.css";
import logoFull from "../assets/melibee-logo-full.png";

const Hero = () => {
  const scrollToGallery = () => {
    try { track('click_navigation', { destination: 'gallery' }); } catch (e) {}
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
        <h1 className="hero-header-title">Flowers by Melibee</h1>
        <div className="hero-header-contact">
          <p className="hero-header-address">Canutillo · El Paso, TX</p>
          <p className="hero-header-phone">Text: 915-207-4262</p>
          <a
            className="hero-facebook"
            href="https://www.facebook.com/people/%F0%9D%99%B5%F0%9D%9A%95%F0%9D%9A%98%F0%9D%9A%A0%F0%9D%9A%8E%F0%9D%9A%9B%F0%9D%9A%9C-%F0%9D%9A%8B%F0%9D%9A%A2-%F0%9D%95%84%F0%9D%95%96%F0%9D%95%9D%F0%9D%95%9A%F0%9D%95%93%F0%9D%95%96%F0%9D%95%96/61578006152375/"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => { try { track('click_social', { platform: 'facebook', location: 'hero' }); } catch (e) {} }}
          >
            <FaFacebook size={20} style={{ marginRight: "6px" }} />
            Flowers by Melibee
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
            alt="Flowers by Melibee - Arreglos florales y más" 
            className="hero-logo-main"
          />
        </motion.div>

        <motion.div
          className="hero-cta"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "15px" }}
        >
          <button className="cta-button" onClick={scrollToGallery}>
            Explorar Galería
          </button>
          <Link
            className="cta-button cta-secondary"
            to="/contacto"
            onClick={() => { try { track('click_navigation', { destination: 'connect' }); } catch (e) {} }}
          >
            Conéctate con nosotros
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
