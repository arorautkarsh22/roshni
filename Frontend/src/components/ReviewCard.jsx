import { FiStar } from 'react-icons/fi';

const ReviewCard = ({ review }) => {
  return (
    <div className="glass-card p-6 space-y-4">
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <FiStar
            key={i}
            className={`w-4 h-4 ${i < (review.rating || 5) ? 'text-gold-300 fill-gold-300' : 'text-gray-600'}`}
          />
        ))}
      </div>
      <p className="text-gray-300 text-sm leading-relaxed">{review.comment || review.text}</p>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-gold-300 flex items-center justify-center">
          <span className="text-white text-sm font-semibold">
            {(review.userName || review.user || 'U').charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <p className="text-white text-sm font-medium">{review.userName || review.user || 'Anonymous'}</p>
          <p className="text-gray-500 text-xs">{review.date ? new Date(review.date).toLocaleDateString() : 'Recent'}</p>
        </div>
      </div>
    </div>
  );
};

export default ReviewCard;
