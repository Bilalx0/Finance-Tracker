import React, { useState, useEffect } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import MonthSelector from './MonthSelector';
import { ChevronDown, PanelRight } from 'lucide-react';

// Month abbreviations
const monthsAbbr = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

// Map full month names to their indices
const monthNameToIndex: Record<string, number> = {
  'January': 0, 'February': 1, 'March': 2, 'April': 3,
  'May': 4, 'June': 5, 'July': 6, 'August': 7,
  'September': 8, 'October': 9, 'November': 10, 'December': 11
};

const Sidebar: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const {
    currentMonth,
    currentYear,
    isMonthLocked,
    setMonth,
    summary
  } = useFinance();

  const currentMonthIndex = monthNameToIndex[currentMonth];

  const availableMonths = monthsAbbr.map((month, index) => {
    const isLocked = isMonthLocked(index, currentYear);
    return {
      name: month,
      index,
      isLocked
    };
  });

  const handleMonthSelect = (monthIndex: number) => {
    if (!isMonthLocked(monthIndex, currentYear)) {
      setMonth(monthIndex, currentYear);
      if (isMobile) setIsSidebarOpen(false);
    }
  };

  const navItems = [
    { path: '/dashboard', name: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { path: '/targets', name: 'Targets', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { path: '/transactions', name: 'Transactions', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  ];

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const checkScreenSize = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        const mobile = window.innerWidth < 768;
        setIsMobile(mobile);
        setIsSidebarOpen((prev) => (mobile ? prev : true));
      }, 100);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  // Safeguard summary values with fallback to 0
  const safeSummary = {
    totalIncome: Number(summary?.totalIncome) || 0,
    totalExpenses: Number(summary?.totalExpenses) || 0,
    availableBalance: Number(summary?.availableBalance) || 0,
  };

  return (
    <>
      <aside
        className={`
          flex-shrink-0
          bg-[#1E2A44] text-white h-screen border-r border-gray-600 transition-[width,min-width] duration-300
          ${isMobile
            ? isSidebarOpen
              ? 'fixed inset-y-0 left-0 w-64 min-w-64 z-40'
              : 'hidden'
            : isSidebarOpen
              ? 'block w-64 min-w-64'
              : 'block w-16 min-w-16'
          }
        `}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-600">
            {(isSidebarOpen || isMobile) && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold mr-2">
                    S
                  </div>
                  {isSidebarOpen && <span className="font-semibold">Savi</span>}
                </div>
                <button
                  className="p-2 rounded-md hover:bg-gray-700 hover:text-blue-500"
                  onClick={toggleSidebar}
                >
                  <PanelRight className="h-5 w-5 text-gray-400" />
                </button>
              </div>
            )}
            {(!isSidebarOpen && !isMobile) && (
              <div className="flex justify-center">
                <button
                  className="flex items-center rounded-md hover:bg-gray-700 hover:text-blue-500 justify-center w-full"
                  onClick={toggleSidebar}
                >
                  <PanelRight className="h-5 w-5 text-gray-400" />
                </button>
              </div>
            )}
          </div>

          {(isSidebarOpen || isMobile) && (
            <div className="p-4 border-b border-gray-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center mr-3">
                    <span className="text-xs">👤</span>
                  </div>
                  {isSidebarOpen && (
                    <div>
                      <h3 className="text-sm font-medium text-white">Personal account</h3>
                      <p className="text-xs text-gray-400">Free Trial</p>
                    </div>
                  )}
                </div>
                {isSidebarOpen && <ChevronDown size={16} className="text-gray-400" />}
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto">
            <nav className="p-2">
              <ul className="space-y-1">
                {navItems.map((item, index) => (
                  <li key={index}>
                    <a
                      className={`
                        flex items-center px-3 py-2 text-sm rounded-md
                        ${item.name === 'Goals' ? 'bg-gray-700 text-blue-500' : 'hover:bg-gray-700 hover:text-blue-500'}
                        ${!isSidebarOpen && !isMobile ? 'justify-center' : ''}
                      `}
                      href={item.path}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                      </svg>
                      {(isSidebarOpen || isMobile) && <span className="ml-3">{item.name}</span>}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            {(isSidebarOpen || isMobile) && (
              <div className="p-4 border-t border-gray-600">
                <MonthSelector />
                <div className="mt-4 space-y-3">
                  <div>
                    <p className="text-sm text-gray-400">Income</p>
                    <p className="text-lg font-medium text-green-500">${safeSummary.totalIncome.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Expenses</p>
                    <p className="text-lg font-medium text-red-500">${safeSummary.totalExpenses.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Balance</p>
                    <p className="text-lg font-medium text-blue-500">${safeSummary.availableBalance.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            )}

            {(isSidebarOpen || isMobile) && (
              <div className="p-4 border-t border-gray-600">
                <h2 className="text-sm font-medium text-gray-400 mb-3 uppercase">Months</h2>
                <div className="grid grid-cols-3 gap-2">
                  {availableMonths.map((month) => (
                    <button
                      key={month.name}
                      onClick={() => handleMonthSelect(month.index)}
                      disabled={month.isLocked}
                      className={`
                        py-2 px-3 rounded text-center text-sm
                        ${month.index === currentMonthIndex
                          ? 'bg-blue-500 text-white'
                          : month.isLocked
                            ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                            : 'bg-gray-700 text-gray-200 hover:bg-gray-600 hover:text-blue-500'
                        }
                      `}
                    >
                      {month.name}
                      {month.isLocked && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3 w-3 ml-1 inline"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                          />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {(isSidebarOpen || isMobile) && (
              <div className="p-4 border-t border-gray-600">
                <h2 className="text-sm font-medium text-gray-400 mb-3 uppercase">Year Summary - {currentYear}</h2>
                <div className="bg-gray-700 p-3 rounded">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-400">Net Income</span>
                    <span className="text-sm font-medium text-white">$21,458</span>
                  </div>
                  <div className="w-full bg-gray-600 h-1 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-green-500 h-full rounded-full"
                      style={{ width: '65%' }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">65% of yearly target</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;