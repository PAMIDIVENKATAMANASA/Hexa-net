import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { Share2 } from 'lucide-react';
import LoadingButton from '../components/LoadingButton'; // <-- This is used

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const { login, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, loading, router]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- UPDATED handleSubmit ---
  // It no longer redirects. It just returns true (success) or false (failure).
  const handleSubmit = async (e) => {
    try {
      const result = await login(formData);
      if (result.success) {
        toast.success('Login successful!');
        return true; // <-- RETURN TRUE
      } else {
        toast.error(result.message);
        return false; // <-- RETURN FALSE
      }
    } catch (error) {
      toast.error('An error occurred during login');
      return false; // <-- RETURN FALSE
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="flex justify-center items-center mb-6">
          <Link href="/" className="flex items-center space-x-3">
            <Share2 className="h-10 w-10 text-primary-600" />
            <span className="text-3xl font-bold text-slate-800 tracking-tight">CampusNet Planner</span>
          </Link>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full space-y-6">
          <div>
            <h2 className="text-center text-3xl font-extrabold text-gray-900">Sign in</h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Or{' '}
              <Link href="/register" className="font-medium text-primary-600 hover:text-primary-500">
                create a new account
              </Link>
            </p>
          </div>
          
          {/* REMOVED onSubmit from form */}
          <form className="space-y-6"> 
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-gray-900"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-gray-900"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div>
              {/* --- UPDATED LoadingButton --- */}
              <LoadingButton
                type="submit"
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                loadingText="Signing in..."
                onClick={handleSubmit}
                onSuccessRedirectTo="/dashboard" // <-- PASS THE REDIRECT PATH
              >
                Sign in
              </LoadingButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

