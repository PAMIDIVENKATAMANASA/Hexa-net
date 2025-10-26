import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';
import { useState, useEffect, useRef } from 'react'; 
import Link from 'next/link'; 
import LoadingSpinner from './LoadingSpinner';

const Layout = ({ children }) => {
  const { user, isAuthenticated, loading, logout } = useAuth(); 
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileMenuRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileMenuRef]);
  
  // Handle loading and authentication states
  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    // This is still important. It prevents the UI from flashing
    // while the redirect (now in dashboard.js) happens.
    return null; 
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Updated Navbar with shadow-md */}
      <nav className="bg-white shadow-md border-b border-gray-200 fixed w-full z-40 top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              {/* Updated Title: bigger, bolder, and with gradient text */}
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-500">
                Campus Net Planner
              </h1>
            </div>
            
            {/* Right side of navbar with new icons and dropdown */}
            <div className="flex items-center space-x-4">
              {/* Notification Bell (dummy) with hover effect */}
              <button className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <span className="sr-only">View notifications</span>
                {/* Bell SVG Icon */}
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341A6.002 6.002 0 006 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>

              {/* Profile dropdown */}
              <div className="relative" ref={profileMenuRef}>
                <div>
                  {/* Updated profile button with transition and hover effect */}
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex text-sm bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all hover:ring-4"
                    id="user-menu-button"
                    aria-expanded={isProfileOpen}
                    aria-haspopup="true"
                  >
                    <span className="sr-only">Open user menu</span>
                    {/* User Icon SVG */}
                    <svg className="h-8 w-8 rounded-full text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                  </button>
                </div>

                {/* Dropdown Menu with animation */}
                <div
                  className={`origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50 transition-all ease-out duration-200
                    ${isProfileOpen ? 'transform opacity-100 scale-100' : 'transform opacity-0 scale-95 pointer-events-none'}`
                  }
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="user-menu-button"
                  tabIndex="-1"
                >
                  <div className="px-4 py-3 border-b">
                    <p className="text-sm font-medium text-gray-900 truncate">Hello, {user?.name}</p>
                    <p className="text-sm text-gray-500 truncate">{user?.email}</p>
                  </div>
                  <div className="py-1" role="none">
                    <Link href="/settings" className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100 transition-colors duration-150" role="menuitem" tabIndex="-1" id="user-menu-item-0">
                      Settings
                    </Link>
                    <Link href="/projects" className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100 transition-colors duration-150" role="menuitem" tabIndex="-1" id="user-menu-item-1">
                      My Projects
                    </Link>
                    <Link href="/dashboard" className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100 transition-colors duration-150" role="menuitem" tabIndex="-1" id="user-menu-item-2">
                      Dashboard
                    </Link>
                  </div>
                  <div className="py-1 border-t" role="none">
                    <button
                      onClick={logout}
                      className="text-gray-700 block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors duration-150"
                      role="menuitem"
                      tabIndex="-1"
                      id="user-menu-item-2"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
      {/* Add padding to main to account for fixed navbar */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 pt-24">
        {children}
      </main>
    </div>
  );
};

export default Layout;

