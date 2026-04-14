import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiHome, FiGrid, FiBox, FiUsers, FiShoppingBag, FiLogOut, FiMail } from 'react-icons/fi';

const AdminLayout = ({ children }) => {
  const { pathname } = useLocation();
  const { logout, user } = useAuth();

  const navLinks = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: FiGrid },
    { label: 'Orders', path: '/admin/orders', icon: FiShoppingBag },
    { label: 'Inventory', path: '/admin/inventory', icon: FiBox },
    { label: 'Customers', path: '/admin/customers', icon: FiUsers },
    { label: 'System Emails', path: '/admin/emails', icon: FiMail },
  ];

  return (
    <div className="flex h-screen bg-[#0f0f16] overflow-hidden font-body">
      {/* Sidebar */}
      <aside className="w-64 bg-dark-400 border-r border-white/5 flex flex-col flex-shrink-0">
        <div className="h-20 flex items-center px-6 border-b border-white/5">
          <Link to="/admin/dashboard" className="text-xl font-heading font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-300 to-primary-500">
            RC Admin
          </Link>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-2">Menu</p>
          {navLinks.map((link) => {
            const isActive = pathname === link.path || pathname.startsWith(`${link.path}/`);
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
                  isActive
                    ? 'bg-primary-500/10 text-primary-400'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <link.icon className={`w-5 h-5 ${isActive ? 'text-primary-400' : 'text-gray-500'}`} />
                <span className="font-medium">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 px-4 py-3 mb-2 rounded-xl bg-white/5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary-600 to-gold-400 flex items-center justify-center text-white font-bold uppercase">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{user?.name || 'Administrator'}</p>
              <p className="text-gray-500 text-xs truncate">Admin Access</p>
            </div>
          </div>


          <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:text-red-400 transition-colors">
            <FiLogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Arena */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header Utilities */}
        <header className="h-20 bg-dark-400/50 backdrop-blur-md border-b border-light-100 flex items-center justify-between px-8 flex-shrink-0">
          <h2 className="text-white font-heading text-lg font-semibold capitalize">
            {pathname.split('/').pop() || 'Dashboard'}
          </h2>
        </header>

        {/* Dynamic Canvas */}
        <div className="flex-1 overflow-y-auto p-8 relative">
           {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
