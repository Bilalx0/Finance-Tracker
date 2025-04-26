import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Signup: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { signup } = useAuth();
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      await signup(username, email, password);
      navigate('/dashboard');
    } catch (err) {
      console.error('Signup error:', err);
      setError('Failed to create account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-dark p-4">
      <div className="max-w-md w-full space-y-8 bg-dark.light p-8 rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">Finance Tracker</h1>
          <h2 className="mt-2 text-xl font-medium text-gray-300">Create your account</h2>
        </div>
        
        {error && (
          <div className="bg-red-500 bg-opacity-20 text-red-500 p-3 rounded-md text-sm">
            {error}
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="sr-only">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border border-gray-700 rounded-md bg-dark focus:outline-none focus:ring-2 focus:ring-primary text-white"
                placeholder="Username"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-700 rounded-md bg-dark focus:outline-none focus:ring-2 focus:ring-primary text-white"
                placeholder="Email address"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-700 rounded-md bg-dark focus:outline-none focus:ring-2 focus:ring-primary text-white"
                placeholder="Password"
              />
            </div>
            
            <div>
              <label htmlFor="confirm-password" className="sr-only">Confirm Password</label>
              <input
                id="confirm-password"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-700 rounded-md bg-dark focus:outline-none focus:ring-2 focus:ring-primary text-white"
                placeholder="Confirm Password"
              />
            </div>
          </div>
          
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? 'Creating account...' : 'Sign up'}
            </button>
          </div>
          
          <div className="text-center text-sm">
            <span className="text-gray-400">Already have an account? </span>
            <Link to="/login" className="font-medium text-primary hover:text-blue-400">
              Sign in
            </Link>
          </div>
        </form>
        
        {/* Demo account note */}
        <div className="mt-6 text-center text-sm text-gray-400">
          <p>For demo purposes, you can use any username, email and password.</p>
        </div>
      </div>
    </div>
  );
};

export default Signup;