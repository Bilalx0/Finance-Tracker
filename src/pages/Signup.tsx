import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import imageCompression from 'browser-image-compression';

const Signup: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qualityWarning, setQualityWarning] = useState<string | null>(null);

  const { signup, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Signup page - Auth state:', { isAuthenticated, isLoading });
    if (!isLoading && isAuthenticated) {
      console.log('Redirecting to /dashboard from /signup');
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      console.log('Selected file:', file.name, file.size, file.type);

      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file (PNG or JPEG)');
        setAvatar(null);
        return;
      }

      try {
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);
        img.src = objectUrl;
        await new Promise((resolve) => {
          img.onload = resolve;
        });
        const originalWidth = img.width;
        const originalHeight = img.height;
        URL.revokeObjectURL(objectUrl);

        const options = {
          maxSizeMB: 4.5,
          maxWidthOrHeight: 1024,
          useWebWorker: true,
          maxIteration: 20,
        };
        console.log('Starting compression for file:', file.name, file.size);
        const compressedFile = await imageCompression(file, options);
        console.log('Compressed file:', compressedFile.name, compressedFile.size);

        if (compressedFile.size > 5 * 1024 * 1024) {
          setError('Image cannot be compressed below 5MB. Please try a smaller image.');
          setAvatar(null);
          return;
        }

        const compressedImg = new Image();
        const compressedUrl = URL.createObjectURL(compressedFile);
        compressedImg.src = compressedUrl;
        await new Promise((resolve) => {
          compressedImg.onload = resolve;
        });
        const compressedWidth = compressedImg.width;
        const compressedHeight = compressedImg.height;
        URL.revokeObjectURL(compressedUrl);

        const originalSizeMB = file.size / (1024 * 1024);
        const compressedSizeMB = compressedFile.size / (1024 * 1024);
        let warning = null;
        if (
          compressedWidth < originalWidth * 0.75 ||
          compressedHeight < originalHeight * 0.75 ||
          compressedSizeMB < originalSizeMB * 0.5
        ) {
          warning = `Image quality reduced: Resolution from ${originalWidth}x${originalHeight} to ${compressedWidth}x${compressedHeight}, Size from ${originalSizeMB.toFixed(2)}MB to ${compressedSizeMB.toFixed(2)}MB`;
        }

        setAvatar(compressedFile);
        setQualityWarning(warning);
        setError(null);
      } catch (err) {
        console.error('Compression error:', err);
        setError('Failed to compress image. Please try a different file.');
        setAvatar(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('Form state:', { username, email, password: '****', confirmPassword: '****', avatar: avatar?.name });

    if (!username || !email || !password || !confirmPassword || !avatar) {
      setError('Please fill in all fields, including an avatar image');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      await signup(username, email, password, avatar);
      console.log('Signup successful, redirecting to /dashboard');
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      console.error('Signup error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to create account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    console.log('Signup page - Showing loading spinner');
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark p-4 font-josefin">
      <div className="max-w-md w-full space-y-8 bg-dark.light p-8 rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">Finance Tracker</h1>
          <h2 className="mt-2 text-xl font-medium text-gray-300">Create your account</h2>
        </div>

        {error && (
          <div className="bg-red-500 bg-opacity-20 text-white p-3 rounded-md text-sm">
            {error}
          </div>
        )}

        {qualityWarning && (
          <div className="bg-yellow-500 bg-opacity-20 text-white p-3 rounded-md text-sm">
            {qualityWarning}
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

            <div>
              <label htmlFor="avatar" className="sr-only">Avatar</label>
              <input
                id="avatar"
                name="avatar"
                type="file"
                accept="image/png,image/jpeg"
                required
                onChange={handleAvatarChange}
                className="w-full px-3 py-2 border border-gray-700 rounded-md bg-dark focus:outline-none focus:ring-2 focus:ring-primary text-white"
              />
              {avatar && <p className="text-sm text-gray-400 mt-1">Selected: {avatar.name}</p>}
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

        <div className="mt-6 text-center text-sm text-gray-400">
          <p>For demo purposes, you can use any username, email, password, and image.</p>
        </div>
      </div>
    </div>
  );
};

export default Signup;