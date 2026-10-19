/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';
import { Navbar } from './components/Navbar';
import { QuotaBanner } from './components/QuotaBanner';
import { BookingForm, BookingRecord } from './components/BookingForm';
import { BookingModal } from './components/BookingModal';
import { FleetSection } from './components/FleetSection';
import { PopularPackages } from './components/PopularPackages';
import { WhyChooseUs } from './components/WhyChooseUs';
import { FAQSection } from './components/FAQSection';
import { Footer } from './components/Footer';
import { WhatsAppFloat } from './components/WhatsAppFloat';
import { PopularPackage, CarId } from './data/gujaratRoutes';
import { ShieldCheck, Star, Award, MapPin, CheckCircle2, Sparkles, Navigation, Phone, MessageCircle } from 'lucide-react';

export default function App() {
  const [activeBooking, setActiveBooking] = useState<BookingRecord | null>(null);
  const [selectedRoutePackage, setSelectedRoutePackage] = useState<{
    from: string;
    to: string;
    car?: CarId;
  } | null>(null);

  const scrollToBooking = () => {
    const el = document.getElementById('booking-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToFleet = () => {
    const el = document.getElementById('fleet-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToPackages = () => {
    const el = document.getElementById('packages-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSelectPackage = (pkg: PopularPackage) => {
    setSelectedRoutePackage({
      from: pkg.from.split('/')[0].trim(),
      to: pkg.to.split(',')[0].trim()
    });
    scrollToBooking();
  };

  const handleSelectFleetCar = (carId: CarId) => {
    setSelectedRoutePackage((prev) => ({
      from: prev?.from || '',
      to: prev?.to || '',
      car: carId
    }));
    scrollToBooking();
  };

  const apiKey =
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyBtz25OJBMgFyr5uwC_9tr94fmdU9MEY74';

  return (
    <APIProvider apiKey={apiKey} libraries={['routes', 'places', 'geometry']}>
      <div className="min-h-screen flex flex-col bg-slate-50 selection:bg-amber-400 selection:text-slate-900">
        {/* Google Maps Platform Quota Warning Banner (Section 8 Case A) */}
        <QuotaBanner />

      {/* Top Navbar */}
      <Navbar
        onBookClick={scrollToBooking}
        onFleetClick={scrollToFleet}
        onPackagesClick={scrollToPackages}
      />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white pt-10 pb-16 overflow-hidden">
          {/* Subtle Background Glows */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute top-1/2 right-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Hero Copy */}
            <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
              <div className="inline-flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 px-3.5 py-1.5 rounded-full text-xs font-semibold text-amber-400 mb-4 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Gujarat's #1 Rated Outstation & Airport Taxi</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                Reliable Cabs Across <span className="text-amber-400">Gujarat</span>
              </h1>

              <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
                Book sanitized <strong className="text-white">Sedans, Ertigas & Innovas</strong> with
                transparent all-inclusive fares for One Way & Round Trips. Instant live route map,
                guaranteed pricing, and 1-tap WhatsApp booking.
              </p>

              {/* Quick Trust Badges */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs text-slate-300">
                <span className="flex items-center gap-1.5 bg-slate-800/60 px-3 py-1.5 rounded-xl border border-slate-700/60">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <strong className="text-white">★ 4.9</strong> Top Rated Cab Service
                </span>
                <span className="flex items-center gap-1.5 bg-slate-800/60 px-3 py-1.5 rounded-xl border border-slate-700/60">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Zero Hidden Charges
                </span>
                <span className="flex items-center gap-1.5 bg-slate-800/60 px-3 py-1.5 rounded-xl border border-slate-700/60">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  Fastag & AC Enabled
                </span>
              </div>
            </div>

            {/* Core Interactive Booking Form */}
            <div className="max-w-4xl mx-auto">
              <BookingForm
                onBookingConfirmed={(booking) => setActiveBooking(booking)}
                selectedPackageRoute={selectedRoutePackage}
              />
            </div>
          </div>
        </section>

        {/* Key Operational Metrics Strip */}
        <section className="bg-white border-y border-slate-200/80 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-3">
                <div className="text-2xl sm:text-3xl font-black text-slate-900">500+</div>
                <div className="text-xs text-slate-500 font-semibold mt-0.5">Happy Trips</div>
              </div>
              <div className="p-3">
                <div className="text-2xl sm:text-3xl font-black text-amber-600">4.9 ★</div>
                <div className="text-xs text-slate-500 font-semibold mt-0.5">Customer Rating</div>
              </div>
              <div className="p-3">
                <div className="text-2xl sm:text-3xl font-black text-slate-900">33 Districts</div>
                <div className="text-xs text-slate-500 font-semibold mt-0.5">Covered Across Gujarat</div>
              </div>
              <div className="p-3">
                <div className="text-2xl sm:text-3xl font-black text-emerald-600">0 Advance</div>
                <div className="text-xs text-slate-500 font-semibold mt-0.5">Pay Driver Directly</div>
              </div>
            </div>
          </div>
        </section>

        {/* Content Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 pb-16">
          {/* Fleet Section (Sedan vs Ertiga) */}
          <FleetSection onSelectCar={handleSelectFleetCar} />

          {/* Popular Gujarat Tour Packages */}
          <PopularPackages onSelectPackage={handleSelectPackage} />

          {/* Why Choose Gujarat Ride */}
          <WhyChooseUs />

          {/* Frequently Asked Questions */}
          <FAQSection />
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Floating WhatsApp and Mobile Bottom Quick Bar */}
      <WhatsAppFloat onQuickBookClick={scrollToBooking} />

      {/* Booking Voucher Modal */}
      <BookingModal
        booking={activeBooking}
        onClose={() => setActiveBooking(null)}
      />
    </div>
    </APIProvider>
  );
}
