import { Link, useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../../hooks/useGetCallerUserProfile';
import LoginButton from '../auth/LoginButton';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAuthenticated = !!identity;

  return (
    <header className="bg-navy text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img 
              src="/assets/Fiesta_20260221_085233_0000.jpg" 
              alt="FIESTA Logo" 
              className="h-12 object-contain"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {isAuthenticated && (
              <>
                <Link 
                  to="/guest/events" 
                  className="hover:text-gold transition-colors"
                >
                  My Events
                </Link>
                <Link 
                  to="/guest/organizers" 
                  className="hover:text-gold transition-colors"
                >
                  Find Organizers
                </Link>
                <Link 
                  to="/guest/bookings" 
                  className="hover:text-gold transition-colors"
                >
                  My Bookings
                </Link>
                <Link 
                  to="/organizer/dashboard" 
                  className="hover:text-gold transition-colors"
                >
                  Organizer Dashboard
                </Link>
              </>
            )}
            <LoginButton />
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 space-y-3">
            {isAuthenticated && (
              <>
                <Link 
                  to="/guest/events" 
                  className="block hover:text-gold transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Events
                </Link>
                <Link 
                  to="/guest/organizers" 
                  className="block hover:text-gold transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Find Organizers
                </Link>
                <Link 
                  to="/guest/bookings" 
                  className="block hover:text-gold transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Bookings
                </Link>
                <Link 
                  to="/organizer/dashboard" 
                  className="block hover:text-gold transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Organizer Dashboard
                </Link>
              </>
            )}
            <div className="pt-2">
              <LoginButton />
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
