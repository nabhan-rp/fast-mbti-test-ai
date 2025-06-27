
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { APP_NAME } from '../constants';
import { UserCircleIcon, ArrowLeftOnRectangleIcon, SparklesIcon } from './icons/HeroIcons'; 

export const Navbar: React.FC = () => {
  const { currentUser, logout, loginWithGoogle, loginWithEmail } = useAuth();
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true); 

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await loginWithEmail(email, password); 
      } else {
        await loginWithEmail(email, password); // Mock signup = login
      }
      setShowAuthModal(false);
      setEmail('');
      setPassword('');
    } catch (error) {
      console.error("Auth action failed", error);
      alert(`Auth action failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  };


  return (
    <>
      <nav className="bg-bground-light shadow-lg sticky top-0 z-50 no-print">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            <Link to="/" className="flex items-center space-x-2 text-2xl font-bold text-content hover:text-primary transition-colors duration-300 group">
              <SparklesIcon className="h-8 w-8 text-accent group-hover:animate-pulse-थोड़ा" />
              <span className="text-shadow-accent-glow group-hover:text-primary transition-colors">{APP_NAME}</span>
            </Link>
            <div className="flex items-center space-x-4 md:space-x-6">
              <Link to="/" className="text-content-muted hover:text-content transition-colors duration-300 font-medium">Home</Link>
              {currentUser && (
                <Link to="/dashboard" className="text-content-muted hover:text-content transition-colors duration-300 font-medium">Dashboard</Link>
              )}
              {currentUser ? (
                <div className="flex items-center space-x-3">
                  <span className="text-content-muted text-sm hidden sm:block">{currentUser.displayName || currentUser.email}</span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 bg-pink-600 hover:bg-pink-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300 shadow-md hover:shadow-lg"
                  >
                    <ArrowLeftOnRectangleIcon className="h-5 w-5" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="flex items-center space-x-2 bg-secondary hover:bg-blue-700 text-white font-bold py-2.5 px-5 rounded-lg transition-all duration-300 shadow-lg hover:shadow-secondary/50 transform hover:scale-105"
                >
                  <UserCircleIcon className="h-5 w-5" />
                  <span>Login / Sign Up</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {showAuthModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-fade-in no-print">
          <div className="bg-bground-light p-8 rounded-xl shadow-2xl w-full max-w-md relative animate-slide-up border border-neutral/30">
            <button 
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-content-muted hover:text-content text-3xl transition-colors"
            >&times;</button>
            <h2 className="text-3xl font-display font-bold text-center mb-6 text-primary">{isLogin ? 'Welcome Back!' : 'Create Account'}</h2>
            
            <form onSubmit={handleAuthAction} className="space-y-6">
              {!isLogin && (
                 <div>
                    <label htmlFor="name" className="block text-sm font-medium text-content-muted mb-1">Full Name (Optional)</label>
                    <input type="text" name="name" id="name" className="w-full px-4 py-3 bg-bground border border-neutral/50 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-content placeholder-content-muted" placeholder="Your Name" />
                </div>
              )}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-content-muted mb-1">Email Address</label>
                <input type="email" name="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-3 bg-bground border border-neutral/50 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-content placeholder-content-muted" placeholder="you@example.com" />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-content-muted mb-1">Password</label>
                <input type="password" name="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-4 py-3 bg-bground border border-neutral/50 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-content placeholder-content-muted" placeholder="••••••••" />
              </div>
              <button type="submit" className="w-full bg-primary hover:bg-pink-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-300 text-lg shadow-md hover:shadow-lg">
                {isLogin ? 'Log In' : 'Sign Up'}
              </button>
            </form>
            <div className="my-4 flex items-center before:flex-1 before:border-t before:border-neutral/50 after:flex-1 after:border-t after:border-neutral/50">
                <p className="mx-4 mb-0 text-center font-semibold text-content-muted">OR</p>
            </div>
            <div className="text-center">
              <button
                onClick={async () => {
                    try {
                        await loginWithGoogle();
                        setShowAuthModal(false);
                    } catch (error) {
                        alert(`Google login failed: ${error instanceof Error ? error.message : String(error)}`)
                    }
                }}
                className="w-full bg-white hover:bg-gray-200 text-gray-800 font-semibold py-3 px-4 border border-gray-300 rounded-lg shadow-sm transition-colors duration-300 flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.43 4.55H24v8.51h12.8c-.57 3.32-2.31 6.12-4.79 7.99l7.48 5.82C43.08 42.01 47 34.04 47 24.55z"></path><path fill="#34A853" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path><path fill="#FBBC05" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.48-5.82c-2.17 1.45-4.96 2.31-8.41 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path><path fill="none" d="M0 0h48v48H0z"></path></svg>
                <span>Sign in with Google</span>
              </button>
              <button 
                onClick={() => setIsLogin(!isLogin)} 
                className="mt-6 text-sm text-accent hover:text-yellow-300"
              >
                {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Log In"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};