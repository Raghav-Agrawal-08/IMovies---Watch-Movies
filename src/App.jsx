import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { CitySelectorModal } from './components/common/CitySelectorModal';
import { AuthModal } from './components/common/AuthModal';

import { HomePage } from './pages/HomePage';
import { MovieDetailsPage } from './pages/MovieDetailsPage';
import { MyTicketsPage } from './pages/MyTicketsPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminPage } from './pages/AdminPage';
import { BookingConfirmationPage } from './pages/BookingConfirmationPage';
import { AuthLandingPage } from './pages/AuthLandingPage';
import { useAuth } from './context/AuthContext';
import { Film } from 'lucide-react';

export function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const { user, loading } = useAuth();

  // Show a sleek loader while checking session
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 dark:bg-[#080c15] text-slate-100">
        <div className="w-12 h-12 rounded-2xl bg-red-600 flex items-center justify-center animate-bounce shadow-lg shadow-red-600/40 mb-4">
          <Film className="w-6 h-6 text-white" />
        </div>
        <p className="text-sm font-semibold tracking-wide text-slate-300">
          Loading IMovies Experience...
        </p>
      </div>
    );
  }

  // Requirement: First-time or unauthenticated users must see the Login/Signup screen first
  if (!user) {
    return <AuthLandingPage />;
  }

  // Authenticated users get full access to the movie booking platform
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-[#080c15] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage searchQuery={searchQuery} />} />
          <Route path="/movie/:id" element={<MovieDetailsPage />} />
          <Route path="/my-tickets" element={<MyTicketsPage />} />
          <Route path="/booking-confirmation/:id" element={<BookingConfirmationPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />

      {/* Global Modals */}
      <CitySelectorModal />
      <AuthModal />
    </div>
  );
}

export default App;
