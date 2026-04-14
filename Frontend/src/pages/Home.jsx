import { useState, useEffect } from 'react';
import HeroBanner from '../components/HeroBanner';
import ProductCard from '../components/ProductCard';
import CategoryCard from '../components/CategoryCard';
import Loader from '../components/Loader';
import { getFeaturedProducts } from '../api/productService';
import { getAllCategories } from '../api/categoryService';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiStar, FiTruck, FiShield, FiRefreshCw } from 'react-icons/fi';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          getFeaturedProducts().catch(() => ({ data: { data: [] } })),
          getAllCategories().catch(() => ({ data: { data: [] } })),
        ]);
        setFeaturedProducts(prodRes.data?.data || []);
        setCategories(catRes.data?.data || []);
      } catch (err) {
        console.error('Failed to load home data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const features = [
    { icon: FiTruck, title: 'Free Shipping', desc: 'On orders above ₹999' },
    { icon: FiShield, title: 'Secure Payment', desc: '100% secure transactions' },
    { icon: FiRefreshCw, title: 'Easy Returns', desc: '7-day return policy' },
    { icon: FiStar, title: 'Premium Quality', desc: 'Handcrafted excellence' },
  ];

  return (
    <div className="min-h-screen">
      <HeroBanner />

      {/* Features Strip */}
      <section className="border-y border-white/5 bg-dark-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map((f) => (
              <div key={f.title} className="flex items-center gap-3 group">
                <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center
                                group-hover:bg-primary-500/20 transition-colors">
                  <f.icon className="w-5 h-5 text-primary-400" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{f.title}</p>
                  <p className="text-gray-500 text-xs">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="section-heading">Shop by Category</h2>
                <p className="section-subheading">Explore our curated collections</p>
              </div>
              <Link to="/shop" className="text-gold-300 text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all">
                View All <FiArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {categories.slice(0, 4).map((cat) => (
                <CategoryCard key={cat.id} category={cat} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="py-20 bg-dark-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="section-heading">Featured Collection</h2>
              <p className="section-subheading">Handpicked pieces you'll love</p>
            </div>
            <Link to="/shop" className="text-gold-300 text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all">
              View All <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <Loader text="Loading featured products..." />
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredProducts.slice(0, 8).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-500">No featured products yet. Check back soon!</p>
              <Link to="/shop" className="btn-primary mt-4 inline-block">Browse All Products</Link>
            </div>
          )}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-heading">What Our Customers Say</h2>
            <p className="section-subheading">Real stories from real people</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Priya Sharma', text: 'The quality of the sarees is absolutely stunning. Each piece feels like a work of art. I\'m a customer for life!', rating: 5 },
              { name: 'Anita Verma', text: 'Fast delivery and beautiful packaging. The lehenga was exactly as shown in the pictures. Highly recommended!', rating: 5 },
              { name: 'Meera Patel', text: 'I\'ve been ordering from Roshni Creations for over a year now. The consistency in quality is remarkable.', rating: 5 },
            ].map((t, i) => (
              <div key={i} className="glass-card p-6 space-y-4">
                <div className="flex gap-1">
                  {[...Array(t.rating)].map((_, j) => (
                    <FiStar key={j} className="w-4 h-4 text-gold-300 fill-gold-300" />
                  ))}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed italic">"{t.text}"</p>
                <div className="flex items-center gap-3 pt-2 border-t border-white/5">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-gold-300 flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">{t.name.charAt(0)}</span>
                  </div>
                  <p className="text-white text-sm font-medium">{t.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-gold-300/10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-white mb-4">
            Join the <span className="text-gradient">Roshni Family</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto mb-8">
            Be the first to know about new collections, exclusive offers, and styling tips.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input type="email" placeholder="Enter your email" className="input-field flex-1 !rounded-full" />
            <button className="btn-gold !rounded-full whitespace-nowrap">Subscribe</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
