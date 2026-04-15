import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';

const CategoryCard = ({ category }) => {
  return (
    <Link
      to={`/shop?category=${category.id}`}
      className="group relative overflow-hidden rounded-2xl aspect-[4/5] block"
    >
      <img
        src={category.imageUrl || `https://picsum.photos/seed/cat-${category.id}/400/500`}
        alt={category.name}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        loading="lazy"
      />
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-dark-500 via-dark-500/30 to-transparent" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <h3 className="font-heading text-xl font-semibold group-hover:text-gold-300 transition-colors"
            style={{ color: '#ffffff' }}>
          {category.name}
        </h3>
        <p className="text-sm mt-1 line-clamp-2" style={{ color: '#d1d5db' }}>
          {category.description || 'Explore collection'}
        </p>
        <div className="flex items-center gap-1 text-gold-300 text-sm font-medium mt-3
                        transform translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
          Shop Now <FiArrowRight className="w-4 h-4" />
        </div>
      </div>
    </Link>
  );
};

export default CategoryCard;
