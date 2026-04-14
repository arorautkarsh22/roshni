import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';
import { getProductsPaginated, searchProducts, getProductsByCategory } from '../api/productService';
import { getAllCategories } from '../api/categoryService';
import { FiSearch, FiFilter, FiChevronLeft, FiChevronRight, FiX } from 'react-icons/fi';

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [sortBy, setSortBy] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [page, sortBy, sortDir, selectedCategory]);

  useEffect(() => {
    const q = searchParams.get('search');
    if (q) {
      setSearch(q);
      handleSearch(q);
    }
  }, [searchParams]);

  const fetchCategories = async () => {
    try {
      const res = await getAllCategories();
      setCategories(res.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      if (selectedCategory) {
        const res = await getProductsByCategory(selectedCategory);
        setProducts(res.data?.data || []);
        setTotalPages(1);
      } else {
        const res = await getProductsPaginated(page, 12, sortBy, sortDir);
        const data = res.data?.data;
        setProducts(data?.content || data || []);
        setTotalPages(data?.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query = search) => {
    if (!query.trim()) {
      fetchProducts();
      return;
    }
    setLoading(true);
    try {
      const res = await searchProducts(query.trim());
      setProducts(res.data?.data || []);
      setTotalPages(1);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSortBy('name');
    setSortDir('asc');
    setPage(0);
    setSearchParams({});
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-b from-primary-500/10 to-transparent py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="section-heading">Our Collection</h1>
          <p className="section-subheading">Discover the finest handcrafted creations</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          {/* Search */}
          <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="flex-1 relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="input-field !pl-10 !pr-10"
            />
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
            {search && (
              <button type="button" onClick={() => { setSearch(''); fetchProducts(); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                <FiX className="w-4 h-4" />
              </button>
            )}
          </form>

          <div className="flex gap-3">
            {/* Sort */}
            <select
              value={`${sortBy}-${sortDir}`}
              onChange={(e) => {
                const [by, dir] = e.target.value.split('-');
                setSortBy(by);
                setSortDir(dir);
                setPage(0);
              }}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm
                         focus:outline-none focus:border-primary-500/50 appearance-none cursor-pointer"
            >
              <option value="name-asc" className="bg-dark-500">Name: A–Z</option>
              <option value="name-desc" className="bg-dark-500">Name: Z–A</option>
              <option value="price-asc" className="bg-dark-500">Price: Low–High</option>
              <option value="price-desc" className="bg-dark-500">Price: High–Low</option>
              <option value="createdAt-desc" className="bg-dark-500">Newest First</option>
            </select>

            {/* Filter toggle (mobile) */}
            <button onClick={() => setShowFilters(!showFilters)}
              className="md:hidden p-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white">
              <FiFilter className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <aside className={`${showFilters ? 'block' : 'hidden'} md:block w-full md:w-56 flex-shrink-0`}>
            <div className="glass-card p-5 space-y-4 sticky top-24">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold text-sm">Categories</h3>
                {selectedCategory && (
                  <button onClick={clearFilters} className="text-xs text-gold-300 hover:underline">Clear</button>
                )}
              </div>
              <div className="space-y-1">
                <button
                  onClick={() => { setSelectedCategory(''); setPage(0); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                    !selectedCategory ? 'bg-primary-500/20 text-primary-400' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  All Products
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => { setSelectedCategory(cat.id); setPage(0); }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                      selectedCategory === cat.id ? 'bg-primary-500/20 text-primary-400' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {loading ? (
              <Loader text="Loading products..." />
            ) : products.length > 0 ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product.id || product.productId} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-3 mt-12">
                    <button
                      disabled={page === 0}
                      onClick={() => setPage(p => p - 1)}
                      className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400
                                 hover:text-white hover:border-primary-500/30 transition-all disabled:opacity-30"
                    >
                      <FiChevronLeft className="w-5 h-5" />
                    </button>
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setPage(i)}
                        className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                          page === i
                            ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                            : 'bg-white/5 text-gray-400 hover:text-white'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      disabled={page >= totalPages - 1}
                      onClick={() => setPage(p => p + 1)}
                      className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400
                                 hover:text-white hover:border-primary-500/30 transition-all disabled:opacity-30"
                    >
                      <FiChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20">
                <p className="text-gray-500 text-lg">No products found</p>
                <button onClick={clearFilters} className="btn-outline mt-4">Clear Filters</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;
