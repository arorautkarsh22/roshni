import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';

const HeroBanner = () => {
  const blobRef = useRef(null);

  const handleMouseMove = (e) => {
    if (blobRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      blobRef.current.animate({
        left: `${x}px`,
        top: `${y}px`
      }, { duration: 1500, fill: "forwards", easing: "ease" });
    }
  };

  return (
    <section
      onMouseMove={handleMouseMove}
      className="relative min-h-[85vh] flex items-center overflow-hidden"
    >
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-48 h-48 md:w-96 md:h-96 bg-primary-300 opacity-30 md:opacity-80 rounded-full blur-[60px] md:blur-[100px] animate-float" />
        <div className="absolute bottom-20 right-10 w-64 h-64 md:w-[500px] md:h-[500px] bg-primary-200 opacity-20 md:opacity-70 rounded-full blur-[80px] md:blur-[120px] animate-float" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 md:w-[800px] md:h-[800px] bg-primary-100 opacity-20 md:opacity-50 rounded-full blur-[100px] md:blur-[150px]" />

        {/* Interactive Cursor Blur */}
        <div
          ref={blobRef}
          className="absolute w-[200px] h-[200px] bg-gradient-to-r from-gold-300/30 to-primary-400/30 rounded-full blur-[60px] pointer-events-none -translate-x-1/2 -translate-y-1/2 z-0"
          style={{ top: '50%', left: '50%' }}
        />
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

          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold theme-text leading-tight animate-slide-up">
            Crafted with
            <span className="block text-gradient">Tradition & Love</span>
          </h1>

          <p className="theme-text text-base sm:text-lg md:text-xl mt-4 max-w-xl animate-slide-up opacity-90" style={{ animationDelay: '0.2s' }}>
            Discover our exquisite collection of handcrafted Indian ethnic wear.
            Each piece is a masterpiece woven with centuries of artisanal heritage.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 mt-8 md:mt-10 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <Link to="/shop" className="btn-gold flex items-center justify-center gap-2 text-base md:text-lg w-full sm:w-auto">
              Explore Collection
              <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/shop?featured=true" className="btn-outline flex items-center justify-center gap-2 w-full sm:w-auto">
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
                <p className="theme-text text-sm mt-1 opacity-90">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
