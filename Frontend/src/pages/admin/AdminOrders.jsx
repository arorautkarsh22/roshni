import { useState, useEffect } from 'react';
import { getAllOrders, updateOrderStatus, shipOrder } from '../../api/adminService';
import Loader from '../../components/Loader';
import toast from 'react-hot-toast';
import {
  FiShoppingBag, FiClock, FiCheckCircle, FiXCircle,
  FiAlertTriangle, FiSearch, FiTruck, FiPackage, FiX,
  FiChevronUp, FiChevronDown,
} from 'react-icons/fi';

const statusConfig = {
  PENDING:   { color: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20', icon: FiClock,        label: 'Pending' },
  CONFIRMED: { color: 'bg-blue-500/15 text-blue-400 border-blue-500/20',       icon: FiCheckCircle,  label: 'Confirmed' },
  SHIPPED:   { color: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/20', icon: FiTruck,        label: 'Shipped' },
  DELIVERED: { color: 'bg-green-500/15 text-green-400 border-green-500/20',    icon: FiPackage,      label: 'Delivered' },
  CANCELLED: { color: 'bg-red-500/15 text-red-400 border-red-500/20',          icon: FiXCircle,      label: 'Cancelled' },
};

// Ship Order Modal
const ShipModal = ({ order, onClose, onConfirm, loading }) => {
  const [trackingNumber, setTrackingNumber] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="glass-card w-full max-w-md p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-heading text-lg font-semibold flex items-center gap-2">
            <FiTruck className="text-indigo-400" /> Ship Order
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-white/5 rounded-xl p-4 space-y-1">
          <p className="text-gray-400 text-xs uppercase tracking-wider">Order</p>
          <p className="text-primary-400 font-semibold">{order.orderId}</p>
          <p className="text-gray-400 text-sm">{order.userName}</p>
        </div>

        <div className="space-y-2">
          <label className="text-gray-400 text-sm font-medium">Tracking Number <span className="text-red-400">*</span></label>
          <input
            id="tracking-number-input"
            type="text"
            value={trackingNumber}
            onChange={e => setTrackingNumber(e.target.value)}
            placeholder="e.g. DTDC1234567890"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 transition-all"
            autoFocus
          />
          <p className="text-gray-500 text-xs">This will be emailed to the customer automatically.</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => onConfirm(trackingNumber)}
            disabled={!trackingNumber.trim() || loading}
            id="confirm-ship-btn"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {loading ? <div className="w-4 h-4 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" /> : <FiTruck className="w-4 h-4" />}
            {loading ? 'Shipping...' : 'Mark as Shipped'}
          </button>
          <button onClick={onClose} className="px-4 py-3 rounded-xl text-sm font-semibold text-gray-400 hover:text-white hover:bg-white/5 transition-all border border-transparent">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [shipModalOrder, setShipModalOrder] = useState(null);
  const [shipping, setShipping] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'orderDate', direction: 'desc' });


  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const res = await getAllOrders();
      setOrders(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load orders', err);
      setError('Failed to load order data. Check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus, successMsg) => {
    setUpdatingId(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
      toast.success(successMsg);
      await fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update order status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleShipConfirm = async (trackingNumber) => {
    if (!shipModalOrder) return;
    setShipping(true);
    try {
      await shipOrder(shipModalOrder.orderId, trackingNumber);
      toast.success(`Order ${shipModalOrder.orderId} shipped! Tracking email sent. 📦`);
      setShipModalOrder(null);
      await fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to ship order.');
    } finally {
      setShipping(false);
    }
  };

  if (loading) return <Loader size="lg" text="Loading orders..." />;

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center pt-20">
        <div className="glass-card p-8 border-red-500/20 bg-red-500/5 text-center max-w-lg">
          <FiAlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-white mb-2 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  // Stats from orders list
  const total = orders.length;
  const pending = orders.filter(o => o.orderStatus === 'PENDING').length;
  const shipped = orders.filter(o => o.orderStatus === 'SHIPPED').length;
  const delivered = orders.filter(o => o.orderStatus === 'DELIVERED').length;
  const cancelled = orders.filter(o => o.orderStatus === 'CANCELLED').length;

  const stats = [
    { label: 'Total Orders',  value: total,     icon: FiShoppingBag, color: 'text-primary-400', bg: 'bg-primary-500/10' },
    { label: 'Pending',       value: pending,   icon: FiClock,       color: 'text-yellow-400',  bg: 'bg-yellow-500/10' },
    { label: 'Shipped',       value: shipped,   icon: FiTruck,       color: 'text-indigo-400',  bg: 'bg-indigo-500/10' },
    { label: 'Delivered',     value: delivered, icon: FiPackage,     color: 'text-green-400',   bg: 'bg-green-500/10' },
  ];

  const filtered = orders
    .filter(o => filter === 'ALL' || o.orderStatus === filter)
    .filter(o =>
      search === '' ||
      o.orderId?.toLowerCase().includes(search.toLowerCase()) ||
      o.userName?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (!sortConfig.key) return 0;
      let valA = a[sortConfig.key];
      let valB = b[sortConfig.key];

      // Handle nulls
      if (valA === null || valA === undefined) valA = '';
      if (valB === null || valB === undefined) valB = '';

      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FiChevronDown className="w-3 h-3 text-gray-700" />;
    return sortConfig.direction === 'asc' ? <FiChevronUp className="w-3 h-3 text-primary-400" /> : <FiChevronDown className="w-3 h-3 text-primary-400" />;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((s, i) => (
          <div key={i} className="glass-card p-5 flex items-center gap-4 group hover:border-gold-300/30 transition-all duration-300">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${s.bg} group-hover:scale-110 transition-transform`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wider">{s.label}</p>
              <p className="text-white text-2xl font-heading font-bold">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters + Search */}
      <div className="glass-card p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          {['ALL', 'PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                filter === f
                  ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                  : 'text-gray-500 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="flex-1 relative sm:max-w-xs sm:ml-auto">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by order ID or customer..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary-500/50 transition-all"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 text-xs uppercase tracking-wider border-b border-white/5">
                <th className="px-6 py-4 text-left font-medium cursor-pointer hover:text-white transition-colors" onClick={() => requestSort('orderId')}>
                  <div className="flex items-center gap-1">Order ID {getSortIcon('orderId')}</div>
                </th>
                <th className="px-6 py-4 text-left font-medium cursor-pointer hover:text-white transition-colors" onClick={() => requestSort('userName')}>
                  <div className="flex items-center gap-1">Customer {getSortIcon('userName')}</div>
                </th>
                <th className="px-6 py-4 text-left font-medium cursor-pointer hover:text-white transition-colors" onClick={() => requestSort('totalAmount')}>
                  <div className="flex items-center gap-1">Amount {getSortIcon('totalAmount')}</div>
                </th>
                <th className="px-6 py-4 text-left font-medium cursor-pointer hover:text-white transition-colors" onClick={() => requestSort('orderStatus')}>
                  <div className="flex items-center gap-1">Status {getSortIcon('orderStatus')}</div>
                </th>
                <th className="px-6 py-4 text-left font-medium hidden md:table-cell">Tracking</th>
                <th className="px-6 py-4 text-left font-medium hidden lg:table-cell cursor-pointer hover:text-white transition-colors" onClick={() => requestSort('orderDate')}>
                  <div className="flex items-center gap-1">Date {getSortIcon('orderDate')}</div>
                </th>
                <th className="px-6 py-4 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No orders found matching your criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((order, i) => {
                  const cfg = statusConfig[order.orderStatus] || statusConfig.PENDING;
                  const isUpdating = updatingId === order.orderId;
                  const status = order.orderStatus;

                  return (
                    <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-white/[0.03] transition-colors">
                      <td className="px-6 py-4 text-primary-400 font-semibold text-xs">{order.orderId}</td>
                      <td className="px-6 py-4 text-white">{order.userName}</td>
                      <td className="px-6 py-4 text-white font-medium">₹{(order.totalAmount || 0).toLocaleString('en-IN')}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${cfg.color}`}>
                          <cfg.icon className="w-3 h-3" />
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        {order.trackingNumber ? (
                          <span className="text-indigo-400 font-mono text-xs bg-indigo-500/10 px-2 py-1 rounded-lg">
                            {order.trackingNumber}
                          </span>
                        ) : (
                          <span className="text-gray-600 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-xs hidden lg:table-cell">
                        {order.orderDate ? new Date(order.orderDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {/* PENDING → CONFIRMED */}
                          {status === 'PENDING' && (
                            <button
                              onClick={() => handleStatusChange(order.orderId, 'CONFIRMED', `Order ${order.orderId} confirmed! ✅`)}
                              disabled={isUpdating}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/20 hover:bg-blue-500/25 disabled:opacity-50 transition-all"
                            >
                              {isUpdating ? <div className="w-3 h-3 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" /> : <FiCheckCircle className="w-3.5 h-3.5" />}
                              Confirm
                            </button>
                          )}

                          {/* CONFIRMED → SHIPPED */}
                          {status === 'CONFIRMED' && (
                            <button
                              onClick={() => setShipModalOrder(order)}
                              disabled={isUpdating}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/25 disabled:opacity-50 transition-all"
                            >
                              <FiTruck className="w-3.5 h-3.5" /> Ship
                            </button>
                          )}

                          {/* SHIPPED → DELIVERED */}
                          {status === 'SHIPPED' && (
                            <button
                              onClick={() => handleStatusChange(order.orderId, 'DELIVERED', `Order ${order.orderId} delivered! 🎉`)}
                              disabled={isUpdating}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-500/15 text-green-400 border border-green-500/20 hover:bg-green-500/25 disabled:opacity-50 transition-all"
                            >
                              {isUpdating ? <div className="w-3 h-3 border-2 border-green-400/30 border-t-green-400 rounded-full animate-spin" /> : <FiPackage className="w-3.5 h-3.5" />}
                              Delivered
                            </button>
                          )}

                          {/* PENDING or CONFIRMED → CANCEL */}
                          {(status === 'PENDING' || status === 'CONFIRMED') && (
                            <button
                              onClick={() => handleStatusChange(order.orderId, 'CANCELLED', `Order ${order.orderId} cancelled.`)}
                              disabled={isUpdating}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 disabled:opacity-50 transition-all"
                            >
                              <FiXCircle className="w-3.5 h-3.5" /> Cancel
                            </button>
                          )}

                          {(status === 'DELIVERED' || status === 'CANCELLED') && (
                            <span className="text-gray-600 text-xs">—</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ship Modal */}
      {shipModalOrder && (
        <ShipModal
          order={shipModalOrder}
          onClose={() => setShipModalOrder(null)}
          onConfirm={handleShipConfirm}
          loading={shipping}
        />
      )}
    </div>
  );
};

export default AdminOrders;
