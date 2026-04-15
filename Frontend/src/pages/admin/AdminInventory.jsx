import { useState, useEffect } from 'react';
import { getInventoryStats } from '../../api/adminService';
import Loader from '../../components/Loader';
import {
  FiBox,
  FiAlertTriangle,
  FiCheckCircle,
  FiXCircle,
  FiSearch,
  FiDollarSign,
} from 'react-icons/fi';

const stockBadge = (status) => {
  switch (status) {
    case 'IN_STOCK':
      return 'bg-green-500/15 text-green-400';
    case 'LOW_STOCK':
      return 'bg-yellow-500/15 text-yellow-400';
    case 'OUT_OF_STOCK':
      return 'bg-red-500/15 text-red-400';
    default:
      return 'bg-gray-500/15 text-gray-400';
  }
};

const stockLabel = (status) => {
  switch (status) {
    case 'IN_STOCK': return 'In Stock';
    case 'LOW_STOCK': return 'Low Stock';
    case 'OUT_OF_STOCK': return 'Out of Stock';
    default: return status;
  }
};

const AdminInventory = () => {
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
      const res = await getInventoryStats();
      setData(res.data?.data || null);
    } catch (err) {
      console.error('Failed to load inventory', err);
      setError('Failed to load inventory data. Check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader size="lg" text="Loading inventory..." />;

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
    { label: 'Total Products', value: data?.totalProducts || 0, icon: FiBox, color: 'text-primary-400', bg: 'bg-primary-500/10' },
    { label: 'In Stock', value: data?.inStockProducts || 0, icon: FiCheckCircle, color: 'text-green-400', bg: 'bg-green-500/10' },
    { label: 'Low Stock', value: data?.lowStockProducts || 0, icon: FiAlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    { label: 'Out of Stock', value: data?.outOfStockProducts || 0, icon: FiXCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
  ];

  const products = (data?.products || [])
    .filter(p => {
      if (filter === 'ALL') return true;
      return p.stockStatus === filter;
    })
    .filter(p =>
      search === '' ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.productId.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
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

      {/* Inventory Value Banner */}
      <div className="glass-card p-5 flex items-center gap-4 border-gold-300/20">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gold-300/10">
          <FiDollarSign className="w-5 h-5 text-gold-300" />
        </div>
        <div>
          <p className="text-gray-400 text-xs uppercase tracking-wider">Total Inventory Value</p>
          <p className="text-gold-300 text-2xl font-heading font-bold">
            ₹{(data?.totalInventoryValue || 0).toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* Filters + Search */}
      <div className="glass-card p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          {['ALL', 'IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                filter === f
                  ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                  : 'text-gray-500 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              {f === 'ALL' ? 'All' : stockLabel(f)}
            </button>
          ))}
        </div>
        <div className="flex-1 relative sm:max-w-xs sm:ml-auto">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary-500/50 transition-all"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 text-xs uppercase tracking-wider border-b border-white/5">
                <th className="px-6 py-4 text-left font-medium">Product</th>
                <th className="px-6 py-4 text-left font-medium hidden md:table-cell">Category</th>
                <th className="px-6 py-4 text-left font-medium">Price</th>
                <th className="px-6 py-4 text-left font-medium">Stock</th>
                <th className="px-6 py-4 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No products found matching your criteria.
                  </td>
                </tr>
              ) : (
                products.map((p, i) => (
                  <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-white/[0.03] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {p.image ? (
                          <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover bg-white/5" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                            <FiBox className="w-4 h-4 text-gray-500" />
                          </div>
                        )}
                        <div>
                          <p className="text-white font-medium">{p.name}</p>
                          <p className="text-gray-500 text-xs">{p.productId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-400 hidden md:table-cell">{p.category}</td>
                    <td className="px-6 py-4 text-white font-medium">₹{p.price.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4">
                      <span className={`text-white font-semibold ${p.stock <= 5 ? (p.stock === 0 ? 'text-red-400' : 'text-yellow-400') : ''}`}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${stockBadge(p.stockStatus)}`}>
                        {stockLabel(p.stockStatus)}
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

export default AdminInventory;
