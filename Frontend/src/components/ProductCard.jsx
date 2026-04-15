import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiShoppingCart, FiStar } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { addToWishlist, removeFromWishlist } from '../api/wishlistService';
import { getProductImage } from '../utils/productImages';
import toast from 'react-hot-toast';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const [isLiked, setIsLiked] = useState(false); // Local state for immediate UI feedback

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }
    // Backend expects numeric product.id (Long), not string productId
    await addToCart(product.id, 1, product.price, product.name);
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Please login to add to wishlist');
      return;
    }
    try {
      if (isLiked) {
        await removeFromWishlist(user.id, product.id);
        setIsLiked(false);
        toast.success('Removed from wishlist');
      } else {
        await addToWishlist(user.id, product.id);
        setIsLiked(true);
        toast.success('Added to wishlist! ❤️');
      }
    } catch (err) {
      if (err.response?.status === 409 || err.response?.status === 400) {
        // If conflict (409) or bad request (maybe already there), try to remove it (toggle off)
         try {
            await removeFromWishlist(user.id, product.id);
            setIsLiked(false);
            toast.success('Removed from wishlist');
         } catch {
            toast.error('Failed to update wishlist');
         }
      } else {
        toast.error('Connect failed. Please try again.');
        console.error(err);
      }
    }
  };

  const productLink = product.productId || product.id;
  const productImage = getProductImage(product);

  return (
    <Link to={`/product/${productLink}`} className="group block">
      <div className="glass-card overflow-hidden hover:border-primary-500/30 transition-all duration-500
                      hover:shadow-xl hover:shadow-primary-500/10 hover:-translate-y-1">
        {/* Image */}
        <div className="relative aspect-[3/4] overflow-hidden theme-bg-elevated">
          <img
            src={productImage}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            loading="lazy"
            onError={(e) => { e.target.src = `https://placehold.co/400x500/1a1a2e/D4A574?text=${encodeURIComponent(product.name || 'Product')}`; }}
          />
          {/* Overlay Actions */}
          <div className="absolute inset-0 bg-gradient-to-t from-dark-500/80 via-transparent to-transparent
                          opacity-0 group-hover:opacity-100 transition-opacity duration-300
                          flex items-end justify-center pb-4 gap-3">
            <button onClick={handleAddToCart}
              className="bg-primary-500 hover:bg-primary-600 text-white p-3 rounded-full
                         transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-75
                         shadow-lg shadow-primary-500/30">
              <FiShoppingCart className="w-5 h-5" />
            </button>
            <button onClick={handleWishlist}
              className={`p-3 rounded-full transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-150 border backdrop-blur-sm
                         ${isLiked ? 'bg-primary-500 text-white border-primary-500' : 'bg-white/10 text-white border-white/20 hover:border-primary-500 hover:bg-primary-500'}`}>
              <FiHeart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Badges */}
          {product.isFeatured && (
            <span className="absolute top-3 left-3 badge-gold">
              <FiStar className="w-3 h-3 mr-1" /> Featured
            </span>
          )}
          {product.stock <= 5 && product.stock > 0 && (
            <span className="absolute top-3 right-3 badge bg-red-500/20 text-red-500">
              Only {product.stock} left
            </span>
          )}
        </div>

        {/* Info */}
        <div className="p-4 space-y-2">
          <p className="theme-text-muted text-xs uppercase tracking-wider">
            {product.categoryName || 'Collection'}
          </p>
          <h3 className="theme-text font-medium text-sm group-hover:text-gold-300 transition-colors line-clamp-1">
            {product.name}
          </h3>
          <div className="flex items-center justify-between">
            <p className="text-gold-300 font-heading text-lg font-semibold">
              ₹{product.price?.toLocaleString('en-IN')}
            </p>
            {product.originalPrice && product.originalPrice > product.price && (
              <p className="theme-text-muted text-sm line-through">
                ₹{product.originalPrice?.toLocaleString('en-IN')}
              </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
