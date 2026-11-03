// Header.js
import React from "react";
import "./Header.css"; // CSS for styling the Header
import { FaFacebook } from "react-icons/fa";

const Header = () => {
  return (
    <header className="header">
      <h1 className="header-title">Flowers by Melibee</h1>
      <div className="header-contact">
        <p className="header-address"></p>
        <p className="header-address">El Paso, TX</p>
        <p className="header-phone">Text: 915-207-4262</p>
        <a
          className="facebook"
          href="https://www.facebook.com/people/%F0%9D%99%B5%F0%9D%9A%95%F0%9D%9A%98%F0%9D%9A%A0%F0%9D%9A%8E%F0%9D%9A%9B%F0%9D%9A%9C-%F0%9D%9A%8B%F0%9D%9A%A2-%F0%9D%95%84%F0%9D%95%96%F0%9D%95%9D%F0%9D%95%9A%F0%9D%95%93%F0%9D%95%96%F0%9D%95%96/61578006152375/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaFacebook size={24} style={{ marginRight: "8px" }} />
          Flowers by Melibee
        </a>
      </div>
    </header>
  );
};

export default Header;
