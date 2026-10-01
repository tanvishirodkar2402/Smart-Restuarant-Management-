import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [orderType, setOrderType] = useState('Dine-In'); // Dine-In, Takeaway, Delivery
  const [selectedTable, setSelectedTableState] = useState(() => {
    const saved = localStorage.getItem('selectedTable');
    return saved ? JSON.parse(saved) : null;
  });
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  const setSelectedTable = (table) => {
    setSelectedTableState(table);
    if (table) {
      localStorage.setItem('selectedTable', JSON.stringify(table));
    } else {
      localStorage.removeItem('selectedTable');
    }
  };

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (foodItem, quantity = 1, specialInstructions = '') => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.food_item_id === foodItem.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        if (specialInstructions) {
          updated[existingIndex].special_instructions = specialInstructions;
        }
        return updated;
      }
      return [
        ...prev,
        {
          food_item_id: foodItem.id,
          name: foodItem.name,
          price: parseFloat(foodItem.price),
          image_url: foodItem.image_url,
          quantity,
          special_instructions: specialInstructions,
        },
      ];
    });
  };

  const removeFromCart = (foodItemId) => {
    setCartItems((prev) => prev.filter((item) => item.food_item_id !== foodItemId));
  };

  const updateQuantity = (foodItemId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(foodItemId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.food_item_id === foodItemId ? { ...item, quantity: newQty } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setAppliedCoupon(null);
    localStorage.removeItem('cart');
  };

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const discountAmount = appliedCoupon
    ? appliedCoupon.discount_amount
    : 0;

  const taxAmount = Math.max(0, (subtotal - discountAmount) * 0.08);
  const totalAmount = Math.max(0, subtotal - discountAmount + taxAmount);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        subtotal,
        discountAmount,
        taxAmount,
        totalAmount,
        orderType,
        setOrderType,
        selectedTable,
        setSelectedTable,
        appliedCoupon,
        setAppliedCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
