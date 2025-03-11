import React from "react";
import { Link } from "react-router-dom";
import ItemCard from "../components/ItemCard";
import "./HomePage.css";

// Function to get WebP or fallback image dynamically
const getImagePath = (imageName) => {
  const supportsWebP =
    document
      .createElement("canvas")
      .toDataURL("image/webp")
      .indexOf("data:image/webp") !== -1;

  // Try to load WebP first, otherwise fallback to PNG
  try {
    return supportsWebP
      ? require(`../assets/webp/${imageName}.webp`)
      : require(`../assets/${imageName}.png`);
  } catch (error) {
    console.warn(`Image not found: ${imageName}`, error);
    return "";
  }
};

const items = [
  {
    id: 1,
    name: "Gerveras con Rosas",
    images: [getImagePath("GerveraYRosas")],
    description: "Gerveras con Rosas",
  },
  {
    id: 2,
    name: "Eterno Romance",
    images: [getImagePath("Rosas1"), getImagePath("Rosas2")],
    description: "Rosas",
    price: "$45",
  },
  {
    id: 3,
    name: "Colores de Corazón",
    images: [getImagePath("Gerveras1"), getImagePath("Gerveras2")],
    description: "Gerveras",
    price: "$55",
  },
  {
    id: 4,
    name: "Gerveras de Corazón",
    images: [getImagePath("GerverasDeAmor1")],
    description: "Gerveras",
    price: "$55",
  },
  {
    id: 5,
    name: "Amor Eterno",
    images: [getImagePath("AmorEterno"), getImagePath("AmorEterno2")],
    description: "Ramo Eterno de Liston",
    price: "$65",
  },
  {
    id: 6,
    name: "Sol Eterno",
    images: [getImagePath("SolEterno"), getImagePath("SolEterno2")],
    description: "Girasol Eterno de Liston",
    price: "$20",
  },
  {
    id: 7,
    name: "Canasta Festiva",
    images: [getImagePath("CanastaFestiva"), getImagePath("CanastaFestiva2")],
    description: "Canasta de Navidad",
  },
  {
    id: 8,
    name: "Love Rose",
    images: [getImagePath("LoveRose")],
    description: "Rosa De Amor",
    price: "$6",
  },
];

const HomePage = () => {
  return (
    <div className="page-layout">
      <div className="vertical-column"></div>
      <div className="page-column">
        <div>
          <div className="cards-container">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </div>
      <div className="vertical-column"></div>
    </div>
  );
};

export default HomePage;
