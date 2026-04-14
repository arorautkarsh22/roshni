import { FiMinus, FiPlus, FiTrash2 } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

const CartItem = ({ item }) => {
  const { updateItem, removeItem } = useCart();

  return (
    <div className="glass-card p-4 flex gap-4 animate-fade-in">
      {/* Image */}
      {/* Backend returns item.productId as Long. For router we need string ID if available. Let's pass item.productId anyway but we should use it correctly */}
      <Link to={`/product/${item.productUuid || item.productId}`} className="flex-shrink-0">
        <img
          src={item.productImage || item.imageUrl || `https://placehold.co/200x250/1a1a2e/D4A574?text=${encodeURIComponent(item.productName || 'Product')}`}
          alt={item.productName || 'Product'}
          className="w-24 h-28 object-cover rounded-xl"
        />
      </Link>

      {/* Details */}
      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div>
          <Link to={`/product/${item.productUuid || item.productId}`} className="text-white font-medium text-sm hover:text-gold-300 transition-colors line-clamp-1">
            {item.productName || 'Product'}
          </Link>
          <p className="text-gold-300 font-heading text-lg font-semibold mt-1">
            ₹{(item.unitPrice || item.price || 0).toLocaleString('en-IN')}
          </p>
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => updateItem(item.id, Math.max(1, (item.quantity || 1) - 1))}
              className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center
                         text-gray-400 hover:text-white hover:border-primary-500/30 transition-all"
            >
              <FiMinus className="w-3 h-3" />
            </button>
            <span className="text-white font-medium w-8 text-center">{item.quantity || 1}</span>
            <button
              onClick={() => updateItem(item.id, (item.quantity || 1) + 1)}
              className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center
                         text-gray-400 hover:text-white hover:border-primary-500/30 transition-all"
            >
              <FiPlus className="w-3 h-3" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <p className="text-gray-400 text-sm">
              ₹{((item.unitPrice || item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}
            </p>
            <button
              onClick={() => removeItem(item.id)}
              className="p-2 text-gray-500 hover:text-red-400 transition-colors"
            >
              <FiTrash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
