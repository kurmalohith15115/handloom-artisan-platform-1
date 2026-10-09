import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

const defaultCart = [
  {
    id: 1,
    artisan_id: 1,
    name: 'Royal Blue Pochampally Ikat Silk Saree',
    description: 'Handwoven pure silk Pochampally saree featuring classic geometric patterns in vibrant royal blue and crimson. Includes running blouse piece.',
    price: 8500.00,
    stock: 5,
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600',
    category: 'Sarees',
    artisan_name: 'Srinivas Rao',
    quantity: 1
  },
  {
    id: 4,
    artisan_id: 2,
    name: 'Emerald Green Banarasi Silk Brocade Dupatta',
    description: 'Elevate any outfit with this fine silk dupatta featuring traditional motifs and a gold border.',
    price: 4200.00,
    stock: 8,
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600',
    category: 'Dupattas',
    artisan_name: 'Kamlesh Devi',
    quantity: 1
  }
];

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('handloom_cart');
    if (savedCart) {
      const parsed = JSON.parse(savedCart);
      if (parsed.length > 0) return parsed;
    }
    return defaultCart;
  });

  const [wishlist, setWishlist] = useState(() => {
    const savedWish = localStorage.getItem('handloom_wishlist');
    return savedWish ? JSON.parse(savedWish) : [];
  });

  useEffect(() => {
    localStorage.setItem('handloom_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem('handloom_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const addToCart = (product, quantity = 1) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);
      
      // Stock boundary check
      const currentQty = existingItem ? existingItem.quantity : 0;
      const newQty = Math.min(product.stock, currentQty + quantity);

      if (newQty <= 0) return prevItems;

      if (existingItem) {
        return prevItems.map((item) =>
          item.id === product.id ? { ...item, quantity: newQty } : item
        );
      } else {
        return [...prevItems, { ...product, quantity: newQty }];
      }
    });
  };

  const removeFromCart = (productId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId, quantity, stockLimit) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    const finalQty = Math.min(stockLimit, quantity);
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === productId ? { ...item, quantity: finalQty } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const toggleWishlist = (product) => {
    setWishlist((prevWishlist) => {
      const exists = prevWishlist.some((item) => item.id === product.id);
      if (exists) {
        return prevWishlist.filter((item) => item.id !== product.id);
      } else {
        return [...prevWishlist, product];
      }
    });
  };

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        wishlist,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        toggleWishlist,
        cartCount,
        cartTotal
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
