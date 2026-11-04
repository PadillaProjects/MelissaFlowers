import React from "react";
import { Link } from "react-router-dom";
import { FaWhatsapp } from "react-icons/fa";
import { track } from "../analytics";
import { whatsappLink, GENERAL_MESSAGE } from "../catalog/arrangements";
import mark from "../assets/melibee-mark-96.png";
import "./SiteHeader.css";

// Site header, fixed to the top on the home page.
const SiteHeader = ({ visible = true, onLogoClick }) => {
  const scrollToArrangements = (e) => {
    const el = document.getElementById("arreglos");
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className={`mb-header${visible ? " is-visible" : ""}`} aria-hidden={!visible}>
      <div className="mb-header-inner">
        <Link
          to="/"
          className="mb-header-brand"
          tabIndex={visible ? 0 : -1}
          onClick={(e) => {
            if (onLogoClick) {
              e.preventDefault();
              onLogoClick();
            }
          }}
        >
          <img src={mark} alt="" width="32" height="32" />
          <span>Flowers by Melibee</span>
        </Link>
        <nav className="mb-header-nav" aria-label="Principal">
          <a href="/#arreglos" className="mb-header-link" tabIndex={visible ? 0 : -1} onClick={scrollToArrangements}>
            Arreglos
          </a>
          <Link to="/contacto" className="mb-header-link" tabIndex={visible ? 0 : -1}>
            Conéctate
          </Link>
          <a
            className="mb-header-wa"
            href={whatsappLink(GENERAL_MESSAGE)}
            target="_blank"
            rel="noopener noreferrer"
            tabIndex={visible ? 0 : -1}
            aria-label="Escríbenos por WhatsApp"
            onClick={() => { try { track("click_contact", { method: "whatsapp", location: "header" }); } catch (e) {} }}
          >
            <FaWhatsapp size={20} aria-hidden="true" />
            <span className="mb-header-wa-text">WhatsApp</span>
          </a>
        </nav>
      </div>
    </header>
  );
};

export default SiteHeader;
