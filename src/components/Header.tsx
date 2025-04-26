import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useFinance } from '../contexts/FinanceContext';

interface HeaderProps {
  username?: string;
  userRole?: string;
  userAvatar?: string;
}

const Header: React.FC<HeaderProps> = ({
  username = 'Simon K. Jimmy',
  userRole = 'Finance Consultant',
  userAvatar = 'https://i.pravatar.cc/40?img=68', // Default avatar URL
}) => {
  const location = useLocation();
  const currentPath = location.pathname;
  const { summary } = useFinance();
  
  // Get current date
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });
  
  return (
    <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center p-4 bg-dark border-b border-gray-800">
      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 lg:space-x-10 w-full lg:w-auto mb-4 lg:mb-0">
        <div>
          <h1 className="text-sm text-text/muted">Personal Finance Tracker</h1>
          <h2 className="text-xl sm:text-2xl font-semibold text-text/light mt-1">Available Balance</h2>
          <p className="text-2xl sm:text-3xl font-bold text-secondary mt-1">${summary.availableBalance.toLocaleString()}</p>
        </div>
        
        <nav className="bg-dark.light rounded-lg flex flex-wrap w-full sm:w-auto mt-4 sm:mt-0">
          <Link 
            to="/dashboard" 
            className={`nav-item px-4 sm:px-6 py-3 flex-1 sm:flex-auto text-center sm:text-left ${currentPath === '/dashboard' ? 'bg-dark bg-opacity-60' : ''}`}
          >
            <span className="flex items-center justify-center sm:justify-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Dashboard
            </span>
          </Link>
          <Link 
            to="/transactions" 
            className={`nav-item px-4 sm:px-6 py-3 flex-1 sm:flex-auto text-center sm:text-left ${currentPath === '/transactions' ? 'bg-dark bg-opacity-60' : ''}`}
          >
            <span className="flex items-center justify-center sm:justify-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Transactions
            </span>
          </Link>
          <Link 
            to="/targets" 
            className={`nav-item px-4 sm:px-6 py-3 flex-1 sm:flex-auto text-center sm:text-left ${currentPath === '/targets' ? 'bg-dark bg-opacity-60' : ''}`}
          >
            <span className="flex items-center justify-center sm:justify-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Targets
            </span>
          </Link>
        </nav>
      </div>
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 lg:space-x-10 w-full lg:w-auto">
        <div className="text-text/muted text-left sm:text-right w-full sm:w-auto">
          <span className="flex items-center sm:justify-end">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm sm:text-base">{formattedDate}</span>
          </span>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="text-left sm:text-right">
            <h3 className="font-medium text-text/light">{username}</h3>
            <p className="text-sm text-text/muted">{userRole}</p>
          </div>
          <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-accent/purple rounded-full overflow-hidden flex-shrink-0">
            <img src={userAvatar} alt={username} className="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;