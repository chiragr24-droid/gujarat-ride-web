import React from 'react';
import { Phone, Car } from 'lucide-react';

interface NavbarProps {
  onBookClick?: () => void;
  onFleetClick?: () => void;
  onPackagesClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onBookClick,
  onFleetClick,
  onPackagesClick
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center shadow-md shadow-amber-500/20 text-slate-950 font-black shrink-0">
            <Car className="w-6 h-6 text-slate-950 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 leading-tight">
                Gujarat<span className="text-amber-500">Ride</span>
              </span>
              <span className="text-xs sm:text-sm font-semibold text-slate-600 leading-tight">
                by <span className="font-bold text-slate-900">Riddhi Travels</span>
              </span>
              <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded border border-amber-200">
                TAXI
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium -mt-0.5 hidden sm:block">
              A Unit of Riddhi Travels • Outstation & Airport Cab Services Across Gujarat
            </p>
          </div>
        </div>

        {/* Center Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600">
          <button
            onClick={onBookClick}
            className="hover:text-amber-600 transition-colors py-1 cursor-pointer"
          >
            Book Cab
          </button>
          <button
            onClick={onFleetClick}
            className="hover:text-amber-600 transition-colors py-1 cursor-pointer"
          >
            Our Fleet
          </button>
          <button
            onClick={onPackagesClick}
            className="hover:text-amber-600 transition-colors py-1 cursor-pointer"
          >
            Tour Packages
          </button>
          <a
            href="#why-us"
            className="hover:text-amber-600 transition-colors py-1"
          >
            Why Us
          </a>
          <a
            href="#faq"
            className="hover:text-amber-600 transition-colors py-1"
          >
            FAQs
          </a>
        </nav>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Call */}
          <a
            href="tel:+919773203109"
            className="hidden sm:inline-flex items-center gap-1.5 text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl text-xs font-bold transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-600" />
            <span>+91 9773203109</span>
          </a>

          {/* Prominent Call Now Button */}
          <a
            href="tel:+919773203109"
            className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 transition-transform active:scale-95 cursor-pointer"
          >
            <Phone className="w-4 h-4 fill-white" />
            <span>Call Now</span>
          </a>

          {/* Book Now Button for mobile header */}
          <button
            onClick={onBookClick}
            className="md:hidden bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-2 rounded-xl text-xs transition-colors"
          >
            Book
          </button>
        </div>
      </div>
    </header>
  );
};
