// components/ItemCardContainer.js
import React, { useState, useEffect } from "react";
import ItemCard from "./ItemCard";
import EnlargedModal from "./EnlargedModal"; // modal is separate now
import { logEvent } from "firebase/analytics";
import { analytics } from "../firebaseConfig";
import "./ItemCardContainer.css";

const ItemCardContainer = ({ items }) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const handleSelect = (item) => {
    setSelectedItem(item);
    setCurrentImageIndex(0);
    try {
      logEvent(analytics, 'select_item', { item_name: item.name });
    } catch (e) {}
  };

  const handleClose = () => {
    setSelectedItem(null);
    setCurrentImageIndex(0);
  };

  const handleNextImage = () => {
    if (!selectedItem || selectedItem.images.length <= 1) return;
    setIsLoading(true);
    const nextIndex = (currentImageIndex + 1) % selectedItem.images.length;
    setCurrentImageIndex(nextIndex);
  };

  useEffect(() => {
    if (selectedItem) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [selectedItem]);

  useEffect(() => {
    if (selectedItem) {
      setIsLoading(true);
      const image = new Image();
      // Preload WebP version instead of fallback
      image.src = selectedItem.images[currentImageIndex].webp;
      image.onload = () => setIsLoading(false);
    }
  }, [selectedItem, currentImageIndex]);

  return (
    <>
      <div className="cards-container">
        {items.map((item) => (
          <ItemCard
            key={item.id}
            item={item}
            onClick={() => handleSelect(item)}
          />
        ))}
      </div>

      {selectedItem && (
        <EnlargedModal
          item={selectedItem}
          currentImageIndex={currentImageIndex}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          handleClose={handleClose}
          handleClick={handleNextImage}
        />
      )}
    </>
  );
};

export default ItemCardContainer;
