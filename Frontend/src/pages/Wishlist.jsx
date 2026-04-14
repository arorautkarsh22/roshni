import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { getWishlist, removeFromWishlist } from '../api/wishlistService';
import Loader from '../components/Loader';
import { FiHeart, FiShoppingCart, FiTrash2 } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Wishlist = () => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const res = await getWishlist(user.id);
      setWishlistItems(res.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch wishlist:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (productId) => {
    try {
      await removeFromWishlist(user.id, productId);
      setWishlistItems(items => items.filter(i => i.productId !== productId && i.id !== productId));
      toast.success('Removed from wishlist');
    } catch {
      toast.error('Failed to remove item');
    }
  };

  const handleMoveToCart = async (item) => {
    const productId = item.productId || item.id;
    const success = await addToCart(productId, 1, item.price, item.productName || item.name);
    if (success) {
      await handleRemove(productId);
    }
  };

  if (loading) return <Loader size="lg" text="Loading your wishlist..." />;

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="section-heading mb-2">My Wishlist</h1>
        <p className="section-subheading mb-8">{wishlistItems.length} saved item{wishlistItems.length !== 1 ? 's' : ''}</p>

        {wishlistItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlistItems.map((item) => {
              const productId = item.productId || item.id;
              return (
                <div key={productId} className="glass-card overflow-hidden group animate-fade-in">
                  <Link to={`/product/${productId}`}>
                    <div className="aspect-[3/4] overflow-hidden bg-dark-300">
                      <img
                        src={item.productImage || item.imageUrl || `https://placehold.co/400x500/1a1a2e/D4A574?text=${encodeURIComponent(item.productName || item.name || 'Product')}`}
                        alt={item.productName || item.name || 'Product'}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        loading="lazy"
                      />
                    </div>
                  </Link>
                  <div className="p-4 space-y-3">
                    <Link to={`/product/${productId}`}
                      className="text-white font-medium text-sm hover:text-gold-300 transition-colors line-clamp-1 block">
                      {item.productName || item.name || 'Product'}
                    </Link>
                    <p className="text-gold-300 font-heading text-lg font-semibold">
                      ₹{(item.productPrice || item.price || 0).toLocaleString('en-IN')}
                    </p>
                    <div className="flex gap-2">
                      <button onClick={() => handleMoveToCart(item)}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-primary-500/20 text-primary-400
                                   hover:bg-primary-500 hover:text-white py-2 rounded-lg text-sm font-medium transition-all">
                        <FiShoppingCart className="w-4 h-4" /> Move to Cart
                      </button>
                      <button onClick={() => handleRemove(productId)}
                        className="p-2 bg-white/5 border border-white/10 rounded-lg text-gray-400
                                   hover:text-red-400 hover:border-red-500/30 transition-all">
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <FiHeart className="w-20 h-20 text-gray-700 mx-auto mb-4" />
            <h2 className="text-white text-2xl font-heading font-bold mb-2">Your wishlist is empty</h2>
            <p className="text-gray-400 mb-6">Save items you love for later</p>
            <Link to="/shop" className="btn-primary">Discover Products</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
