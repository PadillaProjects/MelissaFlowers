import React from "react";
import { motion } from "framer-motion";
import "./BolisMenu.css";

const BolisMenu = ({ bolisCategories }) => {
  if (!bolisCategories || bolisCategories.length === 0) {
    return null; // Don't render if no bolis data
  }

  return (
    <section className="bolis-section" id="bolis">
      <motion.div 
        className="bolis-menu-container"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="bolis-header">
          <h2>Bolis</h2>
          <h3>MENÚ</h3>
        </div>

        <div className="bolis-content">
          {bolisCategories.map((category) => (
            <div key={category.id} className="bolis-category">
              <h4 className="bolis-category-title">{category.name}</h4>
              
              {category.sizes && category.sizes.length > 0 && (
                <div className="bolis-sizes">
                  Tamaños: {category.sizes.join(", ")}
                </div>
              )}
              
              {category.flavors && category.flavors.length > 0 && (
                <ul className="bolis-flavors-list">
                  {category.flavors.map((flavor, index) => (
                    <li key={index} className="bolis-flavor-item">
                      {flavor}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        <div className="bolis-footer">
          ¡Haz tu orden! Mándanos mensaje al:<br />
          (915)216-6078
        </div>
      </motion.div>
    </section>
  );
};

export default BolisMenu;
