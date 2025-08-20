import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMenu, FiX, FiHome, FiImage, FiLogIn, FiUserPlus, FiLogOut } from 'react-icons/fi';

export default function NavBar() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isOpen && !e.target.closest('.mobile-menu') && !e.target.closest('.mobile-menu-button')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const navItemClass = ({ isActive }) => 
    `flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200 ${
      isActive ? 'text-blue-600 font-semibold' : ''
    }`;

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link 
              to="/" 
              className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent"
            >
              LastSeen
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {user ? (
              <>
                <NavLink to="/dashboard" className={navItemClass}>
                  <FiHome className="w-5 h-5" />
                  <span>Dashboard</span>
                </NavLink>
                <NavLink to="/gallery" className={navItemClass}>
                  <FiImage className="w-5 h-5" />
                  <span>My Gallery</span>
                </NavLink>
                <button 
                  onClick={logout} 
                  className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                >
                  <FiLogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className={navItemClass}>
                  <FiLogIn className="w-5 h-5" />
                  <span>Login</span>
                </NavLink>
                <NavLink 
                  to="/register" 
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <FiUserPlus className="w-5 h-5" />
                  <span>Sign Up</span>
                </NavLink>
              </>
            )}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 focus:outline-none transition-colors duration-200 mobile-menu-button"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <FiX className="block h-6 w-6" />
              ) : (
                <FiMenu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div 
        className={`md:hidden mobile-menu transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white">
          {user ? (
            <>
              <NavLink to="/dashboard" className={navItemClass}>
                <FiHome className="w-5 h-5" />
                <span>Dashboard</span>
              </NavLink>
              <NavLink to="/gallery" className={navItemClass}>
                <FiImage className="w-5 h-5" />
                <span>My Gallery</span>
              </NavLink>
              <button 
                onClick={logout} 
                className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 flex items-center gap-2"
              >
                <FiLogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={navItemClass}>
                <FiLogIn className="w-5 h-5" />
                <span>Login</span>
              </NavLink>
              <NavLink 
                to="/register" 
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <FiUserPlus className="w-5 h-5" />
                <span>Create Account</span>
              </NavLink>
            </>
          )}
        </div>
      </div>
    </header>
  )
}