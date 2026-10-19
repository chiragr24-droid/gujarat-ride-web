import React from 'react';
import { Car, Phone, MessageCircle, MapPin, Mail, ShieldCheck } from 'lucide-react';
import {
  openWhatsApp,
  getUniversalWhatsAppLink,
  DEFAULT_BUSINESS_PHONE
} from '../utils/whatsappHelper';

export const Footer: React.FC = () => {
  const footerMessage = 'Hello Riddhi Travels, I want to book a cab with GujaratRide.';
  const footerWaUrl = getUniversalWhatsAppLink(DEFAULT_BUSINESS_PHONE, footerMessage);

  const handleFooterWhatsApp = (e: React.MouseEvent) => {
    e.preventDefault();
    openWhatsApp(DEFAULT_BUSINESS_PHONE, footerMessage);
  };

  return (
    <footer className="bg-slate-950 text-slate-300 pt-14 pb-24 sm:pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-black">
                <Car className="w-5 h-5 text-slate-950 stroke-[2.2]" />
              </div>
              <div>
                <span className="text-xl font-extrabold text-white tracking-tight">
                  Gujarat<span className="text-amber-500">Ride</span>
                </span>
                <span className="text-xs text-slate-400 block font-medium">by Riddhi Travels</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              A Unit of Riddhi Travels. Gujarat's trusted outstation taxi service. Providing transparent Sedan, Ertiga, and
              Innova cab rentals across Ahmedabad, Vadodara, Surat, Rajkot, and all Gujarat
              pilgrimage & tourist circuits.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>Commercial RTO Registered & Insured Cabs</span>
            </div>
          </div>

          {/* Col 2: Popular Routes */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Popular Routes
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>Ahmedabad to Statue of Unity (Kevadia)</li>
              <li>Ahmedabad to Vadodara / Surat</li>
              <li>Dwarka & Somnath Temple Tour</li>
              <li>Sasan Gir Lion Sanctuary Cab</li>
              <li>Ahmedabad Airport (AMD) Pickup & Drop</li>
              <li>Rann of Kutch & Bhuj Tour</li>
              <li>Vadodara to Mumbai International Airport</li>
            </ul>
          </div>

          {/* Col 3: Fleet & Vehicles */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Our Fleet
            </h4>
            <div className="space-y-2.5 text-xs text-slate-400">
              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                <div className="font-bold text-white text-xs">Prime Sedan (4+1)</div>
                <div className="text-amber-400 font-semibold">Dzire / Etios / Aura</div>
                <div className="text-[11px] text-slate-400">Chilled AC • Professional Chauffeur</div>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                <div className="font-bold text-white text-xs">Maruti Suzuki Ertiga (6+1)</div>
                <div className="text-amber-400 font-semibold">MUV 7-Seater</div>
                <div className="text-[11px] text-slate-400">Dual AC & Extra Luggage Space</div>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                <div className="font-bold text-white text-xs">Toyota Innova & Crysta (7+1)</div>
                <div className="text-amber-400 font-semibold">Executive Luxury MUV</div>
                <div className="text-[11px] text-slate-400">Maximum Comfort for Family & Tours</div>
              </div>
            </div>
          </div>

          {/* Col 4: Contact & WhatsApp */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Dispatch & Helpline
            </h4>
            <div className="space-y-2 text-xs">
              <a
                href="tel:+919773203109"
                className="flex items-center gap-2.5 text-slate-300 hover:text-amber-400 transition-colors"
              >
                <Phone className="w-4 h-4 text-emerald-500" />
                <span>+91 9773203109 (24x7)</span>
              </a>
              <a
                href={footerWaUrl}
                onClick={handleFooterWhatsApp}
                className="flex items-center gap-2.5 text-slate-300 hover:text-emerald-400 transition-colors cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 text-emerald-500" />
                <span>WhatsApp: +91 9773203109</span>
              </a>
              <div className="flex items-start gap-2.5 text-slate-400">
                <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>
                  Atladra<br />
                  Vadodara, Gujarat – 391410
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright & attribution */}
        <div className="pt-6 border-t border-slate-800/80 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} GujaratRide by Riddhi Travels. All rights reserved. Clean Cabs • Best Rates.</p>
          <p className="text-[11px] text-slate-400">
            Powered by Google Maps Platform Routes Integration
          </p>
        </div>
      </div>
    </footer>
  );
};
