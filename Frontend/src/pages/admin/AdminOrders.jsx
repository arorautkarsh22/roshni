import { useState, useEffect } from 'react';
import { getDashboardStats, updateOrderStatus } from '../../api/adminService';
import Loader from '../../components/Loader';
import toast from 'react-hot-toast';
import {
  FiShoppingBag,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiAlertTriangle,
  FiSearch,
  FiRotateCcw,
} from 'react-icons/fi';

const statusConfig = {
  PENDING:   { color: 'bg-yellow-500/15 text-yellow-400', icon: FiClock },
  CONFIRMED: { color: 'bg-blue-500/15 text-blue-400', icon: FiCheckCircle },
  DELIVERED: { color: 'bg-green-500/15 text-green-400', icon: FiCheckCircle },
  CANCELLED: { color: 'bg-red-500/15 text-red-400', icon: FiXCircle },
};

const AdminOrders = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await getDashboardStats();
      setData(res.data?.data || null);
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
      // Refresh data
      const res = await getDashboardStats();
      setData(res.data?.data || null);
    } catch (err) {
      console.error('Failed to update order status', err);
      toast.error('Failed to update order status.');
    } finally {
      setUpdatingId(null);
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

  const stats = [
    { label: 'Total Orders', value: data?.totalOrders || 0, icon: FiShoppingBag, color: 'text-primary-400', bg: 'bg-primary-500/10' },
    { label: 'Pending', value: data?.pendingOrders || 0, icon: FiClock, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    { label: 'Delivered', value: data?.deliveredOrders || 0, icon: FiCheckCircle, color: 'text-green-400', bg: 'bg-green-500/10' },
    { label: 'Cancelled', value: data?.cancelledOrders || 0, icon: FiXCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
  ];

  const orders = (data?.recentOrders || [])
    .filter(o => filter === 'ALL' || o.status === filter)
    .filter(o =>
      search === '' ||
      o.orderId.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase())
    );

  const canMarkDelivered = (status) => status === 'CONFIRMED';

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
          {['ALL', 'PENDING', 'CONFIRMED', 'DELIVERED', 'CANCELLED'].map(f => (
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
                <th className="px-6 py-4 text-left font-medium">Order ID</th>
                <th className="px-6 py-4 text-left font-medium">Customer</th>
                <th className="px-6 py-4 text-left font-medium">Amount</th>
                <th className="px-6 py-4 text-left font-medium">Status</th>
                <th className="px-6 py-4 text-left font-medium hidden md:table-cell">Date</th>
                <th className="px-6 py-4 text-left font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No orders found matching your criteria.
                  </td>
                </tr>
              ) : (
                orders.map((order, i) => {
                  const cfg = statusConfig[order.status] || statusConfig.PENDING;
                  const isUpdating = updatingId === order.orderId;
                  return (
                    <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-white/[0.03] transition-colors">
                      <td className="px-6 py-4 text-primary-400 font-semibold">{order.orderId}</td>
                      <td className="px-6 py-4 text-white">{order.customerName}</td>
                      <td className="px-6 py-4 text-white font-medium">₹{order.totalAmount.toLocaleString('en-IN')}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${cfg.color}`}>
                          <cfg.icon className="w-3 h-3" />
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 hidden md:table-cell">{order.orderDate}</td>
                      <td className="px-6 py-4">
                        {canMarkDelivered(order.status) ? (
                          <button
                            onClick={() => handleStatusChange(order.orderId, 'DELIVERED', `Order ${order.orderId} marked as Delivered!`)}
                            disabled={isUpdating}
                            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all
                              ${isUpdating
                                ? 'bg-gray-500/20 text-gray-400 cursor-not-allowed'
                                : 'bg-green-500/15 text-green-400 hover:bg-green-500/25 hover:shadow-lg hover:shadow-green-500/10 active:scale-95 border border-green-500/20 hover:border-green-500/40'
                              }`}
                          >
                            {isUpdating ? (
                              <>
                                <div className="w-3 h-3 border-2 border-gray-400/30 border-t-gray-400 rounded-full animate-spin" />
                                Updating...
                              </>
                            ) : (
                              <>
                                <FiCheckCircle className="w-3.5 h-3.5" />
                                Mark Delivered
                              </>
                            )}
                          </button>
                        ) : order.status === 'DELIVERED' ? (
                          <button
                            onClick={() => handleStatusChange(order.orderId, 'CONFIRMED', `Order ${order.orderId} reverted to Confirmed.`)}
                            disabled={isUpdating}
                            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all
                              ${isUpdating
                                ? 'bg-gray-500/20 text-gray-400 cursor-not-allowed'
                                : 'bg-orange-500/15 text-orange-400 hover:bg-orange-500/25 hover:shadow-lg hover:shadow-orange-500/10 active:scale-95 border border-orange-500/20 hover:border-orange-500/40'
                              }`}
                          >
                            {isUpdating ? (
                              <>
                                <div className="w-3 h-3 border-2 border-gray-400/30 border-t-gray-400 rounded-full animate-spin" />
                                Reverting...
                              </>
                            ) : (
                              <>
                                <FiRotateCcw className="w-3.5 h-3.5" />
                                Undo Delivered
                              </>
                            )}
                          </button>
                        ) : (
                          <span className="text-gray-600 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;
