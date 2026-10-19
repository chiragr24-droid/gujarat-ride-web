import React from 'react';
import { CAR_OPTIONS, CarId } from '../data/gujaratRoutes';
import { Users, Briefcase, Wind, CheckCircle2, Shield, Fuel } from 'lucide-react';

interface FleetSectionProps {
  onSelectCar: (carId: CarId) => void;
}

export const FleetSection: React.FC<FleetSectionProps> = ({ onSelectCar }) => {
  return (
    <section id="fleet-section" className="scroll-mt-20 py-12">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="text-xs font-extrabold uppercase tracking-wider text-amber-600 bg-amber-100 px-3 py-1 rounded-full border border-amber-200">
          Our Verified Fleet
        </span>
        <h2 className="text-3xl font-extrabold text-slate-900 mt-3">
          Choose the Perfect Cab for Your Gujarat Journey
        </h2>
        <p className="text-slate-600 text-sm mt-2">
          Strictly maintained vehicles with clean interiors, experienced polite drivers, and 100%
          transparent billing.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {CAR_OPTIONS.map((car) => (
          <div
            key={car.id}
            className="bg-white rounded-3xl border border-slate-200 shadow-md hover:shadow-xl transition-all overflow-hidden flex flex-col justify-between"
          >
            {/* Top Image & Badge */}
            <div className="relative h-48 sm:h-56 overflow-hidden bg-slate-900">
              <img
                src={car.image}
                alt={car.name}
                className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>

              {/* Price Tag Overlay */}
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-white">
                <div>
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                    {car.badge || 'Verified Cab'}
                  </span>
                  <h3 className="text-2xl font-black">{car.name}</h3>
                  <p className="text-xs text-slate-300">{car.category}</p>
                </div>

                <div className="text-right bg-slate-950/80 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-700">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Pricing</div>
                  <div className="text-sm sm:text-base font-black text-amber-400">
                    All-Inclusive
                  </div>
                </div>
              </div>
            </div>

            {/* Vehicle Details */}
            <div className="p-6 space-y-6 flex-1 flex flex-col justify-between">
              <div>
                {/* Specifications Pills */}
                <div className="grid grid-cols-3 gap-2 pb-4 border-b border-slate-100 text-center">
                  <div className="bg-slate-50 p-2.5 rounded-xl">
                    <Users className="w-4 h-4 text-slate-600 mx-auto mb-1" />
                    <span className="text-xs font-bold text-slate-800 block">{car.capacity}</span>
                    <span className="text-[10px] text-slate-400">Seating</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl">
                    <Briefcase className="w-4 h-4 text-slate-600 mx-auto mb-1" />
                    <span className="text-xs font-bold text-slate-800 block">{car.luggage}</span>
                    <span className="text-[10px] text-slate-400">Luggage</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl">
                    <Wind className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                    <span className="text-xs font-bold text-slate-800 block">{car.ac}</span>
                    <span className="text-[10px] text-slate-400">Air Conditioning</span>
                  </div>
                </div>

                {/* Models Included */}
                <div className="py-3 text-xs text-slate-600">
                  <strong className="text-slate-800 font-semibold">Available Models:</strong> {car.models}
                </div>

                {/* Features List */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Included Amenities & Features:
                  </div>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                    {car.features.map((feat, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Pricing terms bar */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Trip Service:</span>
                  <span className="font-bold text-slate-900">One Way Drop & Round Trip Tours</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Driver Bhatta:</span>
                  <span className="font-bold text-slate-900">Included in Round Trip Quote</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Billing Policy:</span>
                  <span className="font-bold text-slate-900">100% Transparent Final Fare (No Hidden Charges)</span>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => {
                  onSelectCar(car.id);
                  const el = document.getElementById('booking-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-extrabold py-3.5 px-4 rounded-xl text-sm transition-all shadow-md shadow-amber-500/10 cursor-pointer text-center"
              >
                Calculate Fare for {car.name} →
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
