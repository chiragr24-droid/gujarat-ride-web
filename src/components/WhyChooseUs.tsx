import React from 'react';
import { ShieldCheck, IndianRupee, Clock, ThumbsUp, Sparkles, Navigation } from 'lucide-react';
import { TESTIMONIALS } from '../data/gujaratRoutes';

export const WhyChooseUs: React.FC = () => {
  const perks = [
    {
      icon: IndianRupee,
      title: 'Transparent Upfront Pricing',
      desc: 'No hidden night surcharges or peak-hour multiplier gimmicks. See the exact total calculated fare upfront before you book.'
    },
    {
      icon: ShieldCheck,
      title: 'Polite & Verified Highway Chauffeurs',
      desc: 'Local Gujarati and Hindi speaking drivers with commercial licenses, verified background checks, and extensive Saurashtra-Kutch route mastery.'
    },
    {
      icon: Clock,
      title: '100% Guaranteed On-Time Pickups',
      desc: 'Your vehicle arrives 10 minutes prior to scheduled departure. Zero last-minute cancellations or excuses.'
    },
    {
      icon: Navigation,
      title: 'Fastag & Expressway Ready',
      desc: 'Skip long toll booth queues on NE1 (Ahmedabad-Vadodara Expressway), NH48, and national highways with automatic Fastag transit.'
    },
    {
      icon: Sparkles,
      title: 'Sanitized & Clean AC Cabs',
      desc: 'Every cab undergoes full interior sanitization, AC maintenance check, and tire pressure review prior to every outstation departure.'
    },
    {
      icon: ThumbsUp,
      title: 'Zero Advance Payment Required',
      desc: 'Book your cab in under 60 seconds with simple WhatsApp confirmation. Pay directly to the driver during your ride.'
    }
  ];

  return (
    <section id="why-us" className="scroll-mt-20 py-12 border-t border-slate-200">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="text-xs font-extrabold uppercase tracking-wider text-amber-600 bg-amber-100 px-3 py-1 rounded-full border border-amber-200">
          The Gujarat Ride Advantage
        </span>
        <h2 className="text-3xl font-extrabold text-slate-900 mt-3">
          Why Travelers & Families Choose Gujarat Ride
        </h2>
        <p className="text-slate-600 text-sm mt-2">
          Gujarat's most dependable intercity cab service with 500+ happy trips and 100% on-time rides.
        </p>
      </div>

      {/* Grid of features */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-14">
        {perks.map((perk, i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center mb-4">
              <perk.icon className="w-6 h-6 stroke-[2.2]" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 mb-2">{perk.title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{perk.desc}</p>
          </div>
        ))}
      </div>

      {/* Customer Reviews */}
      <div className="bg-slate-900 rounded-3xl p-8 sm:p-10 text-white relative overflow-hidden">
        <div className="max-w-2xl mx-auto text-center mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            Real Customer Stories
          </span>
          <h3 className="text-2xl sm:text-3xl font-extrabold mt-1">
            Rated 4.9/5 by Gujarat Travelers
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, idx) => (
            <div
              key={idx}
              className="bg-slate-800/80 backdrop-blur-md p-6 rounded-2xl border border-slate-700/80 flex flex-col justify-between"
            >
              <div>
                <div className="flex text-amber-400 text-sm mb-3">{'★'.repeat(t.rating)}</div>
                <p className="text-xs text-slate-300 leading-relaxed italic mb-4">"{t.comment}"</p>
              </div>

              <div className="pt-3 border-t border-slate-700 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-white block">{t.name}</span>
                  <span className="text-slate-400 text-[11px]">{t.city}</span>
                </div>
                <span className="bg-slate-900 text-amber-400 px-2 py-0.5 rounded text-[10px] font-bold border border-slate-700">
                  {t.car}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
