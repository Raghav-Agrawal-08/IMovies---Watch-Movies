import React from 'react';
import { Film, Shield, CreditCard, QrCode, Sparkles } from 'lucide-react';
import { useCity } from '../../context/CityContext';

export const Footer = () => {
  const { cities, selectCity } = useCity();

  return (
    <footer className="mt-24 border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#060910] text-slate-600 dark:text-slate-400 text-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white">
                <Film className="w-4 h-4" />
              </div>
              <span className="text-xl font-black text-slate-900 dark:text-white">
                I<span className="text-red-600">MOVIES</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Experience modern cinematic ticketing with instant seat selection, immersive screen formats (IMAX, Dolby Atmos, 4DX), and multi-rail payment support.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Shield className="w-4 h-4 text-emerald-500" />
              <span>Encrypted 256-bit Secure Checkout</span>
            </div>
          </div>

          {/* Supported Cities */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              Popular Cinema Hubs
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {cities.map((city) => (
                <button
                  key={city}
                  onClick={() => selectCity(city)}
                  className="px-2.5 py-1 text-xs rounded-md bg-slate-100 dark:bg-slate-900/80 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-slate-800 transition"
                >
                  {city}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Partners & QR Info */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              Payment Rails &amp; Verification
            </h4>
            <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
              <li className="flex items-center gap-2">
                <QrCode className="w-4 h-4 text-purple-500" />
                <span>PhonePe UPI QR with 12-digit UTR Verification</span>
              </li>
              <li className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-sky-500" />
                <span>Razorpay Gateway (Cards, Netbanking &amp; Wallets)</span>
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Instant Demo Sandbox Mode (For Testing)</span>
              </li>
            </ul>
          </div>

          {/* Technical Compliance & Notice */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              Transparency &amp; Disclaimers
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Popularity charts and ratings are curated sample datasets for demonstration. Scanning static UPI QR codes does not automatically push bank settlements without server UTR or webhook verification.
            </p>
            <div className="pt-2 text-[11px] text-slate-400 dark:text-slate-500">
              Built with React, Express, and MongoDB.
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} IMovies Entertainment Pvt Ltd. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>Privacy Policy</span>
            <span>•</span>
            <span>Terms of Service</span>
            <span>•</span>
            <span>Security Rules</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
