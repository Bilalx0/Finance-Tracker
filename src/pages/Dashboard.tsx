import React, { useState } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import StatsCard from '../components/StatsCard';
import LineChart from '../components/LineChart';
import PieChart from '../components/PieChart';

const Dashboard: React.FC = () => {
  const { transactions, summary } = useFinance();
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');
  
  // Generate dummy chart data for demonstration
  const lineChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Income',
        data: [12500, 13200, 15000, 14500, 13800, 15200, 16000, 15600, 16200, 16800, 17500, 18000],
        borderColor: '#10b981', // green
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Expenses',
        data: [8500, 9200, 8800, 9500, 9100, 9800, 10200, 9700, 10500, 10200, 10800, 11000],
        borderColor: '#ef4444', // red
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };
  
  // Income by category pie chart
  const incomeCategories = transactions
    .filter(t => t.type === 'income')
    .reduce((acc: Record<string, number>, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});
    
  const incomeChartData = {
    labels: Object.keys(incomeCategories),
    datasets: [{
      data: Object.values(incomeCategories),
      backgroundColor: [
        '#10b981', // green
        '#3b82f6', // blue
        '#8b5cf6', // purple
        '#f59e0b', // amber
        '#ec4899', // pink
        '#6b7280'  // gray
      ],
      borderWidth: 1,
    }]
  };
  
  // Expenses by category pie chart
  const expenseCategories = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc: Record<string, number>, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});
    
  const expenseChartData = {
    labels: Object.keys(expenseCategories),
    datasets: [{
      data: Object.values(expenseCategories),
      backgroundColor: [
        '#7c3aed', // violet
        '#ef4444', // red
        '#f97316', // orange
        '#0ea5e9', // sky
        '#84cc16', // lime
        '#14b8a6', // teal
        '#ec4899', // pink
        '#8b5cf6', // purple
        '#64748b', // slate
        '#6b7280'  // gray
      ],
      borderWidth: 1,
    }]
  };
  
  // Assets chart
  const assetsData = {
    labels: ['Gold', 'Stocks', 'Land', 'Warehouse'],
    datasets: [{
      data: [15700, 22500, 120000, 135000],
      backgroundColor: [
        '#f59e0b', // amber
        '#ef4444', // red
        '#10b981', // green
        '#8b5cf6'  // purple
      ],
      borderWidth: 1,
    }]
  };
  
  // Latest transactions
  const latestTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);
  
  return (
    <div className="flex-1 overflow-y-auto p-3 sm:p-6">
      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-3 sm:mb-6">
        <StatsCard
          title="Total Income"
          value={summary.totalIncome}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          trend={{ value: 13, isPositive: true }}
        />
        
        <StatsCard
          title="Total Expenses"
          value={summary.totalExpenses}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          }
          trend={{ value: 8, isPositive: false }}
        />
        
        <StatsCard
          title="Available Balance"
          value={summary.availableBalance}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
            </svg>
          }
          trend={{ value: 5, isPositive: true }}
        />
        
        <StatsCard
          title="Net Worth"
          value={summary.netWorth}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
          trend={{ value: 7, isPositive: true }}
        />
      </div>
      
      {/* Income and Expense Chart */}
      <div className="card mb-3 sm:mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <h2 className="text-xl font-semibold">Income & Expenses</h2>
          <div className="bg-dark rounded-lg flex flex-wrap w-full sm:w-auto">
            <button 
              className={`px-3 py-1 rounded-md text-sm flex-1 sm:flex-initial ${selectedPeriod === 'day' ? 'bg-dark.light' : ''}`}
              onClick={() => setSelectedPeriod('day')}
            >
              Day
            </button>
            <button 
              className={`px-3 py-1 rounded-md text-sm flex-1 sm:flex-initial ${selectedPeriod === 'week' ? 'bg-dark.light' : ''}`}
              onClick={() => setSelectedPeriod('week')}
            >
              Week
            </button>
            <button 
              className={`px-3 py-1 rounded-md text-sm flex-1 sm:flex-initial ${selectedPeriod === 'month' ? 'bg-dark.light' : ''}`}
              onClick={() => setSelectedPeriod('month')}
            >
              Month
            </button>
            <button 
              className={`px-3 py-1 rounded-md text-sm flex-1 sm:flex-initial ${selectedPeriod === 'year' ? 'bg-dark.light' : ''}`}
              onClick={() => setSelectedPeriod('year')}
            >
              Year
            </button>
          </div>
        </div>
        
        <LineChart data={lineChartData} height={300} />
      </div>
      
      {/* Categories and Assets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 mb-3 sm:mb-6">
        {/* Income Categories */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Income Categories</h2>
          <div className="relative">
            <PieChart data={incomeChartData} height={220} />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-sm text-gray-400">Total</p>
                <p className="text-xl font-semibold">${summary.totalIncome.toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 space-y-2">
            {Object.entries(incomeCategories).map(([category, amount], index) => (
              <div key={category} className="flex justify-between items-center">
                <div className="flex items-center">
                  <span 
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: incomeChartData.datasets[0].backgroundColor[index % incomeChartData.datasets[0].backgroundColor.length] }}
                  ></span>
                  <span className="text-sm">{category}</span>
                </div>
                <span className="text-sm">${amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Expense Categories */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Expense Categories</h2>
          <div className="relative">
            <PieChart data={expenseChartData} height={220} />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-sm text-gray-400">Total</p>
                <p className="text-xl font-semibold">${summary.totalExpenses.toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 space-y-2 overflow-y-auto max-h-32 pr-1">
            {Object.entries(expenseCategories).map(([category, amount], index) => (
              <div key={category} className="flex justify-between items-center">
                <div className="flex items-center">
                  <span 
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: expenseChartData.datasets[0].backgroundColor[index % expenseChartData.datasets[0].backgroundColor.length] }}
                  ></span>
                  <span className="text-sm">{category}</span>
                </div>
                <span className="text-sm">${amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Assets */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Asset Allocation</h2>
          <div className="relative">
            <PieChart data={assetsData} height={220} />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-sm text-gray-400">Total</p>
                <p className="text-xl font-semibold">${assetsData.datasets[0].data.reduce((a, b) => a + b, 0).toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 space-y-2">
            {assetsData.labels.map((label, index) => (
              <div key={label} className="flex justify-between items-center">
                <div className="flex items-center">
                  <span 
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: assetsData.datasets[0].backgroundColor[index] }}
                  ></span>
                  <span className="text-sm">{label}</span>
                </div>
                <span className="text-sm">${assetsData.datasets[0].data[index].toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Latest Transactions */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Latest Transactions</h2>
          <button className="text-primary hover:text-blue-700 text-sm font-medium">View All</button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-400 text-sm">
                <th className="pb-3">Type</th>
                <th className="pb-3">Category</th>
                <th className="pb-3 hidden sm:table-cell">Date</th>
                <th className="pb-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {latestTransactions.map(transaction => (
                <tr key={transaction.id} className="border-t border-gray-800">
                  <td className="py-3">
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full ${transaction.type === 'income' ? 'bg-green-500 bg-opacity-20' : 'bg-red-500 bg-opacity-20'} flex items-center justify-center mr-2`}>
                        {transaction.type === 'income' ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                          </svg>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm sm:text-base truncate max-w-[100px] sm:max-w-[200px]">
                          {transaction.description || transaction.category}
                        </span>
                        <span className="text-xs text-gray-400 sm:hidden">
                          {new Date(transaction.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-gray-400 text-sm">{transaction.category}</td>
                  <td className="py-3 text-gray-400 hidden sm:table-cell">{new Date(transaction.date).toLocaleDateString()}</td>
                  <td className={`py-3 text-right font-medium ${transaction.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                    {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;