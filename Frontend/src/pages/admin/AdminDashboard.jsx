import { useState, useEffect } from 'react';
import { getDashboardStats } from '../../api/adminService';
import Loader from '../../components/Loader';
import { FiDollarSign, FiShoppingBag, FiUsers, FiAlertTriangle } from 'react-icons/fi';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await getDashboardStats();
      setStats(res.data?.data || null);
    } catch (err) {
      console.error('Failed to load dashboard metrics', err);
      setError('Failed to securely assemble dashboard data. Check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader size="lg" text="Syncing real-time statistics..." />;

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

  const statCards = [
    {
      title: 'Total Revenue',
      value: `₹${(stats?.totalRevenue || 0).toLocaleString('en-IN')}`,
      icon: FiDollarSign,
      color: 'text-green-400',
      bg: 'bg-green-500/10'
    },
    {
      title: 'Total Orders',
      value: stats?.totalOrders || 0,
      icon: FiShoppingBag,
      color: 'text-primary-400',
      bg: 'bg-primary-500/10'
    },
    {
      title: 'Total Customers',
      value: stats?.totalCustomers || 0,
      icon: FiUsers,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10'
    },
    {
      title: 'Low Stock Assets',
      value: stats?.lowStockProductsCount || 0,
      icon: FiAlertTriangle,
      color: 'text-red-400',
      bg: 'bg-red-500/10'
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Metric Grids */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, i) => (
          <div key={i} className="glass-card p-6 flex flex-col items-center justify-center text-center relative overflow-hidden group hover:border-gold-300/30 transition-all duration-300">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${card.bg} group-hover:scale-110 transition-transform`}>
              <card.icon className={`w-6 h-6 ${card.color}`} />
            </div>
            <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-1">{card.title}</h3>
            <p className="text-white text-3xl font-heading font-bold">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="glass-card p-8 text-center flex flex-col items-center justify-center mt-12 py-20 border-white/5">
        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
          <FiShoppingBag className="w-8 h-8 text-gray-500" />
        </div>
        <h2 className="text-xl text-white font-medium mb-2">Detailed Datagrids Coming Soon</h2>
        <p className="text-gray-400 max-w-md mx-auto">
          The foundational Dashboard analytics are active. You can soon manage products, view specific orders, and modify individual customer accounts right from this panel.
        </p>
      </div>
    </div>
  );
};

export default AdminDashboard;
