import { useState, useEffect } from 'react';
import { getCustomerAnalytics, sendDiscountCode } from '../../api/adminService';
import Loader from '../../components/Loader';
import toast from 'react-hot-toast';
import {
  FiUsers, FiUserPlus, FiRepeat, FiTrendingUp,
  FiAlertTriangle, FiSearch, FiDollarSign, FiStar, FiX, FiGift,
  FiChevronUp, FiChevronDown,
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
  const [discountModal, setDiscountModal] = useState(null); // customer object
  const [discountPct, setDiscountPct] = useState(15);
  const [sendingDiscount, setSendingDiscount] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'totalSpent', direction: 'desc' });


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

  const handleSendDiscount = async () => {
    if (!discountModal) return;
    setSendingDiscount(true);
    try {
      await sendDiscountCode(discountModal.id, discountPct);
      toast.success(`🎁 ${discountPct}% discount code sent to ${discountModal.name}!`);
      setDiscountModal(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send discount code.');
    } finally {
      setSendingDiscount(false);
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

  const filtered = (data?.customers || [])
    .filter(c => filter === 'ALL' || c.status === filter)
    .filter(c =>
      search === '' ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      (c.phone && c.phone.includes(search))
    )
    .sort((a, b) => {
      if (!sortConfig.key) return 0;
      let valA = a[sortConfig.key];
      let valB = b[sortConfig.key];

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


  // Top 20% spenders are premium
  const allCustomers = data?.customers || [];
  const premiumThreshold = allCustomers.length > 0
    ? allCustomers.slice(0, Math.max(1, Math.ceil(allCustomers.length * 0.2))).slice(-1)[0]?.totalSpent ?? 0
    : 0;
  const isPremium = (c) => c.totalSpent > 0 && c.totalSpent >= premiumThreshold;

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
                  <th className="px-6 py-4 text-left font-medium cursor-pointer hover:text-white transition-colors" onClick={() => requestSort('name')}>
                  <div className="flex items-center gap-1">Customer {getSortIcon('name')}</div>
                </th>
                <th className="px-6 py-4 text-left font-medium hidden md:table-cell">Phone</th>
                <th className="px-6 py-4 text-left font-medium cursor-pointer hover:text-white transition-colors" onClick={() => requestSort('totalOrders')}>
                  <div className="flex items-center gap-1">Orders {getSortIcon('totalOrders')}</div>
                </th>
                <th className="px-6 py-4 text-left font-medium cursor-pointer hover:text-white transition-colors" onClick={() => requestSort('totalSpent')}>
                  <div className="flex items-center gap-1">Total Spent {getSortIcon('totalSpent')}</div>
                </th>
                <th className="px-6 py-4 text-left font-medium hidden lg:table-cell cursor-pointer hover:text-white transition-colors" onClick={() => requestSort('lastOrderDate')}>
                  <div className="flex items-center gap-1">Last Order {getSortIcon('lastOrderDate')}</div>
                </th>
                <th className="px-6 py-4 text-left font-medium hidden lg:table-cell cursor-pointer hover:text-white transition-colors" onClick={() => requestSort('joinDate')}>
                  <div className="flex items-center gap-1">Joined {getSortIcon('joinDate')}</div>
                </th>
                <th className="px-6 py-4 text-left font-medium cursor-pointer hover:text-white transition-colors" onClick={() => requestSort('status')}>
                  <div className="flex items-center gap-1">Status {getSortIcon('status')}</div>
                </th>
                <th className="px-6 py-4 text-left font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    No customers found matching your search.
                  </td>
                </tr>
              ) : (
                filtered.map((c, i) => (
                  <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-white/[0.03] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary-600 to-gold-400 flex items-center justify-center text-white font-bold text-sm uppercase flex-shrink-0">
                            {c.name?.charAt(0) || '?'}
                          </div>
                          {isPremium(c) && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center" title="Premium Customer">
                              <FiStar className="w-2.5 h-2.5 text-yellow-900 fill-yellow-900" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="text-white font-medium">{c.name}</p>
                            {isPremium(c) && <span className="text-yellow-400 text-xs font-semibold bg-yellow-400/10 px-1.5 py-0.5 rounded-md">⭐ Premium</span>}
                          </div>
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
                    <td className="px-6 py-4">
                      <button
                        onClick={() => { setDiscountModal(c); setDiscountPct(15); }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gold-300/10 text-gold-300 border border-gold-300/20 hover:bg-gold-300/20 transition-all"
                        title="Send discount code"
                      >
                        <FiGift className="w-3.5 h-3.5" /> Discount
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Discount Code Modal */}
      {discountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card w-full max-w-sm p-6 space-y-5 animate-fade-in border-gold-300/20">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-heading text-lg font-semibold flex items-center gap-2">
                <FiGift className="text-gold-300" /> Send Discount Code
              </h3>
              <button onClick={() => setDiscountModal(null)} className="text-gray-500 hover:text-white"><FiX className="w-5 h-5" /></button>
            </div>
            <div className="bg-gold-300/5 border border-gold-300/15 rounded-xl p-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary-600 to-gold-400 flex items-center justify-center text-white font-bold text-sm uppercase">
                  {discountModal.name?.charAt(0)}
                </div>
                <div>
                  <p className="text-white font-medium">{discountModal.name}</p>
                  <p className="text-gray-400 text-xs">{discountModal.email}</p>
                </div>
              </div>
              <p className="text-gray-400 text-xs mt-3">Total Spent: <span className="text-gold-300 font-semibold">₹{discountModal.totalSpent?.toLocaleString('en-IN')}</span></p>
            </div>
            <div className="space-y-2">
              <label className="text-gray-400 text-sm font-medium">Discount Percentage (%)</label>
              <input
                id="discount-pct-input"
                type="number"
                min="1" max="100"
                value={discountPct}
                onChange={e => setDiscountPct(Number(e.target.value))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold-300/50 transition-all"
              />
              <p className="text-gray-500 text-xs">A unique one-time code valid for 30 days will be emailed to the customer.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSendDiscount}
                disabled={!discountPct || discountPct < 1 || sendingDiscount}
                id="send-discount-btn"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold bg-gold-300/15 text-gold-300 border border-gold-300/25 hover:bg-gold-300/25 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                {sendingDiscount ? <div className="w-4 h-4 border-2 border-gold-300/30 border-t-gold-300 rounded-full animate-spin" /> : <FiGift className="w-4 h-4" />}
                {sendingDiscount ? 'Sending...' : `Send ${discountPct}% Code`}
              </button>
              <button onClick={() => setDiscountModal(null)} className="px-4 py-3 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 border border-transparent transition-all">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCustomers;
