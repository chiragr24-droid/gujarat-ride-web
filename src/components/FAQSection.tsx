import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

export const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How are the outstation cab fares calculated?',
      a: 'Our fares are calculated automatically based on your travel route and duration, including clean AC vehicle rental, fuel charges, and round-trip driver allowance. You get an instant, transparent total fare quote right in the calculator before booking, with zero hidden surcharges or peak multipliers.'
    },
    {
      q: 'Are tolls, state tax, and parking charges included in the fare?',
      a: 'The fare estimated by the calculator covers vehicle rent, fuel, and driver charges. Toll taxes, state border permits (e.g. entering Diu, Daman, Rajasthan/Mount Abu, or Maharashtra/Mumbai), and destination parking tickets are paid on actuals directly at the respective counters or Fastag. There are zero hidden agency markups.'
    },
    {
      q: 'How does WhatsApp booking work?',
      a: 'Simply fill your pickup location, drop location, date, time, and choose your preferred vehicle (Sedan, Ertiga, Innova, or Innova Crysta). Clicking "Send Booking Details to WhatsApp" will instantly format your complete trip summary and open WhatsApp to send directly to our dispatch desk. You receive driver details and booking confirmation immediately with zero advance payment needed.'
    },
    {
      q: 'Can I book a cab for Ahmedabad Airport (AMD) or Surat Airport pickup?',
      a: 'Yes, we provide 24/7 dedicated airport transfers to and from Ahmedabad International & Domestic Airport, Surat Airport, Vadodara Airport, and Rajkot International Airport (Hirasar). Our driver tracks your flight status so delay adjustments are hassle-free.'
    },
    {
      q: 'What is the Driver Bhatta / Allowance?',
      a: 'Driver Bhatta (allowance for driver food and night stay) is ₹300 per day for Round Trips across all vehicle types. For One Way drops, driver allowance is ₹0 (no extra driver allowance is added).'
    },
    {
      q: 'What if I need to cancel or modify my booking?',
      a: 'We offer 100% free cancellation if canceled at least 4 hours before the scheduled pickup time. Just drop a message on WhatsApp or call our support number.'
    }
  ];

  return (
    <section id="faq" className="scroll-mt-20 py-12 border-t border-slate-200">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="text-xs font-extrabold uppercase tracking-wider text-amber-600 bg-amber-100 px-3 py-1 rounded-full border border-amber-200">
          Got Questions?
        </span>
        <h2 className="text-3xl font-extrabold text-slate-900 mt-3">
          Frequently Asked Questions
        </h2>
        <p className="text-slate-600 text-sm mt-2">
          Everything you need to know about booking with Gujarat Ride.
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden transition-colors"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full p-4 sm:p-5 text-left font-bold text-slate-900 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 transition-colors"
              >
                <span className="text-sm sm:text-base flex items-center gap-2.5">
                  <HelpCircle className="w-4 h-4 text-amber-500 shrink-0" />
                  {faq.q}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-500 shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-amber-600' : ''
                  }`}
                />
              </button>
              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
