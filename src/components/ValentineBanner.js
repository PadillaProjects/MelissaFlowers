import React, { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./ValentineBanner.css";
import valentineFlower1 from "../assets/valentine-flower-1.png";
import valentineFlower2 from "../assets/valentine-flower-2.png";
import valentineFlower3 from "../assets/valentine-flower-3.png";
import valentineFlower4 from "../assets/valentine-flower-4.png";
import valentineFlower5 from "../assets/valentine-flower-5.png";
import valentineFlower6 from "../assets/valentine-flower-6.png";
import valentinePlushies from "../assets/valentine-plushies.png";

const flowerImages = [
  { src: valentineFlower1, alt: "Arreglo de rosas y girasoles con corona" },
  { src: valentineFlower2, alt: "Bouquet de rosas rojas con lazo personalizado" },
  { src: valentineFlower3, alt: "Bouquet de rosas rojas con inicial personalizada" },
  { src: valentineFlower4, alt: "Bouquet multicolor con corona y mariposas" },
  { src: valentineFlower5, alt: "Bouquet de rosas rojas grande con mariposas" },
  { src: valentineFlower6, alt: "Arreglo de rosas rojas y azules en caja" },
];

const ValentineBanner = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const contentRef = useRef(null);
  const promoRef = useRef(null);
  const infoRef = useRef(null);
  const optionsRef = useRef(null);
  const extrasRef = useRef(null);
  const isScrollingRef = useRef(false);

  const tabs = [
    { id: 0, label: "Promoción", ref: promoRef },
    { id: 1, label: "Info", ref: infoRef },
    { id: 2, label: "Opciones", ref: optionsRef },
    { id: 3, label: "Extras", ref: extrasRef },
  ];

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setActiveTab(0);
    document.body.style.overflow = "hidden";
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    document.body.style.overflow = "auto";
  };

  const scrollToSection = (ref, tabId) => {
    // Set flag to prevent scroll listener from changing tabs
    isScrollingRef.current = true;
    setActiveTab(tabId);
    
    if (ref.current && contentRef.current) {
      const containerTop = contentRef.current.getBoundingClientRect().top;
      const elementTop = ref.current.getBoundingClientRect().top;
      const scrollOffset = elementTop - containerTop + contentRef.current.scrollTop - 20;
      
      contentRef.current.scrollTo({
        top: scrollOffset,
        behavior: 'smooth'
      });
      
      // Re-enable scroll listener after animation completes
      setTimeout(() => {
        isScrollingRef.current = false;
      }, 500);
    }
  };

  // Track scroll position to highlight active tab
  const handleScroll = useCallback(() => {
    // Skip if programmatic scrolling is in progress
    if (isScrollingRef.current || !contentRef.current) return;
    
    const container = contentRef.current;
    const scrollTop = container.scrollTop;
    
    // Get positions of each section relative to the scroll container
    const sections = [
      { id: 0, ref: promoRef },
      { id: 1, ref: infoRef },
      { id: 2, ref: optionsRef },
      { id: 3, ref: extrasRef },
    ];

    // Find which section is most visible
    let activeSection = 0;
    let minDistance = Infinity;

    sections.forEach((section) => {
      if (section.ref.current) {
        const sectionTop = section.ref.current.offsetTop - container.offsetTop;
        const distance = Math.abs(scrollTop - sectionTop + 50);
        
        if (distance < minDistance) {
          minDistance = distance;
          activeSection = section.id;
        }
      }
    });

    setActiveTab(activeSection);
  }, []);

  useEffect(() => {
    const container = contentRef.current;
    if (container && isModalOpen) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [isModalOpen, handleScroll]);

  return (
    <>
      {/* Banner */}
      <motion.div
        className="valentine-banner"
        onClick={handleOpenModal}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="valentine-banner-bg">
          <div className="floating-heart heart-1">♥</div>
          <div className="floating-heart heart-2">♥</div>
          <div className="floating-heart heart-3">♥</div>
          <div className="floating-heart heart-4">♥</div>
          <div className="floating-heart heart-5">♥</div>
          <div className="floating-heart heart-6">♥</div>
          <div className="floating-heart heart-7">♥</div>
          <div className="floating-heart heart-8">♥</div>
        </div>
        
        <div className="valentine-banner-content">
          <div className="valentine-ribbon-img">
            <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 60'%3E%3Cpath d='M50 5 L65 25 L50 20 L35 25 Z' fill='%238b1538'/%3E%3Cpath d='M30 15 Q20 25 25 35 Q30 45 40 40 L50 30 L60 40 Q70 45 75 35 Q80 25 70 15 L50 5 Z' fill='%23a31545'/%3E%3C/svg%3E" alt="" className="bow-icon" />
          </div>
          <p className="valentine-banner-pretext">PRE-ORDENA PARA</p>
          <h1 className="valentine-banner-heading">SAN VALENTÍN</h1>
          <p className="valentine-banner-subtitle">Flores naturales y Flores eternas</p>
          <div className="valentine-banner-cta">
            <span className="cta-text">Ver Información</span>
            <span className="cta-arrow">→</span>
          </div>
        </div>
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="valentine-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              if (e.target.classList.contains("valentine-modal-backdrop")) {
                handleCloseModal();
              }
            }}
          >
            <motion.div
              className="valentine-modal"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Modal Header */}
              <div className="valentine-modal-header">
                <div className="modal-bow">
                  <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 60'%3E%3Cpath d='M50 5 L65 25 L50 20 L35 25 Z' fill='%238b1538'/%3E%3Cpath d='M30 15 Q20 25 25 35 Q30 45 40 40 L50 30 L60 40 Q70 45 75 35 Q80 25 70 15 L50 5 Z' fill='%23a31545'/%3E%3C/svg%3E" alt="" className="modal-bow-icon" />
                </div>
                <p className="valentine-modal-pretext">PRE-ORDENA PARA</p>
                <h2 className="valentine-modal-title">SAN VALENTÍN</h2>
                <p className="valentine-modal-subtitle">Flores naturales y Flores eternas</p>
                <button className="valentine-modal-close" onClick={handleCloseModal}>
                  ✕
                </button>
              </div>

              {/* Tabs - Navigation */}
              <div className="valentine-tabs">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    className={`valentine-tab ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => scrollToSection(tab.ref, tab.id)}
                  >
                    <span className="tab-label">{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Scrollable Content - All Sections */}
              <div className="valentine-modal-content" ref={contentRef}>
                
                {/* Section 1: Promoción */}
                <section className="valentine-section" ref={promoRef}>
                  <h3 className="section-title">Pre-Ordena para San Valentín</h3>
                  <div className="flowers-gallery">
                    {flowerImages.map((image, index) => (
                      <div key={index} className={`flower-gallery-item flower-item-${index + 1}`}>
                        <img 
                          src={image.src} 
                          alt={image.alt} 
                          className="flower-gallery-img"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="contact-info-promo">
                    <p><span className="contact-icon">🌐</span> www.melibee.art</p>
                    <p>
                      <a href="https://www.facebook.com/people/%F0%9D%99%B5%F0%9D%9A%95%F0%9D%9A%98%F0%9D%9A%A0%F0%9D%9A%8E%F0%9D%9A%9B%F0%9D%9A%9C-%F0%9D%9A%8B%F0%9D%9A%A2-%F0%9D%95%84%F0%9D%95%96%F0%9D%95%9D%F0%9D%95%9A%F0%9D%95%93%F0%9D%95%96%F0%9D%95%96/61578006152375/" target="_blank" rel="noopener noreferrer" className="promo-facebook-link">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="#1877F2" style={{flexShrink: 0, marginRight: '6px'}}>
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                        Flowers by Melibee
                      </a>
                    </p>
                    <p><span className="contact-icon">📞</span> Text: 915-207-4262</p>
                  </div>
                </section>

                <div className="section-divider"></div>

                {/* Section 2: Info */}
                <section className="valentine-section" ref={infoRef}>
                  <h3 className="section-title">Información Importante</h3>
                  <div className="info-card">
                    <p className="info-text">
                      San Valentín es una temporada de alta demanda de flores. 
                      Durante estas fechas, los precios en el mercado floral suelen aumentar, 
                      por lo que algunos costos pueden variar.
                    </p>
                    <p className="info-gratitude">
                      Gracias por su comprensión y por apoyar mi trabajo.
                    </p>
                  </div>
                  
                  <div className="deadline-section">
                    <h4 className="deadline-title">Fechas límite para pre-ordenar:</h4>
                    <div className="deadline-cards">
                      <div className="deadline-card natural">
                        <span className="deadline-heart">♡</span>
                        <div className="deadline-info">
                          <span className="deadline-type">Flores naturales</span>
                          <span className="deadline-date">hasta el 18 de enero</span>
                        </div>
                      </div>
                      <div className="deadline-card eternal">
                        <span className="deadline-heart">♡</span>
                        <div className="deadline-info">
                          <span className="deadline-type">Flores eternas</span>
                          <span className="deadline-date">hasta el 27 de enero</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="deposit-notice">
                    <p>Se requiere un anticipo del <strong>50%</strong> no reembolsable para confirmar el pedido.</p>
                  </div>
                </section>

                <div className="section-divider"></div>

                {/* Section 3: Opciones */}
                <section className="valentine-section" ref={optionsRef}>
                  <h3 className="section-title">Información del Día</h3>
                  
                  <div className="options-grid">
                    <div className="option-category">
                      <h4 className="category-title">Flores naturales</h4>
                      <div className="category-divider"></div>
                      <ul className="option-list">
                        <li><span className="bullet">•</span> 25 rosas <span className="color-info">(1 color)</span></li>
                        <li><span className="bullet">•</span> 50 rosas <span className="color-info">(1-2 colores)</span></li>
                        <li><span className="bullet">•</span> 75 rosas <span className="color-info">(1-3 colores)</span></li>
                        <li><span className="bullet">•</span> 100 rosas <span className="color-info">(1-4 colores)</span></li>
                        <li><span className="bullet">•</span> 125 rosas <span className="color-info">(1-4 colores)</span></li>
                      </ul>
                      <div className="colors-available">
                        <h5>Colores Disponibles:</h5>
                        <ul className="colors-list">
                          <li><span className="heart-bullet">♡</span> Rojo</li>
                          <li><span className="heart-bullet">♡</span> Blanco</li>
                          <li><span className="heart-bullet">♡</span> Rosa</li>
                          <li><span className="heart-bullet">♡</span> Rosa fuerte</li>
                          <li><span className="heart-bullet">♡</span> Morado</li>
                        </ul>
                      </div>
                    </div>

                    <div className="option-category">
                      <h4 className="category-title">Flores eternas</h4>
                      <div className="category-divider"></div>
                      <ul className="option-list">
                        <li><span className="bullet">•</span> 7 rosas <span className="color-info">(1-2 colores)</span></li>
                        <li><span className="bullet">•</span> 12 rosas <span className="color-info">(1-3 colores)</span></li>
                        <li><span className="bullet">•</span> 24 rosas <span className="color-info">(1-3 colores)</span></li>
                        <li><span className="bullet">•</span> 36 rosas <span className="color-info">(1-4 colores)</span></li>
                        <li><span className="bullet">•</span> 50 rosas <span className="color-info">(1-4 colores)</span></li>
                        <li><span className="bullet">•</span> 75 rosas <span className="color-info">(1-4 colores)</span></li>
                        <li><span className="bullet">•</span> 100 rosas <span className="color-info">(1-4 colores)</span></li>
                      </ul>
                      <div className="colors-available">
                        <h5>Colores Disponibles:</h5>
                        <ul className="colors-list">
                          <li><span className="heart-bullet">♡</span> Rojo</li>
                          <li><span className="heart-bullet">♡</span> Blanco</li>
                          <li><span className="heart-bullet">♡</span> Rosa</li>
                          <li><span className="heart-bullet">♡</span> Beige</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </section>

                <div className="section-divider"></div>

                {/* Section 4: Extras */}
                <section className="valentine-section" ref={extrasRef}>
                  <h3 className="section-title">Extras Disponibles</h3>
                  
                  <div className="extras-card">
                    <ul className="extras-list">
                      <li><span className="heart-bullet">♡</span> Mensaje personalizado en listón</li>
                      <li><span className="heart-bullet">♡</span> Pins de diamante</li>
                      <li><span className="heart-bullet">♡</span> Baby's Breath</li>
                      <li><span className="heart-bullet">♡</span> Coronas</li>
                      <li><span className="heart-bullet">♡</span> Mariposas</li>
                      <li><span className="heart-bullet">♡</span> Peluches</li>
                      <li><span className="heart-bullet">♡</span> Malla de perlas</li>
                    </ul>
                  </div>

                  <div className="plushies-section">
                    <h4 className="plushies-title">Peluches Disponibles</h4>
                    <div className="plushies-showcase">
                      <img 
                        src={valentinePlushies} 
                        alt="Peluches disponibles para San Valentín" 
                        className="plushies-showcase-img"
                      />
                    </div>
                  </div>
                </section>

              </div>

              {/* Contact Footer */}
              <div className="valentine-modal-footer">
                <p className="footer-text">Para ordenar, contáctanos:</p>
                <div className="footer-contact">
                  <a href="sms:9152074262" className="contact-button">
                    Text: 915-207-4262
                  </a>
                  <a href="https://www.facebook.com/people/%F0%9D%99%B5%F0%9D%9A%95%F0%9D%9A%98%F0%9D%9A%A0%F0%9D%9A%8E%F0%9D%9A%9B%F0%9D%9A%9C-%F0%9D%9A%8B%F0%9D%9A%A2-%F0%9D%95%84%F0%9D%95%96%F0%9D%95%9D%F0%9D%95%9A%F0%9D%95%93%F0%9D%95%96%F0%9D%95%96/61578006152375/" target="_blank" rel="noopener noreferrer" className="contact-button">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="#1877F2" style={{flexShrink: 0}}>
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Flowers by Melibee
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ValentineBanner;
