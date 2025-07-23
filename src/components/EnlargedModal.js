// EnlargedModal.js
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Blurhash } from "react-blurhash";
import "./EnlargedModal.css";
import { useEffect } from "react";

const EnlargedModal = ({
  item,
  currentImageIndex,
  isLoading,
  setIsLoading,
  handleClose,
  handleClick,
}) => {
  const [hasLoaded, setHasLoaded] = React.useState(false);
  const blurhashSize = Math.min(window.innerWidth * 0.9, 600);
  useEffect(() => {
    setHasLoaded(false);
  }, [currentImageIndex]);

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
          className={`modal-frame ${hasLoaded ? "loaded" : ""}`}
          onClick={handleClick}
        >
          {!hasLoaded && isLoading && item.blurhashes && (
            <div className="blurhash-container">
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

          <motion.img
            className="enlarged-image"
            src={item.images[currentImageIndex].fallback}
            alt={item.name}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{
              opacity: hasLoaded ? 1 : 0,
              scale: hasLoaded ? 1 : 0.95,
            }}
            transition={{ duration: 0.3 }}
            onLoad={() => {
              setIsLoading(false);
              setHasLoaded(true);
            }}
          />
        </div>
        <div className="tap-text">
          Tap outside to exit<br></br>Tap image for next image
        </div>

        <motion.div
          className="back-arrow"
          onClick={handleClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          ← Back
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EnlargedModal;
