import { createContext, useContext, useState, useEffect } from 'react';
import { getCart, addToCart as addAPI, updateCartItem, removeCartItem, clearCart as clearAPI } from '../api/cartService';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();

  const fetchCart = async () => {
    if (!isAuthenticated || !user?.id) return;
    setLoading(true);
    try {
      const res = await getCart(user.id);
      const items = res.data?.data?.items || res.data?.data || [];
      setCartItems(items);
      updateCartMeta(items);
    } catch (err) {
      console.error('Failed to fetch cart:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateCartMeta = (items) => {
    const count = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const total = items.reduce((sum, item) => sum + (item.unitPrice || item.price || 0) * (item.quantity || 1), 0);
    setCartCount(count);
    setCartTotal(total);
  };

  useEffect(() => {
    fetchCart();
  }, [isAuthenticated, user?.id]);

  const addToCart = async (productId, quantity = 1, price = 0, productName = '') => {
    if (!isAuthenticated || !user?.id) {
      toast.error('Please login to add items to cart');
      return false;
    }
    try {
      // Backend CartItemRequest expects Long productId (DB id) and Integer quantity
      await addAPI(user.id, { productId: Number(productId), quantity });
      await fetchCart();
      toast.success('Added to cart! 🛒');
      return true;
    } catch (err) {
      console.error('Cart error:', err.response?.data || err);
      toast.error(err.response?.data?.message || 'Failed to add item to cart');
      return false;
    }
  };

  const updateItem = async (itemId, quantity) => {
    try {
      await updateCartItem(user.id, itemId, quantity);
      await fetchCart();
    } catch (err) {
      toast.error('Failed to update item');
    }
  };

  const removeItem = async (itemId) => {
    try {
      await removeCartItem(user.id, itemId);
      await fetchCart();
      toast.success('Item removed from cart');
    } catch (err) {
      toast.error('Failed to remove item');
    }
  };

  const clearCartItems = async () => {
    try {
      await clearAPI(user.id);
      setCartItems([]);
      setCartCount(0);
      setCartTotal(0);
    } catch (err) {
      toast.error('Failed to clear cart');
    }
  };

  const value = {
    cartItems, cartCount, cartTotal, loading,
    addToCart, updateItem, removeItem, clearCartItems, fetchCart
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
