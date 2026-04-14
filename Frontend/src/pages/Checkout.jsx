import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { getUserAddresses, addAddress } from '../api/addressService';
import { createOrder } from '../api/orderService';
import { createPaymentIntent, confirmPayment } from '../api/paymentService';
import AddressCard from '../components/AddressCard';
import Loader from '../components/Loader';
import { FiPlus, FiCreditCard, FiCheck, FiX } from 'react-icons/fi';
import StripePaymentModal from '../components/StripePaymentModal';
import toast from 'react-hot-toast';

const Checkout = () => {
  const { user } = useAuth();
  const { cartItems, cartTotal, clearCartItems } = useCart();
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('COD'); // 'COD' or 'STRIPE'
  const [stripeData, setStripeData] = useState(null);
  const [showStripeModal, setShowStripeModal] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullName: '', addressLine1: '', city: '', state: '', pincode: '', phone: ''
  });

  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/cart');
      return;
    }
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const res = await getUserAddresses(user.id);
      const addrs = res.data?.data || [];
      setAddresses(addrs);
      if (addrs.length > 0) setSelectedAddress(addrs[0].id);
    } catch (err) {
      console.error('Failed to fetch addresses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      await addAddress(user.id, newAddress);
      toast.success('Address added!');
      setShowAddForm(false);
      setNewAddress({ fullName: '', addressLine1: '', city: '', state: '', pincode: '', phone: '' });
      fetchAddresses();
    } catch {
      toast.error('Failed to add address');
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error('Please select a delivery address');
      return;
    }
    setPlacing(true);
    try {
      // Create initial order locally on Backend
      const orderMethod = paymentMethod === 'STRIPE' ? 'ONLINE' : 'COD';
      const orderData = { shippingAddressId: selectedAddress, paymentMethod: orderMethod };
      const res = await createOrder(user.id, orderData);
      
      if (!res.data?.success) {
        toast.error(res.data?.message || 'Failed to initialize order');
        setPlacing(false);
        return;
      }

      const orderUuid = res.data.data.orderId; // String UUID expected by Payment Service

      // If COD, we're completely done
      if (paymentMethod === 'COD') {
        await clearCartItems();
        toast.success('Order placed successfully! 🎉');
        navigate('/orders');
        return;
      }

      // If Stripe, initiate payment layer
      const paymentRes = await createPaymentIntent(orderUuid);
      if (!paymentRes.data?.success) {
        toast.error('Failed to initialize Stripe Gateway.');
        setPlacing(false);
        return;
      }

      setStripeData(paymentRes.data.data);
      setShowStripeModal(true);

    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to process your request.';
      toast.error(errorMsg);
      console.error(err);
    } finally {
      setPlacing(false);
    }
  };

  const handleStripeSuccess = async (intentId) => {
    try {
      await confirmPayment(intentId);
      await clearCartItems();
      setShowStripeModal(false);
      toast.success('Payment Successful! Order placed. 🎉');
      navigate('/orders');
    } catch (err) {
      toast.error('Payment confirmation failed on server.');
    }
  };

  const handleStripeCancel = () => {
    setShowStripeModal(false);
    toast.error('Payment cancelled.');
  };

  const shipping = cartTotal >= 999 ? 0 : 99;

  if (loading) return <Loader size="lg" text="Loading checkout..." />;

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="section-heading mb-2">Checkout</h1>
        <p className="section-subheading mb-8">Complete your order</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left — Address + Payment */}
          <div className="lg:col-span-2 space-y-8">
            {/* Address Selection */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-heading text-lg font-semibold">Delivery Address</h2>
                <button onClick={() => setShowAddForm(!showAddForm)}
                  className="text-gold-300 text-sm font-medium flex items-center gap-1 hover:underline">
                  <FiPlus className="w-4 h-4" /> Add New
                </button>
              </div>

              {showAddForm && (
                <form onSubmit={handleAddAddress} className="mb-6 p-4 bg-white/5 rounded-xl space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input value={newAddress.fullName} onChange={(e) => setNewAddress({...newAddress, fullName: e.target.value})}
                      placeholder="Full Name" className="input-field" required />
                    <input value={newAddress.phone} onChange={(e) => setNewAddress({...newAddress, phone: e.target.value})}
                      placeholder="Phone" className="input-field" required />
                  </div>
                  <input value={newAddress.addressLine1} onChange={(e) => setNewAddress({...newAddress, addressLine1: e.target.value})}
                    placeholder="Street Address" className="input-field" required />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input value={newAddress.city} onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                      placeholder="City" className="input-field" required />
                    <input value={newAddress.state} onChange={(e) => setNewAddress({...newAddress, state: e.target.value})}
                      placeholder="State" className="input-field" required />
                    <input value={newAddress.pincode} onChange={(e) => setNewAddress({...newAddress, pincode: e.target.value})}
                      placeholder="PIN Code" className="input-field" required />
                  </div>
                  <div className="flex gap-3">
                    <button type="submit" className="btn-primary text-sm">Save Address</button>
                    <button type="button" onClick={() => setShowAddForm(false)} className="btn-outline text-sm">Cancel</button>
                  </div>
                </form>
              )}

              <div className="space-y-3">
                {addresses.length > 0 ? (
                  addresses.map((addr) => (
                    <AddressCard
                      key={addr.id}
                      address={addr}
                      selected={selectedAddress === addr.id}
                      onSelect={() => setSelectedAddress(addr.id)}
                    />
                  ))
                ) : (
                  <p className="text-gray-500 text-sm py-4 text-center">No saved addresses. Please add one above.</p>
                )}
              </div>
            </div>

            {/* Payment Method */}
            <div className="glass-card p-6">
              <h2 className="text-white font-heading text-lg font-semibold mb-4">Payment Method</h2>
              <div className="space-y-3">
                {/* Cash on Delivery */}
                <div 
                  onClick={() => setPaymentMethod('COD')}
                  className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all ${
                    paymentMethod === 'COD' 
                      ? 'bg-primary-500/10 border-primary-500 shadow-lg shadow-primary-500/20' 
                      : 'bg-dark-300/50 border-white/10 hover:border-white/30'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    paymentMethod === 'COD' ? 'bg-primary-500 text-white' : 'bg-white/5 text-gray-400'
                  }`}>
                    <FiCreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">Cash on Delivery</p>
                    <p className="text-gray-400 text-xs">Pay when your order arrives</p>
                  </div>
                  {paymentMethod === 'COD' && <FiCheck className="w-5 h-5 text-primary-400 ml-auto" />}
                </div>

                {/* Stripe Online */}
                <div 
                  onClick={() => setPaymentMethod('STRIPE')}
                  className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all ${
                    paymentMethod === 'STRIPE' 
                      ? 'bg-blue-500/10 border-blue-500 shadow-lg shadow-blue-500/20' 
                      : 'bg-dark-300/50 border-white/10 hover:border-white/30'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    paymentMethod === 'STRIPE' ? 'bg-blue-500 text-white' : 'bg-white/5 text-gray-400'
                  }`}>
                    <FiCreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">Pay Online</p>
                    <p className="text-gray-400 text-xs">Secure payment via Stripe</p>
                  </div>
                  {paymentMethod === 'STRIPE' && <FiCheck className="w-5 h-5 text-blue-400 ml-auto" />}
                </div>
              </div>
            </div>
          </div>

          {/* Right — Summary */}
          <div className="lg:col-span-1">
            <div className="glass-card p-6 space-y-4 sticky top-24">
              <h3 className="text-white font-heading text-lg font-semibold">Order Summary</h3>

              {/* Items preview */}
              <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <img
                      src={item.productImage || item.imageUrl || `https://placehold.co/200x250/1a1a2e/D4A574?text=${encodeURIComponent(item.productName || 'Product')}`}
                      alt="" className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm truncate">{item.productName}</p>
                      <p className="text-gray-500 text-xs">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-gray-400 text-sm">₹{((item.unitPrice || item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/5 pt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="text-white">₹{cartTotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Shipping</span>
                  <span className="text-green-400">{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
                </div>
                <div className="border-t border-white/5 pt-2 flex justify-between">
                  <span className="text-white font-semibold">Total</span>
                  <span className="text-gold-300 font-heading text-xl font-bold">
                    ₹{(cartTotal + shipping).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <button onClick={handlePlaceOrder} disabled={placing || !selectedAddress}
                className="btn-gold w-full flex items-center justify-center gap-2 disabled:opacity-50">
                {placing ? 'Placing Order...' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <StripePaymentModal 
        stripeData={stripeData}
        isOpen={showStripeModal}
        onClose={handleStripeCancel}
        onPaymentSuccess={handleStripeSuccess}
      />
    </div>
  );
};

export default Checkout;
