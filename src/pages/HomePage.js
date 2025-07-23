import React from "react";
import "./HomePage.css";
import blurhashes from "../blurhashes.json";
import ItemCardContainer from "../components/ItemCardContainer";

// Function to get WebP or fallback image dynamically
const getImageSources = (imageName) => {
  try {
    return {
      webp: require(`../assets/webp/${imageName}.webp`),
      fallback: require(`../assets/${imageName}.jpg`),
    };
  } catch (error) {
    console.warn(`Missing image: ${imageName}`, error);
    return { webp: "", fallback: "" };
  }
};

const items = [
  {
    id: 9,
    name: "Arbol De Ensueño",
    images: [getImageSources("ArbolDeEnsueno")],
    blurhashes: [blurhashes["ArbolDeEnsueno"]],
    description: "Arbol De Ensueño",
  },
  {
    id: 10,
    name: "Blancura Mexicana",
    images: [getImageSources("BlancuraMexicana")],
    blurhashes: [blurhashes["BlancuraMexicana"]],
    description: "Blancura Mexicana",
  },
  {
    id: 11,
    name: "Media Luna",
    images: [getImageSources("MediaLuna1"), getImageSources("MediaLuna2")],
    blurhashes: [blurhashes["MediaLuna1"], blurhashes["MediaLuna2"]],
    description: "Media Luna",
  },
  {
    id: 12,
    name: "Pasión y Elegancia",
    images: [
      getImageSources("PasionYElegancia"),
      getImageSources("PassionYElegancia2"),
    ],
    blurhashes: [
      blurhashes["PasionYElegancia"],
      blurhashes["PassionYElegancia2"],
    ],
    description: "Pasión y Elegancia",
  },
  {
    id: 13,
    name: "Ramo Romántico",
    images: [getImageSources("RamoRomantico1")],
    blurhashes: [blurhashes["RamoRomantico1"]],
    description: "Ramo Romántico",
  },
  {
    id: 14,
    name: "Rosas Eternas",
    images: [
      getImageSources("RosasEternas1"),
      getImageSources("RosasEternas2"),
    ],
    blurhashes: [blurhashes["RosasEternas1"], blurhashes["RosasEternas2"]],
    description: "Rosas Eternas",
  },
  {
    id: 15,
    name: "Sueño de Princesa",
    images: [
      getImageSources("SuenoDePrincesa1"),
      getImageSources("SuenoDePrincesa2"),
    ],
    blurhashes: [
      blurhashes["SuenoDePrincesa1"],
      blurhashes["SuenoDePrincesa2"],
    ],
    description: "Sueño de Princesa",
  },
  {
    id: 1,
    name: "Gerveras con Rosas",
    images: [getImageSources("GerveraYRosas")],
    blurhashes: [blurhashes["GerveraYRosas"]],
    description: "Gerveras con Rosas",
  },
  {
    id: 2,
    name: "Eterno Romance",
    images: [getImageSources("Rosas1"), getImageSources("Rosas2")],
    blurhashes: [blurhashes["Rosas1"], blurhashes["Rosas2"]],
    description: "Rosas",
  },
  {
    id: 3,
    name: "Colores de Corazón",
    images: [getImageSources("Gerveras1"), getImageSources("Gerveras2")],
    blurhashes: [blurhashes["Gerveras1"], blurhashes["Gerveras2"]],
    description: "Gerveras",
  },
  {
    id: 4,
    name: "Gerveras de Corazón",
    images: [getImageSources("GerverasDeAmor1")],
    blurhashes: [blurhashes["GerverasDeAmor1"]],
    description: "Gerveras",
  },
  {
    id: 5,
    name: "Amor Eterno",
    images: [getImageSources("AmorEterno"), getImageSources("AmorEterno2")],
    blurhashes: [blurhashes["AmorEterno"], blurhashes["AmorEterno2"]],
    description: "Ramo Eterno de Liston",
  },
  {
    id: 6,
    name: "Sol Eterno",
    images: [getImageSources("SolEterno"), getImageSources("SolEterno2")],
    blurhashes: [blurhashes["SolEterno"], blurhashes["SolEterno2"]],
    description: "Girasol Eterno de Liston",
  },
  {
    id: 7,
    name: "Canasta Festiva",
    images: [
      getImageSources("CanastaFestiva"),
      getImageSources("CanastaFestiva2"),
    ],
    blurhashes: [blurhashes["CanastaFestiva"], blurhashes["CanastaFestiva2"]],
    description: "Canasta de Navidad",
  },
  {
    id: 8,
    images: [getImageSources("LoveRose")],
    blurhashes: [blurhashes["LoveRose"]],
    description: "Rosa De Amor",
  },

  // 🆕 New Items not originally listed:
  {
    id: 17,
    name: "Brillo de Sol",
    images: [getImageSources("BrilloDeSol1"), getImageSources("BrilloDeSol2")],
    blurhashes: [blurhashes["BrilloDeSol1"], blurhashes["BrilloDeSol2"]],
    description: "Brillo de Sol",
  },
  {
    id: 18,
    name: "Eventos",
    images: [getImageSources("Eventos1"), getImageSources("Eventos2")],
    blurhashes: [blurhashes["Eventos1"], blurhashes["Eventos2"]],
    description: "Eventos",
  },
  {
    id: 19,
    name: "Flor Eterna Individual",
    images: [
      getImageSources("FlorEternaIndividual1"),
      getImageSources("FlorEternaIndividual2"),
      getImageSources("FlorEternaIndividual3"),
    ],
    blurhashes: [
      blurhashes["FlorEternaIndividual1"],
      blurhashes["FlorEternaIndividual2"],
      blurhashes["FlorEternaIndividual3"],
    ],
    description: "Flor Eterna Individual",
  },
  {
    id: 20,
    name: "Rosas y Tulipanes",
    images: [
      getImageSources("RosasYTulipanes1"),
      getImageSources("RosasYTulipanes2"),
    ],
    blurhashes: [
      blurhashes["RosasYTulipanes1"],
      blurhashes["RosasYTulipanes2"],
    ],
    description: "Rosas y Tulipanes",
  },
];

const HomePage = () => {
  return (
    <div className="page-layout">
      <div className="vertical-column"></div>
      <div className="page-column">
        <ItemCardContainer items={items} />
      </div>
      <div className="vertical-column"></div>
    </div>
  );
};

export default HomePage;
