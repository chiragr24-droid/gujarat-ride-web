import React from 'react';
import { MessageCircle, Phone } from 'lucide-react';
import {
  openWhatsApp,
  getUniversalWhatsAppLink,
  DEFAULT_BUSINESS_PHONE
} from '../utils/whatsappHelper';

interface WhatsAppFloatProps {
  onQuickBookClick: () => void;
}

export const WhatsAppFloat: React.FC<WhatsAppFloatProps> = ({ onQuickBookClick }) => {
  const businessPhone = `+${DEFAULT_BUSINESS_PHONE}`;
  const inquiryMessage = 'Hello Riddhi Travels, I want to book a GujaratRide cab.';
  const universalUrl = getUniversalWhatsAppLink(DEFAULT_BUSINESS_PHONE, inquiryMessage);

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.preventDefault();
    openWhatsApp(DEFAULT_BUSINESS_PHONE, inquiryMessage);
  };

  return (
    <>
      {/* Floating WhatsApp Action Pill (Bottom Right on Desktop / Tablet) */}
      <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 flex flex-col gap-2.5 items-end">
        <a
          href={universalUrl}
          onClick={handleWhatsAppClick}
          className="group flex items-center gap-2.5 bg-emerald-600 hover:bg-emerald-500 text-white p-3.5 sm:px-4 sm:py-3 rounded-full shadow-xl shadow-emerald-700/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          title="Chat with GujaratRide by Riddhi Travels on WhatsApp"
        >
          <MessageCircle className="w-6 h-6 fill-white" />
          <span className="hidden sm:inline font-extrabold text-sm tracking-wide">
            Book on WhatsApp
          </span>
        </a>
      </div>

      {/* Sticky Mobile Bottom Bar (Clean Two-Button Split: Call 24/7 & WhatsApp Book) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 p-2.5 shadow-2xl flex items-center gap-2.5 safe-area-pb">
        <a
          href={`tel:${businessPhone}`}
          className="flex-1 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-900 font-extrabold py-3 px-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-all border border-slate-200/80 shadow-xs"
        >
          <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>📞 Call 24/7</span>
        </a>

        <a
          href={universalUrl}
          onClick={handleWhatsAppClick}
          className="flex-1 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-extrabold py-3 px-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/30 cursor-pointer"
          title="WhatsApp Book"
        >
          <MessageCircle className="w-4 h-4 fill-white shrink-0" />
          <span>💬 WhatsApp Book</span>
        </a>
      </div>
    </>
  );
};
