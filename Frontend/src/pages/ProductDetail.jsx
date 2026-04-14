import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProductById } from '../api/productService';
import { getProductReviews, createReview } from '../api/reviewService';
import { addToWishlist, removeFromWishlist } from '../api/wishlistService';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { getProductImage, getProductImages } from '../utils/productImages';
import ReviewCard from '../components/ReviewCard';
import Loader from '../components/Loader';
import { FiHeart, FiShoppingCart, FiMinus, FiPlus, FiStar, FiTruck, FiShield, FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';
const ProductDetail = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const { addToCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProduct();
    fetchReviews();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const res = await getProductById(productId);
      const productData = res.data?.data || res.data;
      if (productData) {
        setProduct(productData);
      } else {
        console.error('No product data in response');
      }
    } catch (err) {
      console.error('Failed to fetch product:', err);
      // If the fetch failed, it could be because productId is numeric id
      // Try again if possible
      if (err.response?.status === 404) {
        console.log('Product not found with productId, may be using numeric id');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await getProductReviews(productId);
      setReviews(res.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    }
  };

  const handleAddToCart = async () => {
    if (product) {
      const numId = product.id;
      if (!numId) {
        toast.error('Product numeric ID not found');
        return false;
      }
      return await addToCart(numId, quantity, product.price, product.name);
    }
    return false;
  };

  const handleBuyNow = async () => {
    const success = await handleAddToCart();
    if (success) {
      navigate('/checkout');
    }
  };
  const handleWishlist = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add to wishlist');
      return;
    }
    try {
      const numId = product.id;
      if (!numId) {
        toast.error('Product numeric ID not found');
        return;
      }
      if (isLiked) {
        await removeFromWishlist(user.id, numId);
        setIsLiked(false);
        toast.success('Removed from wishlist');
      } else {
        await addToWishlist(user.id, numId);
        setIsLiked(true);
        toast.success('Added to wishlist! ❤️');
      }
    } catch (err) {
      if (err.response?.status === 409) {
        try {
           await removeFromWishlist(user.id, product.id);
           setIsLiked(false);
           toast.success('Removed from wishlist');
        } catch {
           toast.error('Failed to update wishlist');
        }
      } else {
        toast.error('Failed to update wishlist');
      }
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to leave a review');
      return;
    }
    try {
      await createReview({
        productId: product.productId,
        userId: user.id,
        userName: user.name || user.email,
        rating: reviewRating,
        comment: reviewText,
      });
      toast.success('Review submitted!');
      setReviewText('');
      setReviewRating(5);
      fetchReviews();
    } catch {
      toast.error('Failed to submit review');
    }
  };

  if (loading) return <Loader size="lg" text="Loading product..." />;
  if (!product) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-400 text-lg">Product not found</p>
        <Link to="/shop" className="btn-primary mt-4 inline-block">Back to Shop</Link>
      </div>
    </div>
  );

  const displayImages = getProductImages(product);

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <Link to="/shop" className="inline-flex items-center gap-2 text-gray-400 hover:text-gold-300 transition-colors mb-8 text-sm">
          <FiArrowLeft className="w-4 h-4" /> Back to Shop
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Image */}
          {/* Main Image */}
          <div className="space-y-3">
            <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-dark-300">
              <img
                src={displayImages[selectedImage] || getProductImage(product)}
                alt={product.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                onError={(e) => { e.target.src = `https://placehold.co/600x800/1a1a2e/D4A574?text=${encodeURIComponent(product.name || 'Product')}`; }}
              />
            </div>
            {/* Thumbnails */}
            {displayImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {displayImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`flex-shrink-0 w-16 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === i ? 'border-primary-500 shadow-lg shadow-primary-500/20' : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <p className="text-primary-400 text-sm uppercase tracking-wider font-medium">
                {product.categoryName || 'Collection'}
              </p>
              <h1 className="font-heading text-3xl md:text-4xl font-bold text-white mt-2">
                {product.name}
              </h1>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-gold-300 font-heading text-3xl font-bold">
                ₹{product.price?.toLocaleString('en-IN')}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <>
                  <span className="text-gray-500 text-xl line-through">
                    ₹{product.originalPrice?.toLocaleString('en-IN')}
                  </span>
                  <span className="badge bg-green-500/20 text-green-400">
                    {Math.round((1 - product.price / product.originalPrice) * 100)}% off
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            <p className="text-gray-400 leading-relaxed">{product.description}</p>

            {/* Stock */}
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-green-400' : 'bg-red-400'}`} />
              <span className={`text-sm ${product.stock > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
              </span>
            </div>

            {/* Quantity + Actions */}
            <div className="space-y-4 pt-4 border-t border-white/5">
              <div className="flex items-center gap-4">
                <span className="text-gray-400 text-sm">Quantity</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center
                               text-gray-400 hover:text-white hover:border-primary-500/30 transition-all">
                    <FiMinus className="w-4 h-4" />
                  </button>
                  <span className="text-white font-semibold w-12 text-center">{quantity}</span>
                  <button onClick={() => setQuantity(q => Math.min(product.stock || 10, q + 1))}
                    className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center
                               text-gray-400 hover:text-white hover:border-primary-500/30 transition-all">
                    <FiPlus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={handleAddToCart} disabled={product.stock <= 0}
                  className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                  <FiShoppingCart className="w-5 h-5" /> Add to Cart
                </button>
                <button onClick={handleBuyNow} disabled={product.stock <= 0}
                  className="btn-gold flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-gold-500/20">
                  <FiShoppingCart className="w-5 h-5" /> Buy Now
                </button>
                <button onClick={handleWishlist}
                  className={`p-3 rounded-xl border transition-all ${
                    isLiked 
                      ? 'bg-primary-500/20 border-primary-500 text-primary-400' 
                      : 'border-white/10 text-gray-400 hover:text-primary-400 hover:border-primary-500/30 hover:bg-primary-500/10'
                  }`}>
                  <FiHeart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-3 pt-4">
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <FiTruck className="w-4 h-4 text-gold-300" /> Free shipping above ₹999
              </div>
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <FiShield className="w-4 h-4 text-gold-300" /> Secure checkout
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <section className="mt-20">
          <h2 className="section-heading mb-8">Customer Reviews ({reviews.length})</h2>

          {/* Review Form */}
          {isAuthenticated && (
            <form onSubmit={handleReviewSubmit} className="glass-card p-6 mb-8 space-y-4">
              <h3 className="text-white font-medium">Write a Review</h3>
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm">Rating:</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} type="button" onClick={() => setReviewRating(star)}>
                      <FiStar className={`w-5 h-5 cursor-pointer transition-colors ${
                        star <= reviewRating ? 'text-gold-300 fill-gold-300' : 'text-gray-600'
                      }`} />
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Share your experience..."
                className="input-field min-h-[100px] resize-none"
                required
              />
              <button type="submit" className="btn-primary">Submit Review</button>
            </form>
          )}

          {reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.map((review, i) => (
                <ReviewCard key={review.id || i} review={review} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 glass-card">
              <p className="text-gray-500">No reviews yet. Be the first to review!</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ProductDetail;
