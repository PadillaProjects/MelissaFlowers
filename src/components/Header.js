// Header.js
import React from "react";
import "./Header.css"; // CSS for styling the Header
import { FaInstagram } from "react-icons/fa";

const Header = () => {
  return (
    <header className="header">
      <h1 className="header-title">Galería de Flores</h1>
      <div className="header-contact">
        <p className="header-address"></p>
        <p className="header-address">El Paso, TX</p>
        <p className="header-phone">Text: 915-207-4262</p>
        <a
          className="instagram"
          href="https://www.instagram.com/melissa_soto3/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaInstagram size={24} style={{ marginRight: "8px" }} />
          melissa_soto3
        </a>
      </div>
    </header>
  );
};

export default Header;
