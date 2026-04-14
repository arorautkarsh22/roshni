import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';

const HeroBanner = () => {
  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gold-300/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-500/5 rounded-full blur-3xl" />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'radial-gradient(circle, #D4A574 1px, transparent 1px)', backgroundSize: '30px 30px' }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-20">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-primary-500/10 border border-primary-500/20 rounded-full px-4 py-2 mb-6 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-gold-300 animate-glow" />
            <span className="text-gold-300 text-sm font-medium">New Collection 2026</span>
          </div>

          <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight animate-slide-up">
            Crafted with
            <span className="block text-gradient">Tradition & Love</span>
          </h1>

          <p className="text-gray-400 text-lg md:text-xl mt-6 leading-relaxed max-w-xl animate-slide-up" style={{ animationDelay: '0.2s' }}>
            Discover our exquisite collection of handcrafted Indian ethnic wear.
            Each piece is a masterpiece woven with centuries of artisanal heritage.
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-10 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <Link to="/shop" className="btn-gold flex items-center gap-2 text-lg">
              Explore Collection
              <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/shop?featured=true" className="btn-outline flex items-center gap-2">
              Featured Items
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-16 max-w-md animate-fade-in" style={{ animationDelay: '0.6s' }}>
            {[
              { value: '12+', label: 'Products' },
              { value: '1K+', label: 'Happy Customers' },
              { value: '100%', label: 'Handcrafted' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl md:text-3xl font-heading font-bold text-gold-300">{stat.value}</p>
                <p className="text-gray-500 text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
