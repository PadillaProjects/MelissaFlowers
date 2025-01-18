import React from "react";
import { Link } from "react-router-dom";
import ItemCard from "../components/ItemCard";
import bouquee from "../assets/bouquee.webp";
import gerverayrosas from "../assets/GerveraYRosas.png";
import rosas1 from "../assets/Rosas1.JPG";
import rosas2 from "../assets/Rosas2.JPG";
import rosas3 from "../assets/Rosas3.JPG";
import Gerveras1 from "../assets/Gerveras1.JPG";
import Gerveras2 from "../assets/Gerveras2.JPG";
import Gerveras3 from "../assets/Gerveras3.JPG";
import Gerveras4 from "../assets/Gerveras4.JPG";
import "./HomePage.css";

const HomePage = () => {
  const items = [
    {
      id: 1,
      name: "Gerveras con Rosas",
      images: [gerverayrosas],
      description: "Gerveras con Rosas",
    },
    {
      id: 2,
      name: "Eterno Romance",
      images: [rosas1, rosas2, rosas3],
      description: "Rosas",
    },
    {
      id: 3,
      name: "Colores de Corazón",
      images: [Gerveras1, Gerveras2, Gerveras3, Gerveras4],
      description: "Gerveras",
    },
  ];

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
