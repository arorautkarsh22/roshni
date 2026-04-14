import { FiPackage, FiChevronRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const statusColors = {
  PENDING: 'bg-yellow-500/20 text-yellow-400',
  CONFIRMED: 'bg-blue-500/20 text-blue-400',
  PROCESSING: 'bg-purple-500/20 text-purple-400',
  SHIPPED: 'bg-indigo-500/20 text-indigo-400',
  DELIVERED: 'bg-green-500/20 text-green-400',
  CANCELLED: 'bg-red-500/20 text-red-400',
};

const OrderCard = ({ order }) => {
  const status = order.status || 'PENDING';

  return (
    <div className="glass-card-hover p-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center">
            <FiPackage className="w-6 h-6 text-primary-400" />
          </div>
          <div>
            <p className="text-white font-medium text-sm">Order #{String(order.id)?.slice(-8) || order.id}</p>
            <p className="text-gray-500 text-xs mt-0.5">
              {order.orderDate ? new Date(order.orderDate).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'short', year: 'numeric'
              }) : 'Recent'}
            </p>
          </div>
        </div>

        <span className={`badge ${statusColors[status] || statusColors.PENDING}`}>
          {status}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-xs">Total Amount</p>
          <p className="text-gold-300 font-heading text-xl font-semibold">
            ₹{(order.totalAmount || 0).toLocaleString('en-IN')}
          </p>
        </div>
        <p className="text-gray-500 text-sm">{order.items?.length || 0} items</p>
      </div>

      {order.items && order.items.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/5">
          <div className="flex -space-x-2">
            {order.items.slice(0, 4).map((item, i) => (
              <img
                key={i}
                src={item.productImage || item.imageUrl || `https://placehold.co/80x80/1a1a2e/D4A574?text=${encodeURIComponent(item.productName || 'Item')}`}
                alt=""
                className="w-10 h-10 rounded-lg object-cover border-2 border-dark-500"
              />
            ))}
            {order.items.length > 4 && (
              <div className="w-10 h-10 rounded-lg bg-white/10 border-2 border-dark-500 flex items-center justify-center">
                <span className="text-white text-xs font-medium">+{order.items.length - 4}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderCard;
