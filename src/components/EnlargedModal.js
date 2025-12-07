// EnlargedModal.js
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Blurhash } from "react-blurhash";
import "./EnlargedModal.css";

const EnlargedModal = ({
  item,
  currentImageIndex,
  isLoading,
  setIsLoading,
  handleClose,
  handleClick,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [loadedIndices, setLoadedIndices] = useState(new Set());
  const imgRef = React.useRef(null);
  const blurhashSize = Math.min(window.innerWidth * 0.9, 600);

  // Check if this image was already loaded in this session
  const wasAlreadyLoaded = loadedIndices.has(currentImageIndex);

  // Reset loaded state when image changes (unless it was already loaded)
  useEffect(() => {
    if (wasAlreadyLoaded) {
      setImageLoaded(true);
    } else {
      setImageLoaded(false);
    }
  }, [currentImageIndex, wasAlreadyLoaded]);

  // Check if cached image is already complete after render
  useEffect(() => {
    if (wasAlreadyLoaded && imgRef.current) {
      // Use a small timeout to ensure the img src has been set
      const timer = setTimeout(() => {
        if (imgRef.current && imgRef.current.complete && imgRef.current.naturalHeight !== 0) {
          setImageLoaded(true);
        }
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [currentImageIndex, wasAlreadyLoaded]);

  // Preload adjacent images for smooth navigation
  useEffect(() => {
    const preloadImages = [];
    const totalImages = item.images.length;
    
    // Preload next image
    const nextIndex = (currentImageIndex + 1) % totalImages;
    const nextImg = new Image();
    nextImg.src = item.images[nextIndex].webp;
    preloadImages.push(nextImg);
    
    // Preload previous image
    const prevIndex = (currentImageIndex - 1 + totalImages) % totalImages;
    const prevImg = new Image();
    prevImg.src = item.images[prevIndex].webp;
    preloadImages.push(prevImg);
    
    return () => {
      // Cleanup
      preloadImages.forEach(img => {
        img.src = '';
      });
    };
  }, [currentImageIndex, item.images]);

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (entry.target.offsetHeight > 100) {
          document.body.classList.add("bottom-nav-up");
        } else {
          document.body.classList.remove("bottom-nav-up");
        }
      }
    });

    const bottomNav = document.querySelector(".bottom-nav");
    if (bottomNav) observer.observe(bottomNav);

    return () => {
      if (bottomNav) observer.unobserve(bottomNav);
    };
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        className="modal-backdrop"
        onClick={(e) => {
          if (
            e.target.classList.contains("modal-backdrop") ||
            e.target.classList.contains("back-arrow")
          ) {
            handleClose();
          }
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="image-counter"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {`${currentImageIndex + 1} / ${item.images.length}`}
        </motion.div>

        <div
          className={`modal-frame ${imageLoaded ? "loaded" : ""}`}
          onClick={handleClick}
        >
          {/* Blurhash - only render if image hasn't been loaded before */}
          {item.blurhashes && !wasAlreadyLoaded && (
            <div className={`blurhash-container ${!imageLoaded ? "visible" : ""}`}>
              <Blurhash
                hash={item.blurhashes[currentImageIndex]}
                width={blurhashSize}
                height={blurhashSize}
                resolutionX={32}
                resolutionY={32}
                punch={1}
              />
              <div className="spinner-overlay">
                <div className="spinner" />
              </div>
            </div>
          )}

          {/* Image - fades in when loaded */}
          <div className="modal-image-wrapper">
            <picture key={currentImageIndex}>
              <source srcSet={item.images[currentImageIndex].webp} type="image/webp" />
              <img
                ref={imgRef}
                className="enlarged-image"
                src={item.images[currentImageIndex].fallback}
                alt={item.name}
                style={{
                  opacity: imageLoaded ? 1 : 0,
                  transition: wasAlreadyLoaded ? "none" : "opacity 0.3s ease-in-out"
                }}
                onLoad={(e) => {
                  setIsLoading(false);
                  setImageLoaded(true);
                  setLoadedIndices(prev => new Set(prev).add(currentImageIndex));
                }}
              />
            </picture>
          </div>
        </div>

        <div className="tap-text">
          Presione imagen para siguiente imagen
        </div>

        <motion.div
          className="back-arrow"
          onClick={handleClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          ← Regresar
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EnlargedModal;
