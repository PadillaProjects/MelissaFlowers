// Header.js
import React, { useEffect, useState } from "react";
import "./ItemCard.css"; // CSS for styling the Header
import { motion, AnimatePresence } from "framer-motion";

const ItemCard = ({ item }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const [isEnlarged, setIsEnlarged] = useState(false);

  const handleEnlarge = () => {
    setIsEnlarged(true); // Open modal
  };

  const handleClose = (e) => {
    // Close modal only if clicking outside the image
    if (e.target.classList.contains("modal-backdrop")) {
      setIsEnlarged(false);
    }
  };

  const handleClick = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % item.images.length);
  };

  useEffect(() => {
    if (isEnlarged) {
      document.body.style.overflow = "hidden"; // Disable scrolling
    } else {
      document.body.style.overflow = "auto"; // Enable scrolling
    }

    // Cleanup on component unmount
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isEnlarged]);

  return (
    <>
      <motion.div
        className="card"
        onClick={handleEnlarge}
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
      >
        <div className="image-container">
          <img
            className="card-image"
            src={item.images[0]}
            alt={item.name}
          ></img>
        </div>
        <h3 className="item-name">{item.name}</h3>
      </motion.div>

      <AnimatePresence>
        {isEnlarged && (
          <motion.div
            className="modal-backdrop"
            onClick={handleClose} // Close when clicking on the backdrop
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Counter for image index */}
            <motion.div
              className="image-counter"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {`${currentImageIndex + 1} / ${item.images.length}`}
            </motion.div>

            <motion.img
              className="enlarged-image"
              src={item.images[currentImageIndex]} // Show the first image
              alt={item.name}
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.5 }}
              transition={{ duration: 0.3 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleClick}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ItemCard;
