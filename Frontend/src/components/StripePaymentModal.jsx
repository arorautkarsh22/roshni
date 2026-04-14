import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import toast from 'react-hot-toast';
import { FiX } from 'react-icons/fi';

const CheckoutForm = ({ clientSecret, onCancel, onPaymentSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsProcessing(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });

    if (error) {
      toast.error(error.message);
      setIsProcessing(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      onPaymentSuccess(paymentIntent.id);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement options={{ layout: 'tabs' }} />
      <div className="flex gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-6 py-3 rounded-xl border border-white/10 text-white font-medium hover:bg-white/5 transition-all"
        >
          Cancel
        </button>
        <button
          disabled={isProcessing || !stripe}
          className="flex-1 bg-gold-400 hover:bg-gold-500 text-black font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-gold-500/20 disabled:opacity-50"
        >
          {isProcessing ? 'Processing...' : 'Pay Now'}
        </button>
      </div>
    </form>
  );
};

const StripePaymentModal = ({ stripeData, isOpen, onClose, onPaymentSuccess }) => {
  if (!isOpen || !stripeData) return null;

  const stripePromise = loadStripe(stripeData.publishableKey);

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/80 backdrop-blur-sm animate-fade-in py-10 px-4">
      <div className="flex min-h-full items-center justify-center">
        <div className="glass-card w-full max-w-md p-8 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <FiX className="w-6 h-6" />
        </button>

        <div className="mb-6 text-center">
            <h2 className="text-2xl font-heading font-bold text-white mb-2">Secure Checkout</h2>
            <p className="text-gray-400">Complete your payment securely via Stripe</p>
        </div>

        <Elements stripe={stripePromise} options={{ clientSecret: stripeData.clientSecret, appearance: { theme: 'night' } }}>
          <CheckoutForm 
            clientSecret={stripeData.clientSecret} 
            onCancel={onClose} 
            onPaymentSuccess={onPaymentSuccess}
          />
        </Elements>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500 uppercase tracking-widest">
            <span className="w-4 h-[1px] bg-gray-600"></span>
            Stripe Secure
            <span className="w-4 h-[1px] bg-gray-600"></span>
        </div>
        </div>
      </div>
    </div>
  );
};

export default StripePaymentModal;
