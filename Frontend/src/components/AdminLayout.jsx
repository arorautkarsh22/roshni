import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { FiGrid, FiBox, FiUsers, FiShoppingBag, FiLogOut, FiSun, FiMoon } from 'react-icons/fi';

const AdminLayout = ({ children }) => {
  const { pathname } = useLocation();
  const { logout, user } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const navLinks = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: FiGrid },
    { label: 'Orders', path: '/admin/orders', icon: FiShoppingBag },
    { label: 'Inventory', path: '/admin/inventory', icon: FiBox },
    { label: 'Customers', path: '/admin/customers', icon: FiUsers },
  ];

  return (
    <div className="flex h-screen overflow-hidden font-body theme-bg-page">
      {/* Sidebar */}
      <aside className="w-64 theme-bg-surface border-r theme-border flex flex-col flex-shrink-0">
        <div className="h-20 flex items-center px-6 border-b theme-border">
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

        <div className="p-4 border-t theme-border">
          <div className="flex items-center gap-3 px-4 py-3 mb-2 rounded-xl" style={{ background: 'var(--bg-glass)' }}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary-600 to-gold-400 flex items-center justify-center text-white font-bold uppercase">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate theme-text">{user?.name || 'Administrator'}</p>
              <p className="text-xs truncate theme-text-muted">Admin Access</p>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-1">
            <button
              onClick={toggleTheme}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm rounded-xl transition-all hover:bg-primary-500/10"
              style={{ color: 'var(--text-muted)' }}
            >
              {isDark ? <FiSun className="w-4 h-4" /> : <FiMoon className="w-4 h-4" />}
              {isDark ? 'Light' : 'Dark'}
            </button>
            <button onClick={logout} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:text-red-400 rounded-xl transition-colors hover:bg-red-500/10">
              <FiLogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Arena */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header Utilities */}
        <header className="h-20 backdrop-blur-md border-b theme-border flex items-center justify-between px-8 flex-shrink-0" style={{ background: 'var(--bg-glass)' }}>
          <h2 className="font-heading text-lg font-semibold capitalize theme-text">
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
