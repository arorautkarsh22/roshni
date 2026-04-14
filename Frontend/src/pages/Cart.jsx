import { Link } from 'react-router-dom';
import CartItem from '../components/CartItem';
import Loader from '../components/Loader';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { FiShoppingBag, FiArrowRight, FiTrash2 } from 'react-icons/fi';

const Cart = () => {
  const { cartItems, cartTotal, cartCount, loading, clearCartItems } = useCart();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <FiShoppingBag className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-white text-2xl font-heading font-bold mb-2">Please Login</h2>
          <p className="text-gray-400 mb-6">Login to view your cart</p>
          <Link to="/login" className="btn-primary">Login</Link>
        </div>
      </div>
    );
  }

  if (loading) return <Loader size="lg" text="Loading your cart..." />;

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="section-heading">Shopping Cart</h1>
            <p className="section-subheading">{cartCount} item{cartCount !== 1 ? 's' : ''} in your cart</p>
          </div>
          {cartItems.length > 0 && (
            <button onClick={clearCartItems}
              className="flex items-center gap-2 text-gray-500 hover:text-red-400 text-sm transition-colors">
              <FiTrash2 className="w-4 h-4" /> Clear All
            </button>
          )}
        </div>

        {cartItems.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="glass-card p-6 space-y-4 sticky top-24">
                <h3 className="text-white font-heading text-xl font-semibold">Order Summary</h3>
                <div className="space-y-3 pt-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Subtotal ({cartCount} items)</span>
                    <span className="text-white">₹{cartTotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Shipping</span>
                    <span className="text-green-400">{cartTotal >= 999 ? 'Free' : '₹99'}</span>
                  </div>
                  <div className="border-t border-white/5 pt-3 flex justify-between">
                    <span className="text-white font-semibold">Total</span>
                    <span className="text-gold-300 font-heading text-xl font-bold">
                      ₹{(cartTotal + (cartTotal >= 999 ? 0 : 99)).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
                <Link to="/checkout" className="btn-gold w-full flex items-center justify-center gap-2">
                  Proceed to Checkout <FiArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/shop" className="text-center block text-gray-400 hover:text-gold-300 text-sm transition-colors">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <FiShoppingBag className="w-20 h-20 text-gray-700 mx-auto mb-4" />
            <h2 className="text-white text-2xl font-heading font-bold mb-2">Your cart is empty</h2>
            <p className="text-gray-400 mb-6">Looks like you haven't added anything to your cart yet</p>
            <Link to="/shop" className="btn-primary">Start Shopping</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
