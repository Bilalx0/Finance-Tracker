import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { FinanceProvider } from './contexts/FinanceContext';
import MainLayout from './components/MainLayout';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Targets from './pages/Targets';
import './App.css';

function App() {
  return (
    <FinanceProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="targets" element={<Targets />} />
            <Route path="spreadsheet" element={<Transactions />} /> {/* Using Transactions as a placeholder for Spreadsheet */}
            <Route path="month/:id" element={<Dashboard />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </Router>
    </FinanceProvider>
  );
}

export default App;
