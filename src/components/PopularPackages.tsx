import React from 'react';
import { POPULAR_PACKAGES, PopularPackage } from '../data/gujaratRoutes';
import { MapPin, Clock, ArrowRight, ShieldCheck, Check } from 'lucide-react';

interface PopularPackagesProps {
  onSelectPackage: (pkg: PopularPackage) => void;
}

export const PopularPackages: React.FC<PopularPackagesProps> = ({ onSelectPackage }) => {
  return (
    <section id="packages-section" className="scroll-mt-20 py-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-wider text-amber-600 bg-amber-100 px-3 py-1 rounded-full border border-amber-200">
            Top Gujarat Routes
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-2">
            Popular Outstation & Pilgrimage Packages
          </h2>
          <p className="text-slate-600 text-sm mt-1">
            Flat, transparent pricing for Gujarat's most popular tourist, temple, and airport circuits.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {POPULAR_PACKAGES.map((pkg) => (
          <div
            key={pkg.id}
            className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group"
          >
            <div>
              {/* Image banner */}
              <div className="relative h-44 overflow-hidden bg-slate-900">
                <img
                  src={pkg.image}
                  alt={pkg.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>

                <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md text-amber-400 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-slate-700">
                  {pkg.days} • {pkg.distance}
                </div>

                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <h3 className="text-base font-extrabold line-clamp-1 leading-snug">
                    {pkg.title}
                  </h3>
                  <div className="flex items-center gap-1 text-[11px] text-slate-300 mt-0.5">
                    <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                    <span className="truncate">{pkg.from} → {pkg.to}</span>
                  </div>
                </div>
              </div>

              {/* Highlights & Rates */}
              <div className="p-4 space-y-3">
                <div className="space-y-1.5">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Tour Highlights
                  </div>
                  <ul className="text-xs text-slate-600 space-y-1">
                    {pkg.highlights.map((h, i) => (
                      <li key={i} className="flex items-center gap-1.5 truncate">
                        <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span className="truncate">{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Price Boxes */}
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-1 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Prime Sedan:</span>
                    <span className="font-extrabold text-slate-900">
                      ₹{pkg.sedanPrice.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Ertiga (6+1):</span>
                    <span className="font-extrabold text-amber-600">
                      ₹{pkg.ertigaPrice.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action button */}
            <div className="p-4 pt-0">
              <button
                type="button"
                onClick={() => onSelectPackage(pkg)}
                className="w-full bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Book This Route</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
