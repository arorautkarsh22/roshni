import { useState, useEffect } from 'react';
import { getCustomerAnalytics } from '../../api/adminService';
import Loader from '../../components/Loader';
import {
  FiUsers,
  FiUserPlus,
  FiRepeat,
  FiTrendingUp,
  FiAlertTriangle,
  FiSearch,
  FiDollarSign,
} from 'react-icons/fi';

const statusBadge = (status) => {
  switch (status) {
    case 'ACTIVE':
      return 'bg-green-500/15 text-green-400';
    case 'NEW':
      return 'bg-blue-500/15 text-blue-400';
    case 'CHURNED':
      return 'bg-red-500/15 text-red-400';
    default:
      return 'bg-gray-500/15 text-gray-400';
  }
};

const AdminCustomers = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await getCustomerAnalytics();
      setData(res.data?.data || null);
    } catch (err) {
      console.error('Failed to load customers', err);
      setError('Failed to load customer data. Check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader size="lg" text="Loading customer analytics..." />;

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
    { label: 'Total Customers', value: data?.totalCustomers || 0, icon: FiUsers, color: 'text-primary-400', bg: 'bg-primary-500/10' },
    { label: 'New This Month', value: data?.newCustomersThisMonth || 0, icon: FiUserPlus, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Returning', value: data?.returningCustomers || 0, icon: FiRepeat, color: 'text-green-400', bg: 'bg-green-500/10' },
    { label: 'Retention Rate', value: `${data?.customerRetentionRate || 0}%`, icon: FiTrendingUp, color: 'text-gold-300', bg: 'bg-gold-300/10' },
  ];

  const customers = (data?.customers || [])
    .filter(c => filter === 'ALL' || c.status === filter)
    .filter(c =>
      search === '' ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      (c.phone && c.phone.includes(search))
    );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Summary Cards */}
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

      {/* Avg Lifetime Value */}
      <div className="glass-card p-5 flex items-center gap-4 border-gold-300/20">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gold-300/10">
          <FiDollarSign className="w-5 h-5 text-gold-300" />
        </div>
        <div>
          <p className="text-gray-400 text-xs uppercase tracking-wider">Average Lifetime Value</p>
          <p className="text-gold-300 text-2xl font-heading font-bold">
            ₹{(data?.averageLifetimeValue || 0).toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* Filters + Search */}
      <div className="glass-card p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          {['ALL', 'NEW', 'ACTIVE', 'CHURNED'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                filter === f
                  ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                  : 'text-gray-500 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        <div className="flex-1 relative sm:max-w-xs sm:ml-auto">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary-500/50 transition-all"
          />
        </div>
      </div>

      {/* Customer Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 text-xs uppercase tracking-wider border-b border-white/5">
                <th className="px-6 py-4 text-left font-medium">Customer</th>
                <th className="px-6 py-4 text-left font-medium hidden md:table-cell">Phone</th>
                <th className="px-6 py-4 text-left font-medium">Orders</th>
                <th className="px-6 py-4 text-left font-medium">Total Spent</th>
                <th className="px-6 py-4 text-left font-medium hidden lg:table-cell">Last Order</th>
                <th className="px-6 py-4 text-left font-medium hidden lg:table-cell">Joined</th>
                <th className="px-6 py-4 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No customers found matching your criteria.
                  </td>
                </tr>
              ) : (
                customers.map((c, i) => (
                  <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-white/[0.03] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary-600 to-gold-400 flex items-center justify-center text-white font-bold text-sm uppercase flex-shrink-0">
                          {c.name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="text-white font-medium">{c.name}</p>
                          <p className="text-gray-500 text-xs">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-400 hidden md:table-cell">{c.phone || '—'}</td>
                    <td className="px-6 py-4 text-white font-medium">{c.totalOrders}</td>
                    <td className="px-6 py-4 text-white font-medium">₹{c.totalSpent.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4 text-gray-500 hidden lg:table-cell">{c.lastOrderDate}</td>
                    <td className="px-6 py-4 text-gray-500 hidden lg:table-cell">{c.joinDate}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusBadge(c.status)}`}>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminCustomers;
