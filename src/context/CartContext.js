import React, { createContext, useState, useContext } from 'react';

const CartContext = createContext();

export const useCart = () => {
  return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  // Add item to cart
  const addToCart = (item, quantity = 1) => {
    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex((cartItem) => cartItem.id === item.id);
      
      if (existingItemIndex >= 0) {
        // Update quantity if item already in cart
        const updatedCart = [...prevCart];
        const itemToUpdate = { ...updatedCart[existingItemIndex] };
        const newQuantity = itemToUpdate.quantity + quantity;
        
        // Respect limits
        let finalQuantity = newQuantity;
        if (item.inventoryMode === 'tracked' && item.quantityAvailable !== undefined) {
          finalQuantity = Math.min(newQuantity, item.quantityAvailable);
        } else if (item.inventoryMode === 'unlimited' && item.maxPerOrder !== undefined) {
          finalQuantity = Math.min(newQuantity, item.maxPerOrder);
        }
        
        itemToUpdate.quantity = finalQuantity;
        updatedCart[existingItemIndex] = itemToUpdate;
        return updatedCart;
      } else {
        // Add new item
        let finalQuantity = quantity;
        if (item.inventoryMode === 'tracked' && item.quantityAvailable !== undefined) {
          finalQuantity = Math.min(quantity, item.quantityAvailable);
        } else if (item.inventoryMode === 'unlimited' && item.maxPerOrder !== undefined) {
          finalQuantity = Math.min(quantity, item.maxPerOrder);
        }
        
        return [...prevCart, { ...item, quantity: finalQuantity }];
      }
    });
  };

  // Remove item entirely
  const removeFromCart = (itemId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== itemId));
  };

  // Update item quantity directly
  const updateQuantity = (itemId, newQuantity) => {
    setCart((prevCart) => {
      return prevCart.map((item) => {
        if (item.id === itemId) {
          let finalQuantity = newQuantity;
          if (item.inventoryMode === 'tracked' && item.quantityAvailable !== undefined) {
            finalQuantity = Math.min(newQuantity, item.quantityAvailable);
          } else if (item.inventoryMode === 'unlimited' && item.maxPerOrder !== undefined) {
            finalQuantity = Math.min(newQuantity, item.maxPerOrder);
          }
          return { ...item, quantity: finalQuantity };
        }
        return item;
      });
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce((total, item) => total + (Number(item.price) * item.quantity), 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
};
