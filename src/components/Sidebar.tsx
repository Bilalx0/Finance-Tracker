import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useFinance } from '../contexts/FinanceContext';
import MonthSelector from './MonthSelector';

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
  const location = useLocation();
  const currentPath = location.pathname;
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  const { 
    currentMonth, 
    currentYear,
    isMonthLocked,
    setMonth,
    summary 
  } = useFinance();
  
  // Current month index
  const currentMonthIndex = monthNameToIndex[currentMonth];
  
  // Determine which months to show (past and current months only)
  const availableMonths = monthsAbbr.map((month, index) => {
    const isLocked = isMonthLocked(index, currentYear);
    return {
      name: month,
      index,
      isLocked
    };
  });
  
  // Function to handle month selection
  const handleMonthSelect = (monthIndex: number) => {
    if (!isMonthLocked(monthIndex, currentYear)) {
      setMonth(monthIndex, currentYear);
      setIsMobileOpen(false);
    }
  };
  
  return (
    <>
      {/* Mobile toggle button - visible on small screens */}
      <button 
        className="lg:hidden fixed bottom-4 left-4 z-50 bg-primary text-white p-3 rounded-full shadow-lg"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        )}
      </button>
      
      <aside className={`bg-dark w-64 flex flex-col h-screen border-r border-gray-800 ${isMobileOpen ? 'fixed inset-y-0 left-0 z-40' : 'hidden lg:flex'}`}>
        <div className="p-4 flex flex-col items-center border-b border-gray-800">
          <div className="w-12 h-12 bg-dark.light rounded-full flex items-center justify-center mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-lg font-medium text-white">Finance Tracker</h1>
          <p className="text-sm text-gray-400 mt-1">Monthly Overview</p>
        </div>
        
        <div className="p-4 border-b border-gray-800">
          <MonthSelector />
          
          {/* Monthly Finance Overview */}
          <div className="mt-4 space-y-3">
            <div>
              <p className="text-sm text-gray-400">Income</p>
              <p className="text-lg font-medium text-green-500">${summary.totalIncome.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Expenses</p>
              <p className="text-lg font-medium text-red-500">${summary.totalExpenses.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Balance</p>
              <p className="text-lg font-medium text-blue-400">${summary.availableBalance.toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
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
                    ? 'bg-primary text-white' 
                    : month.isLocked 
                      ? 'bg-gray-800 text-gray-600 cursor-not-allowed' 
                      : 'bg-dark.light text-gray-300 hover:bg-gray-700'
                  }
                `}
              >
                {month.name}
                {month.isLocked && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                )}
              </button>
            ))}
          </div>
          
          {/* Yearly Summary */}
          <div className="mt-8">
            <h2 className="text-sm font-medium text-gray-400 mb-3 uppercase">Year Summary - {currentYear}</h2>
            <div className="bg-dark.light p-3 rounded">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">Net Income</span>
                <span className="text-sm font-medium text-white">$21,458</span>
              </div>
              <div className="w-full bg-gray-700 h-1 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-full rounded-full" 
                  style={{ width: '65%' }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">65% of yearly target</p>
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-800 flex justify-between items-center">
          <span className="text-sm text-gray-400">{currentYear}</span>
          <button className="w-10 h-10 bg-dark.light rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </aside>
      
      {/* Mobile sidebar backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;