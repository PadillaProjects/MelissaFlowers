import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useCart } from '../context/CartContext';
import './SalePage.css';

const SalePage = () => {
  const { saleSlug } = useParams();
  const navigate = useNavigate();
  const { cart, addToCart, cartTotal, updateQuantity, removeFromCart } = useCart();
  
  const [sale, setSale] = useState(null);
  const [saleItems, setSaleItems] = useState([]);
  const [bolisCategories, setBolisCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSaleData = async () => {
      try {
        // Fetch Sale by slug
        const q = query(collection(db, 'sales'), where('slug', '==', saleSlug));
        const saleSnapshot = await getDocs(q);
        
        if (saleSnapshot.empty) {
          setError('Sale not found.');
          setLoading(false);
          return;
        }

        const saleDoc = saleSnapshot.docs[0];
        setSale({ id: saleDoc.id, ...saleDoc.data() });

        // Fetch Sale Items
        const itemsSnapshot = await getDocs(collection(db, `sales/${saleDoc.id}/saleItems`));
        const itemsList = itemsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setSaleItems(itemsList);
        
        // Fetch Bolis Categories for grouping
        const bolisCatSnapshot = await getDocs(collection(db, "bolisCategories"));
        setBolisCategories(bolisCatSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error("Error fetching sale:", err);
        setError("Error loading sale.");
      } finally {
        setLoading(false);
      }
    };

    fetchSaleData();
  }, [saleSlug]);

  if (loading) return <div className="sale-page loading">Loading...</div>;
  if (error) return <div className="sale-page error">{error}</div>;

  // Group sale items by category based on flavor name matching
  const groupedItems = {};
  
  saleItems.forEach(item => {
    let assignedCategory = "Other";
    
    // Find which category has this flavor
    for (const cat of bolisCategories) {
      if (cat.flavors && cat.flavors.includes(item.name)) {
        assignedCategory = cat.name;
        break;
      }
    }
    
    if (!groupedItems[assignedCategory]) {
      groupedItems[assignedCategory] = [];
    }
    groupedItems[assignedCategory].push(item);
  });

  return (
    <div className="sale-page">
      <div className="sale-header">
        <h1>{sale.name}</h1>
        {sale.location && <p className="sale-info"><strong>Location:</strong> {sale.location}</p>}
        {sale.time && <p className="sale-info"><strong>Time:</strong> {sale.time}</p>}
      </div>

      <div className="sale-items-list">
        {saleItems.length === 0 ? (
          <p>No items available for this sale yet.</p>
        ) : (
          Object.keys(groupedItems).map(categoryName => (
            <div key={categoryName} className="sale-category-section">
              <h2 className="sale-category-title">{categoryName}</h2>
              {groupedItems[categoryName].map(item => {
                const cartItem = cart.find(c => c.id === item.id);
                const qtyInCart = cartItem ? cartItem.quantity : 0;
                
                let isSoldOut = false;
                if (item.inventoryMode === 'tracked' && item.quantityAvailable <= 0) {
                  isSoldOut = true;
                }

                let maxAllowedToAdd = 99;
                if (item.inventoryMode === 'tracked') {
                  maxAllowedToAdd = item.quantityAvailable - qtyInCart;
                } else if (item.inventoryMode === 'unlimited' && item.maxPerOrder) {
                  maxAllowedToAdd = item.maxPerOrder - qtyInCart;
                }

                const handleIncrease = () => {
                  if (maxAllowedToAdd > 0 && !isSoldOut) {
                    addToCart(item, 1);
                  }
                };

                const handleDecrease = () => {
                  if (qtyInCart > 1) {
                    updateQuantity(item.id, qtyInCart - 1);
                  } else if (qtyInCart === 1) {
                    removeFromCart(item.id);
                  }
                };

                return (
                  <div key={item.id} className="sale-item-row">
                    <div className="sale-item-details">
                      <h3>{item.name}</h3>
                      <p className="sale-item-size">{item.size}</p>
                      <p className="sale-item-price">${Number(item.price).toFixed(2)}</p>
                      
                      {item.inventoryMode === 'tracked' ? (
                        <p className="sale-item-inventory">
                          {item.quantityAvailable > 0 ? `${item.quantityAvailable} available` : 'Sold Out'}
                        </p>
                      ) : (
                        <p className="sale-item-inventory" style={{ color: '#888' }}>
                          Limit: {item.maxPerOrder} per order
                        </p>
                      )}
                    </div>

                    <div className="sale-item-actions">
                      {qtyInCart > 0 ? (
                        <div className="quantity-stepper">
                          <button className="stepper-btn" onClick={handleDecrease}>-</button>
                          <span className="quantity-display">{qtyInCart}</span>
                          <button className="stepper-btn" onClick={handleIncrease} disabled={maxAllowedToAdd <= 0 || isSoldOut}>+</button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => addToCart(item, 1)} 
                          disabled={isSoldOut || maxAllowedToAdd <= 0}
                          className="add-to-cart-btn"
                        >
                          {isSoldOut ? 'Sold Out' : (maxAllowedToAdd <= 0 ? 'Max Limit Reached' : 'Add to Order')}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>

      {cart.length > 0 && (
        <div className="floating-cart">
          <div className="cart-summary">
            <span>{cart.reduce((total, item) => total + item.quantity, 0)} items</span>
            <span>Total: ${cartTotal.toFixed(2)}</span>
          </div>
          <button onClick={() => navigate(`/sale/${saleSlug}/checkout`)} className="checkout-btn">
            Order
          </button>
        </div>
      )}
    </div>
  );
};

export default SalePage;
