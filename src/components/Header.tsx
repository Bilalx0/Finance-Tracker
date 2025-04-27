import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useFinance } from '../contexts/FinanceContext';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const { summary } = useFinance();
  const { user, logout } = useAuth();


  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
    { path: '/transactions', label: 'Transactions', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
    { path: '/targets', label: 'Targets', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  ];

  return (
    <header className="flex flex-col lg:flex-row justify-between items-center p-4 bg-dark border-b border-gray-800 relative">
      {/* Small Screen Header Content */}
      <div className="lg:hidden w-full text-center mb-4">
        <h1 className="text-lg font-semibold text-text/light">Personal Finance Tracker</h1>
        <div className="mt-2">
          <h2 className="text-sm text-text/muted">Available Balance</h2>
          <p className="text-xl font-bold text-secondary">${summary.availableBalance.toLocaleString()}</p>
        </div>
      </div>

      {/* Desktop Header Content */}
      <div className="hidden lg:flex flex-col items-start w-full lg:w-auto mb-4 lg:mb-0">
        <div>
          <h1 className="text-sm text-text/muted">Personal Finance Tracker</h1>
          <h2 className="text-xl sm:text-2xl font-semibold text-text/light mt-1">Available Balance</h2>
          <p className="text-2xl sm:text-3xl font-bold text-secondary mt-1">${summary.availableBalance.toLocaleString()}</p>
        </div>

        {/* Desktop Navbar */}
        <nav className="hidden lg:flex bg-dark.light rounded-lg mt-4">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item px-6 py-3 ${currentPath === item.path ? 'bg-dark bg-opacity-60' : ''}`}
            >
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
                {item.label}
              </span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Mobile Sidebar Toggle (small screens) */}
      <div className="lg:hidden fixed right-4 top-4 z-20">
        <div
          onClick={toggleSidebar}
          className="w-10 h-10 bg-gradient-to-r from-blue-400 to-accent/purple rounded-full overflow-hidden cursor-pointer"
        >
          <div className="w-full h-full flex items-center justify-center text-white font-bold">
            {user?.username?.[0]?.toUpperCase() || 'U'}
          </div>
        </div>

        {/* Sidebar Menu */}
        <div
          className={`fixed top-0 right-0 h-full w-64 bg-dark.light transform transition-transform duration-300 ease-in-out ${
            isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
          } z-30`}
        >
          <div className="p-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-accent/purple rounded-full flex items-center justify-center text-white font-bold">
                {user?.username?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <h3 className="font-medium text-text/light">{user?.username || 'User'}</h3>
                <p className="text-sm text-text/muted">{user?.email || 'user@example.com'}</p>
              </div>
            </div>
            <nav className="flex flex-col space-y-2 mb-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={toggleSidebar}
                  className={`px-4 py-2 text-sm text-gray-300 hover:bg-dark hover:text-white rounded-md ${
                    currentPath === item.path ? 'bg-dark bg-opacity-60' : ''
                  }`}
                >
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                    </svg>
                    {item.label}
                  </span>
                </Link>
              ))}
            </nav>
            <button
              onClick={handleLogout}
              className="w-full text-left block px-4 py-2 text-sm text-gray-300 hover:bg-dark hover:text-white rounded-md"
            >
              Sign out
            </button>
          </div>
        </div>

        {/* Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-20"
            onClick={toggleSidebar}
          />
        )}
      </div>

      {/* Desktop User Info */}
      <div className="hidden lg:flex items-center absolute top-4 right-4 space-x-3">
        <div className="relative group flex flex-col items-center">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-accent/purple rounded-full overflow-hidden cursor-pointer flex items-center justify-center text-white font-bold ml-auto">
            {user?.username?.[0]?.toUpperCase() || 'U'}
            </div>
          <div className="mt-2 text-right">
            <h3 className="font-medium text-text/light text-sm">{user?.username || 'User'}</h3>
            <p className="text-xs text-text/muted">{user?.email || 'user@example.com'}</p>
          </div>

          <div className="absolute top-full right-0 mt-2 w-48 bg-dark.light rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
            <button
              onClick={handleLogout}
              className="w-full text-left block px-4 py-2 text-sm text-gray-300 hover:bg-dark hover:text-white"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;