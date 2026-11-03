import React, { useState, useEffect } from "react";
import "./HomePage.css";
import ItemCardContainer from "../components/ItemCardContainer";
import Hero from "../components/Hero";
import Footer from "../components/Footer";
// import ValentineBanner from "../components/ValentineBanner";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { getOptimizedUrl } from "../services/cloudinary";

const HomePage = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Real-time categories listener
    const unsubCategories = onSnapshot(collection(db, "categories"), (catSnapshot) => {
      const catData = catSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setCategories(catData);
    }, (error) => {
      console.error("Error listening to categories:", error);
    });

    // 2. Real-time items listener
    const unsubItems = onSnapshot(collection(db, "items"), (itemsSnapshot) => {
      const itemsData = itemsSnapshot.docs.map(doc => {
        const data = doc.data();
        const urls = data.imageUrls || (data.imageUrl ? [data.imageUrl] : []);
        
        return {
          ...data,
          id: doc.id,
          images: urls.map(url => {
            const fastUrl = getOptimizedUrl(url, 800);
            return { webp: fastUrl, fallback: fastUrl };
          }),
          blurhashes: data.blurhashes || (data.blurhash ? [data.blurhash] : [])
        };
      });
      
      setItems(itemsData);
      setLoading(false);
    }, (error) => {
      console.error("Error listening to items:", error);
      setLoading(false);
    });

    return () => {
      unsubCategories();
      unsubItems();
    };
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
              const categoryItems = items.filter(item => {
                const ids = Array.isArray(item.categoryIds) 
                  ? item.categoryIds 
                  : [item.categoryId, item.category].filter(Boolean);

                return (
                  ids.includes(category.id) ||
                  ids.includes(category.name) ||
                  item.categoryId === category.id || 
                  item.categoryId === category.name ||
                  item.category === category.name ||
                  item.category === category.id
                );
              });
              if (categoryItems.length === 0) return null;
              
              // Sort items by custom category itemOrder if configured
              const orderList = category.itemOrder || [];
              if (orderList.length > 0) {
                categoryItems.sort((a, b) => {
                  const idxA = orderList.indexOf(a.id);
                  const idxB = orderList.indexOf(b.id);
                  if (idxA !== -1 && idxB !== -1) return idxA - idxB;
                  if (idxA !== -1) return -1;
                  if (idxB !== -1) return 1;
                  return 0;
                });
              }

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
            {items.filter(item => {
              const ids = Array.isArray(item.categoryIds) 
                ? item.categoryIds 
                : [item.categoryId, item.category].filter(Boolean);

              const hasCategory = categories.some(cat => 
                ids.includes(cat.id) ||
                ids.includes(cat.name) ||
                cat.id === item.categoryId || 
                cat.name === item.categoryId ||
                cat.name === item.category ||
                cat.id === item.category
              );
              return !hasCategory;
            }).length > 0 && (
              <div className="category-group" style={{ marginBottom: '3rem' }}>
                <h3 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#555', fontSize: '1.5rem' }}>
                  Otros
                </h3>
                <ItemCardContainer items={items.filter(item => {
                  const ids = Array.isArray(item.categoryIds) 
                    ? item.categoryIds 
                    : [item.categoryId, item.category].filter(Boolean);

                  const hasCategory = categories.some(cat => 
                    ids.includes(cat.id) ||
                    ids.includes(cat.name) ||
                    cat.id === item.categoryId || 
                    cat.name === item.categoryId ||
                    cat.name === item.category ||
                    cat.id === item.category
                  );
                  return !hasCategory;
                })} />
              </div>
            )}
          </div>
        )}
      </section>


      <Footer />
    </div>
  );
};

export default HomePage;
