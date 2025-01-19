import React from "react";
import { Link } from "react-router-dom";
import ItemCard from "../components/ItemCard";
import gerverayrosas from "../assets/GerveraYRosas.png";
import rosas1 from "../assets/Rosas1.png";
import rosas2 from "../assets/Rosas2.png";
import Gerveras1 from "../assets/Gerveras1.png";
import Gerveras2 from "../assets/Gerveras2.png";
import GerverasDeAmor1 from "../assets/GerverasDeAmor1.png";
import AmorEterno from "../assets/AmorEterno.png";
import AmorEterno2 from "../assets/AmorEterno2.png";
import SolEterno from "../assets/SolEterno.png";
import SolEterno2 from "../assets/SolEterno2.png";
import CanastaFestiva from "../assets/CanastaFestiva.png";
import CanastaFestiva2 from "../assets/CanastaFestiva2.png";
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
      images: [rosas1, rosas2],
      description: "Rosas",
    },
    {
      id: 3,
      name: "Colores de Corazón",
      images: [Gerveras1, Gerveras2],
      description: "Gerveras",
    },
    {
      id: 4,
      name: "Gerveras de Corazón",
      images: [GerverasDeAmor1],
      description: "Gerveras",
    },
    {
      id: 5,
      name: "Amor Eterno",
      images: [AmorEterno, AmorEterno2],
      description: "Ramo Eterno de Liston",
    },
    {
      id: 6,
      name: "Sol Eterno",
      images: [SolEterno, SolEterno2],
      description: "Girasol Eterno de Liston",
    },
    {
      id: 7,
      name: "Canasta Festiva",
      images: [CanastaFestiva, CanastaFestiva2],
      description: "Canasta de Navidad",
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
