// Header.js
import React from "react";
import "./Header.css"; // CSS for styling the Header
import logo from "../assets/logo.png";

const Header = () => {
  return (
    <header className="header">
      {/* <div>
        <img className="logo-image" src={logo} alt="Melissa's Gallery"></img>
      </div> */}

      <h1 className="header-title">Melissa's Gallery</h1>
      <div className="header-contact">
        <p className="header-address">1234 Number Street</p>
        <p className="header-address">El Paso, TX, 79999</p>
        <p className="header-phone">TEL: (915) 456-7890</p>
      </div>
    </header>
  );
};

export default Header;
