import React, { useState, useEffect } from "react";
import "./HomePage.css";
import ItemCardContainer from "../components/ItemCardContainer";
import Hero from "../components/Hero";
import Footer from "../components/Footer";
import BolisMenu from "../components/BolisMenu";
// import ValentineBanner from "../components/ValentineBanner";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { getOptimizedUrl } from "../services/cloudinary";

const HomePage = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [bolisCategories, setBolisCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const catSnapshot = await getDocs(collection(db, "categories"));
        const catData = catSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCategories(catData);

        const bolisCatSnapshot = await getDocs(collection(db, "bolisCategories"));
        const bolisCatData = bolisCatSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setBolisCategories(bolisCatData);

        const itemsSnapshot = await getDocs(collection(db, "items"));
        const itemsData = itemsSnapshot.docs.map(doc => {
          const data = doc.data();
          const urls = data.imageUrls || (data.imageUrl ? [data.imageUrl] : []);
          
          return {
            id: doc.id,
            ...data,
            images: urls.map(url => {
              const fastUrl = getOptimizedUrl(url, 800);
              return { webp: fastUrl, fallback: fastUrl };
            }),
            blurhashes: data.blurhashes || (data.blurhash ? [data.blurhash] : [])
          };
        });
        
        // Sort items by creation date if available, or just use as is
        setItems(itemsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="homepage">
      <Hero />
      {/* <ValentineBanner /> */}
      
      <section id="gallery" className="gallery-section">
        <div className="gallery-header">
          <h2 className="gallery-title">Colección</h2>
          <p className="gallery-subtitle">
            Mis Arreglos Florales
          </p>
        </div>
        
        {loading ? (
          <div style={{ textAlign: "center", padding: "2rem" }}>Cargando...</div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2rem" }}>No hay artículos disponibles.</div>
        ) : (
          <div className="categories-wrapper">
            {categories.map(category => {
              const categoryItems = items.filter(item => item.categoryId === category.id);
              if (categoryItems.length === 0) return null;
              
              return (
                <div key={category.id} className="category-group" style={{ marginBottom: '3rem' }}>
                  <h3 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#555', fontSize: '1.5rem' }}>
                    {category.name}
                  </h3>
                  <ItemCardContainer items={categoryItems} />
                </div>
              );
            })}
            
            {/* Items without a category */}
            {items.filter(item => !item.categoryId).length > 0 && (
              <div className="category-group" style={{ marginBottom: '3rem' }}>
                <h3 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#555', fontSize: '1.5rem' }}>
                  Otros
                </h3>
                <ItemCardContainer items={items.filter(item => !item.categoryId)} />
              </div>
            )}
          </div>
        )}
      </section>

      <BolisMenu bolisCategories={bolisCategories} />

      <Footer />
    </div>
  );
};

export default HomePage;
