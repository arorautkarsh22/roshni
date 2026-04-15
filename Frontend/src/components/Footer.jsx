import { Link } from 'react-router-dom';
import { FiMail, FiPhone, FiMapPin, FiHeart } from 'react-icons/fi';
import { FaInstagram, FaFacebookF, FaTwitter, FaPinterestP } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="border-t theme-border" style={{ backgroundColor: 'var(--bg-surface)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <img
                src="/logo.svg"
                alt="Roshni Creations"
                className="h-12 w-auto drop-shadow-lg"
              />
              <span className="font-heading text-xl font-semibold theme-text">
                Roshni <span className="text-gold-300">Creations</span>
              </span>
            </Link>
            <p className="theme-text-muted text-sm leading-relaxed">
              Handcrafted with love, our collections celebrate the rich heritage of Indian craftsmanship.
              Each piece tells a story of tradition and elegance.
            </p>
            <div className="flex gap-3">
              {[FaInstagram, FaFacebookF, FaTwitter, FaPinterestP].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-lg border flex items-center justify-center
                                               theme-text-muted hover:text-gold-300 hover:border-gold-300/30 hover:bg-gold-300/10
                                               transition-all duration-300" style={{ borderColor: 'var(--border-glass)', background: 'var(--bg-glass)' }}>
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-semibold mb-4 theme-text">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { to: '/', label: 'Home' },
                { to: '/shop', label: 'Shop All' },
                { to: '/wishlist', label: 'Wishlist' },
                { to: '/orders', label: 'My Orders' },
                { to: '/profile', label: 'My Account' },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="theme-text-muted hover:text-gold-300 text-sm transition-colors duration-300">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-heading font-semibold mb-4 theme-text">Customer Service</h4>
            <ul className="space-y-2 text-sm theme-text-muted">
              <li>Shipping & Returns</li>
              <li>Size Guide</li>
              <li>Care Instructions</li>
              <li>Privacy Policy</li>
              <li>Terms & Conditions</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading font-semibold mb-4 theme-text">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm theme-text-muted">
                <FiMail className="w-4 h-4 text-gold-300 flex-shrink-0" />
                <span>roshnidcreations@gmail.com</span>
              </li>
              <li className="flex items-center gap-3 text-sm theme-text-muted">
                <FiPhone className="w-4 h-4 text-gold-300 flex-shrink-0" />
                <span>+91 98123 45678</span>
              </li>
              <li className="flex items-start gap-3 text-sm theme-text-muted">
                <FiMapPin className="w-4 h-4 text-gold-300 flex-shrink-0 mt-0.5" />
                <span>Sector 13, Panipat, Haryana, India — 132103</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t theme-border py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            © 2026 Roshni Creations. All rights reserved.
          </p>
          <p className="text-gray-500 text-sm flex items-center gap-1">
            Made with <FiHeart className="w-3 h-3 text-primary-500" /> in India
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
