import { FiMapPin, FiEdit2, FiTrash2, FiCheck } from 'react-icons/fi';

const AddressCard = ({ address, onEdit, onDelete, selected, onSelect }) => {
  return (
    <div
      onClick={onSelect}
      className={`glass-card p-5 cursor-pointer transition-all duration-300 ${
        selected
          ? 'border-primary-500 bg-primary-500/5 shadow-lg shadow-primary-500/10'
          : 'hover:border-white/20'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
            selected ? 'bg-primary-500 text-white' : 'bg-white/5 text-gray-400'
          }`}>
            {selected ? <FiCheck className="w-5 h-5" /> : <FiMapPin className="w-5 h-5" />}
          </div>
          <div>
            <p className="text-white font-medium text-sm">{address.fullName || address.name || 'Address'}</p>
            <p className="text-gray-400 text-sm mt-1 leading-relaxed">
              {address.addressLine1 || address.street}, {address.city}<br />
              {address.state} — {address.zipCode || address.pincode}
            </p>
            {address.phone && (
              <p className="text-gray-500 text-xs mt-2">📞 {address.phone}</p>
            )}
          </div>
        </div>

        {(onEdit || onDelete) && (
          <div className="flex gap-1">
            {onEdit && (
              <button onClick={(e) => { e.stopPropagation(); onEdit(address); }}
                className="p-2 text-gray-500 hover:text-gold-300 transition-colors">
                <FiEdit2 className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button onClick={(e) => { e.stopPropagation(); onDelete(address.id); }}
                className="p-2 text-gray-500 hover:text-red-400 transition-colors">
                <FiTrash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddressCard;
