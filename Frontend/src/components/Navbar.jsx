import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { FiShoppingCart, FiHeart, FiUser, FiMenu, FiX, FiSearch, FiLogOut, FiPackage } from 'react-icons/fi';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { isAuthenticated, user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsOpen(false);
    }
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/shop', label: 'Shop' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-dark-500/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <img
              src="/logo.svg"
              alt="Roshni Creations"
              className="h-12 w-auto group-hover:scale-105 transition-transform duration-300 drop-shadow-lg"
            />
            <span className="font-heading text-xl font-semibold text-white hidden sm:block">
              Roshni <span className="text-gold-300">Creations</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-gray-300 hover:text-gold-300 transition-colors duration-300 text-sm font-medium relative
                           after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-gold-300
                           hover:after:w-full after:transition-all after:duration-300"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm text-white
                         placeholder-gray-500 focus:outline-none focus:border-primary-500/50 w-48 lg:w-64
                         transition-all duration-300 focus:w-72"
            />
            <FiSearch className="absolute left-3 text-gray-500 w-4 h-4" />
          </form>

          {/* Actions */}
          <div className="flex items-center gap-2 md:gap-4">
            {isAuthenticated ? (
              <>
                <Link to="/wishlist" className="relative p-2 text-gray-300 hover:text-gold-300 transition-colors" title="Wishlist">
                  <FiHeart className="w-5 h-5" />
                </Link>
                <Link to="/cart" className="relative p-2 text-gray-300 hover:text-gold-300 transition-colors" title="Cart">
                  <FiShoppingCart className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-500 text-white text-xs rounded-full
                                     flex items-center justify-center font-semibold animate-scale-in">
                      {cartCount}
                    </span>
                  )}
                </Link>
                <Link to="/orders" className="relative p-2 text-gray-300 hover:text-gold-300 transition-colors hidden md:block" title="Orders">
                  <FiPackage className="w-5 h-5" />
                </Link>
                <Link to="/profile" className="relative p-2 text-gray-300 hover:text-gold-300 transition-colors" title="Profile">
                  <FiUser className="w-5 h-5" />
                </Link>
                <button onClick={logout} className="hidden md:flex p-2 text-gray-400 hover:text-red-400 transition-colors" title="Logout">
                  <FiLogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="text-sm text-gray-300 hover:text-gold-300 transition-colors px-3 py-2">
                  Login
                </Link>
                <Link to="/register" className="btn-primary text-sm !px-4 !py-2">
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu */}
            <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 text-gray-300">
              {isOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-dark-500/95 backdrop-blur-xl border-t border-white/5 animate-slide-down">
          <div className="px-4 py-4 space-y-3">
            <form onSubmit={handleSearch} className="flex items-center relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="input-field !rounded-full !py-2 !pl-10"
              />
              <FiSearch className="absolute left-3 text-gray-500 w-4 h-4" />
            </form>
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setIsOpen(false)}
                className="block py-2 px-3 text-gray-300 hover:text-gold-300 hover:bg-white/5 rounded-lg transition-all"
              >
                {link.label}
              </Link>
            ))}
            {isAuthenticated && (
              <>
                <Link to="/orders" onClick={() => setIsOpen(false)}
                  className="block py-2 px-3 text-gray-300 hover:text-gold-300 hover:bg-white/5 rounded-lg transition-all">
                  My Orders
                </Link>
                <button onClick={() => { logout(); setIsOpen(false); }}
                  className="block w-full text-left py-2 px-3 text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
