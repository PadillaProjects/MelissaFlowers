// components/ItemCard.js
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Blurhash } from "react-blurhash";
import "./ItemCard.css";

const ItemCard = ({ item, onClick }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <motion.div
      className="card"
      onClick={onClick}
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.05 }}
    >
      <div className="image-container">
        <div className="card-image-wrapper">
          {item.blurhashes?.[0]?.length >= 6 && (
            <Blurhash
              hash={item.blurhashes[0]}
              width={32}
              height={32}
              resolutionX={32}
              resolutionY={32}
              punch={1}
              className="blurhash-canvas"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                opacity: imageLoaded ? 0 : 1,
                transition: "opacity 0.3s ease-in-out",
                zIndex: 1
              }}
            />
          )}
          <picture>
            <source srcSet={item.images[0].webp} type="image/webp" />
            <img
              className="card-image"
              src={item.images[0].fallback}
              alt={item.name}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              style={{
                opacity: imageLoaded ? 1 : 0,
                transition: "opacity 0.3s ease-in-out"
              }}
            />
          </picture>
        </div>
      </div>
      {item.name && <h3 className="item-name">{item.name}</h3>}
      {item.price && <h4 className="item-price">{item.price}</h4>}
    </motion.div>
  );
};

export default ItemCard;
