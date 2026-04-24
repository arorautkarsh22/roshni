import { useState, useEffect } from 'react';
import { getInventoryStats, updateProductStock } from '../../api/adminService';
import Loader from '../../components/Loader';
import toast from 'react-hot-toast';
import {
  FiBox,
  FiAlertTriangle,
  FiCheckCircle,
  FiXCircle,
  FiSearch,
  FiDollarSign,
  FiPlus,
  FiX,
  FiChevronUp,
  FiChevronDown,
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
  const [stockModal, setStockModal] = useState(null); // product object
  const [stockQty, setStockQty] = useState('');
  const [updatingStock, setUpdatingStock] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });


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

  const handleStockUpdate = async () => {
    const qty = parseInt(stockQty);
    if (!qty || qty < 1) { toast.error('Enter a valid quantity'); return; }
    setUpdatingStock(true);
    try {
      await updateProductStock(stockModal.productId, qty);
      toast.success(`+${qty} units added to ${stockModal.name}`);
      setStockModal(null);
      setStockQty('');
      await fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update stock.');
    } finally {
      setUpdatingStock(false);
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

  const filtered = (data?.products || [])
    .filter(p => filter === 'ALL' || p.stockStatus === filter)
    .filter(p =>
      search === '' ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.productId.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
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
                <th className="px-6 py-4 text-left font-medium cursor-pointer hover:text-white transition-colors" onClick={() => requestSort('name')}>
                  <div className="flex items-center gap-1">Product {getSortIcon('name')}</div>
                </th>
                <th className="px-6 py-4 text-left font-medium hidden md:table-cell cursor-pointer hover:text-white transition-colors" onClick={() => requestSort('category')}>
                  <div className="flex items-center gap-1">Category {getSortIcon('category')}</div>
                </th>
                <th className="px-6 py-4 text-left font-medium cursor-pointer hover:text-white transition-colors" onClick={() => requestSort('price')}>
                  <div className="flex items-center gap-1">Price {getSortIcon('price')}</div>
                </th>
                <th className="px-6 py-4 text-left font-medium cursor-pointer hover:text-white transition-colors" onClick={() => requestSort('stock')}>
                  <div className="flex items-center gap-1">Stock {getSortIcon('stock')}</div>
                </th>
                <th className="px-6 py-4 text-left font-medium cursor-pointer hover:text-white transition-colors" onClick={() => requestSort('stockStatus')}>
                  <div className="flex items-center gap-1">Status {getSortIcon('stockStatus')}</div>
                </th>
                <th className="px-6 py-4 text-left font-medium">Update</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No products found matching your criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((p, i) => (
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
                    <td className="px-6 py-4">
                      <button
                        onClick={() => { setStockModal(p); setStockQty(''); }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary-500/15 text-primary-400 border border-primary-500/20 hover:bg-primary-500/25 transition-all"
                      >
                        <FiPlus className="w-3.5 h-3.5" /> Add Stock
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Update Modal */}
      {stockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card w-full max-w-sm p-6 space-y-5 animate-fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-heading text-lg font-semibold flex items-center gap-2">
                <FiPlus className="text-primary-400" /> Add Stock
              </h3>
              <button onClick={() => setStockModal(null)} className="text-gray-500 hover:text-white"><FiX className="w-5 h-5" /></button>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-white font-medium">{stockModal.name}</p>
              <p className="text-gray-400 text-xs mt-1">Current stock: <span className="text-white font-semibold">{stockModal.stock}</span> units</p>
            </div>
            <div className="space-y-2">
              <label className="text-gray-400 text-sm font-medium">New Stock Arrived (qty) <span className="text-red-400">*</span></label>
              <input
                id="stock-qty-input"
                type="number"
                min="1"
                value={stockQty}
                onChange={e => setStockQty(e.target.value)}
                placeholder="e.g. 25"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500/50 transition-all"
                autoFocus
              />
              {stockQty && parseInt(stockQty) > 0 && (
                <p className="text-green-400 text-xs">New total will be: {stockModal.stock + parseInt(stockQty)} units</p>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleStockUpdate}
                disabled={!stockQty || parseInt(stockQty) < 1 || updatingStock}
                id="confirm-stock-btn"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold bg-primary-500/20 text-primary-400 border border-primary-500/30 hover:bg-primary-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                {updatingStock ? <div className="w-4 h-4 border-2 border-primary-400/30 border-t-primary-400 rounded-full animate-spin" /> : <FiPlus className="w-4 h-4" />}
                {updatingStock ? 'Updating...' : 'Update Stock'}
              </button>
              <button onClick={() => setStockModal(null)} className="px-4 py-3 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 border border-transparent transition-all">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInventory;
