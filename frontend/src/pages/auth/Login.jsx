import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { loginUser } from '../../services/authService';

const Login = () => {
  const navigate = useNavigate();
  const { login, user } = useAuth();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle successful login redirection (only once after login)
  useEffect(() => {
    if (user?.role) {
      if (user.role === 'distributor') {
        navigate('/distributor/dashboard', { replace: true });
      } else if (user.role === 'customer' || user.role === 'customer') {
        navigate('/customers/dashboard', { replace: true });
      } else if (user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      }
      // Optional: toast.success('Welcome back!');
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Please enter email and password');
      toast.error('Please enter email and password');
      setLoading(false);
      return;
    }

    try {
      const result = await login(formData, loginUser);

      if (result.success && result.data) {
        toast.success('Login successful!');
        // No need to set loading false here - redirect will happen via useEffect
      } else {
        const errorMsg = result?.message || 'Invalid email or password';
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Something went wrong';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-8 flex items-center justify-center bg-gradient-to-br from-gray-950 via-slate-900 to-black px-4">
      <div className="w-full max-w-md backdrop-blur-xl bg-white/5 border border-white/10 p-8 rounded-2xl shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-600/20 mb-4">
            <LogIn className="w-7 h-7 text-blue-400" />
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Welcome Back</h2>
          <p className="mt-2 text-gray-400">Login to your wholesale panel</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/40 border border-red-600/50 rounded-xl text-red-300 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div className="relative">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder=" "
              autoComplete="email"
              required
              className="peer w-full p-3.5 bg-gray-800/40 border border-gray-600 text-white rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 outline-none transition-all placeholder-transparent"
            />
            <label className="absolute left-4 -top-2.5 px-1 text-xs text-blue-300 bg-gray-950 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3.5 peer-placeholder-shown:bg-transparent peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-blue-300 peer-focus:bg-gray-950 transition-all">
              Email address
            </label>
          </div>

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder=" "
              autoComplete="current-password"
              required
              className="peer w-full p-3.5 bg-gray-800/40 border border-gray-600 text-white rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 outline-none pr-12 transition-all placeholder-transparent"
            />
            <label className="absolute left-4 -top-2.5 px-1 text-xs text-blue-300 bg-gray-950 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3.5 peer-placeholder-shown:bg-transparent peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-blue-300 peer-focus:bg-gray-950 transition-all">
              Password
            </label>

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`
              w-full py-3.5 px-6 rounded-xl font-medium text-white
              bg-gradient-to-r from-blue-600 to-indigo-600
              hover:from-blue-500 hover:to-indigo-500
              focus:outline-none focus:ring-2 focus:ring-blue-500/40
              transition-all duration-300 shadow-lg shadow-blue-900/30
              disabled:opacity-60 disabled:cursor-not-allowed
              flex items-center justify-center gap-2
            `}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-8 space-y-4">
          <p className="text-center text-sm text-gray-400">
            Forgot your password?{' '}
            <button
              type="button"
              onClick={() => navigate('/auth/forgot-password')}
              className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              Reset here
            </button>
          </p>

          <div className="flex items-center justify-center gap-6 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={() => navigate('/auth/register')}
              className="text-gray-300 hover:text-blue-400 transition font-medium"
            >
              Create new account
            </button>

            <span className="text-gray-600">•</span>

            <button
              type="button"
              onClick={() => navigate('/auth/admin/register')}
              className="text-gray-300 hover:text-blue-400 transition font-medium"
            >
              Admin registration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;