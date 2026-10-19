import React from 'react';
import {
  CheckCircle2,
  X,
  Printer,
  MessageCircle,
  Phone,
  Car,
  Calendar,
  Clock,
  MapPin,
  ShieldCheck,
  Share2,
  Copy,
  Info
} from 'lucide-react';
import { BookingRecord } from './BookingForm';
import {
  openWhatsApp,
  getUniversalWhatsAppLink,
  DEFAULT_BUSINESS_PHONE
} from '../utils/whatsappHelper';

interface BookingModalProps {
  booking: BookingRecord | null;
  onClose: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({ booking, onClose }) => {
  if (!booking) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopySummary = () => {
    const summary = `GujaratRide by Riddhi Travels Booking ${booking.bookingId} - ${booking.car.name}: ${booking.pickup.name} to ${booking.destination.name}, ${booking.pickupDate} at ${booking.pickupTime}. Est. Fare: ₹${booking.fareResult.estimatedTotal}. Call +91 9773203109.`;
    navigator.clipboard.writeText(summary);
    alert('Booking details copied to clipboard!');
  };

  const followUpMessage = `Hi Riddhi Travels, following up on GujaratRide Booking ID: ${booking.bookingId}`;
  const waUrl = getUniversalWhatsAppLink(DEFAULT_BUSINESS_PHONE, followUpMessage);

  const handleWhatsAppFollowUp = (e: React.MouseEvent) => {
    e.preventDefault();
    openWhatsApp(DEFAULT_BUSINESS_PHONE, followUpMessage);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-emerald-100 hover:text-white p-1 rounded-full hover:bg-emerald-800/40 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 text-white">
              <CheckCircle2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="text-xs bg-emerald-800/60 text-emerald-200 font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                Booking Request Generated
              </span>
              <h3 className="text-xl font-extrabold mt-0.5">GujaratRide Booking Voucher</h3>
              <p className="text-xs text-emerald-100">
                A Unit of Riddhi Travels • ID: <span className="font-mono font-bold text-white">{booking.bookingId}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Voucher Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* WhatsApp Success Notice */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
            <MessageCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-950 space-y-1">
              <p className="font-bold text-sm text-emerald-900">
                Booking Details Dispatched to WhatsApp!
              </p>
              <p>
                Our booking coordinator is reviewing your trip details and will confirm the driver
                assignment shortly. You can also message or call us anytime for immediate assistance.
              </p>
            </div>
          </div>

          {/* Trip Summary Card */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
              <span className="font-bold text-slate-500 uppercase">Trip Itinerary</span>
              <span className="font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                {booking.tripType === 'local'
                  ? '📍 Local Rental'
                  : booking.tripType === 'round-trip'
                  ? '🔄 Round Trip'
                  : '➡️ One Way'}
              </span>
            </div>

            {/* Route Points */}
            <div className="space-y-2">
              <div className="flex items-start gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1 shrink-0"></span>
                <div>
                  <div className="font-bold text-slate-800 text-sm">{booking.pickup.name}</div>
                  <div className="text-slate-500">{booking.pickupAddress}</div>
                </div>
              </div>
              {booking.tripType === 'local' ? (
                <div className="flex items-start gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 mt-1 shrink-0"></span>
                  <div>
                    <div className="font-bold text-slate-800 text-sm">
                      {booking.fareResult.packageName || 'Local Rental Package'}
                    </div>
                    <div className="text-slate-500">
                      Coverage: {booking.fareResult.packageHours || 8} Hours & {booking.fareResult.packageKm || 80} KM Included
                      {booking.fareResult.extraKmRate && (
                        <span> • Extra: ₹{booking.fareResult.extraKmRate}/km, ₹{booking.fareResult.extraHourRate}/hr</span>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 mt-1 shrink-0"></span>
                  <div>
                    <div className="font-bold text-slate-800 text-sm">
                      {booking.destination.name}
                    </div>
                    <div className="text-slate-500">
                      Est. Highway Distance: {booking.fareResult.oneWayDistanceKm} km
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Schedule */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/80">
              <div>
                <span className="text-slate-400 block font-medium">Pickup Schedule</span>
                <span className="font-bold text-slate-800">
                  {booking.pickupDate} at {booking.pickupTime}
                </span>
              </div>
              {booking.returnDate && (
                <div>
                  <span className="text-slate-400 block font-medium">Return Schedule</span>
                  <span className="font-bold text-slate-800">
                    {booking.returnDate} at {booking.returnTime || 'Evening'}
                  </span>
                </div>
              )}
            </div>

            {/* Vehicle & Passenger */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/80">
              <div>
                <span className="text-slate-400 block font-medium">Vehicle Reserved</span>
                <span className="font-bold text-slate-800">
                  {booking.car.name} ({booking.car.category})
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Passenger Name & Phone</span>
                <span className="font-bold text-slate-800">
                  {booking.customerName}{' '}
                  {booking.customerPhone
                    ? booking.customerPhone.includes('chat')
                      ? `(${booking.customerPhone})`
                      : booking.customerPhone.startsWith('+')
                      ? `(${booking.customerPhone})`
                      : `(+91 ${booking.customerPhone})`
                    : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Fare Summary Box */}
          <div className="bg-slate-900 text-white rounded-2xl p-4 space-y-2 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-slate-400 font-semibold">Fare Summary</span>
              <span className="text-amber-400 font-bold">
                {booking.car.name}
              </span>
            </div>

            {booking.tripType === 'local' ? (
              <>
                <div className="flex items-center justify-between text-slate-300">
                  <span>
                    Package Base Fare ({booking.fareResult.packageName || 'Hourly'})
                  </span>
                  <span>₹{booking.fareResult.baseFare.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Fuel & Driver Charges</span>
                  <span className="text-emerald-400 font-bold">Included</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between text-slate-300">
                  <span>
                    Base Vehicle Fare ({booking.fareResult.totalBillableKm} km billable)
                  </span>
                  <span>₹{booking.fareResult.baseFare.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex items-center justify-between text-slate-300">
                  <span>
                    Driver Bhatta{' '}
                    {booking.fareResult.isRoundTrip
                      ? `(${booking.fareResult.numberOfDays} Day${booking.fareResult.numberOfDays > 1 ? 's' : ''})`
                      : '(One Way)'}
                  </span>
                  <span>₹{booking.fareResult.driverAllowance.toLocaleString('en-IN')}</span>
                </div>
              </>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-sm font-bold text-amber-400">
              <span>{booking.tripType === 'local' ? 'Total Package Fare' : 'Total Estimated Fare'}</span>
              <span className="text-lg">
                ₹{booking.fareResult.estimatedTotal.toLocaleString('en-IN')}
              </span>
            </div>
            <p className="text-[10px] text-slate-300 font-medium">
              * Tag: {booking.fareResult.tag || (booking.tripType === 'local' ? 'All-Inclusive: Fuel & Driver Included' : booking.fareResult.isRoundTrip ? 'Toll & Parking Extra as per actuals' : 'Fuel & Driver Allowance Included (Toll/Parking extra)')}
            </p>
          </div>

          {/* Dispatch Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2.5 text-xs text-amber-900">
            <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <p>
              <strong>Chauffeur & Car Assignment:</strong> Cab registration number and driver's
              contact number will be shared on your WhatsApp 2 hours prior to your scheduled
              departure.
            </p>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={handleCopySummary}
              className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={waUrl}
              onClick={handleWhatsAppFollowUp}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-white" />
              <span>Chat on WhatsApp</span>
            </a>
            <button
              onClick={onClose}
              className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
