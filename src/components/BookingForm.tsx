import React, { useState, useEffect } from 'react';
import {
  MapPin,
  ArrowRightLeft,
  Calendar,
  Clock,
  Car,
  Users,
  Briefcase,
  CheckCircle2,
  Info,
  ChevronDown,
  Navigation,
  MessageCircle,
  Phone,
  Sparkles,
  Shield,
  FileText
} from 'lucide-react';
import { GUJARAT_CITIES, CAR_OPTIONS, CarOption, CityLocation, CarId } from '../data/gujaratRoutes';
import { useMapsLibrary } from '@vis.gl/react-google-maps';
import {
  LocationPoint,
  getRouteDistanceKm,
  calculateTripFare,
  FareCalculationResult,
  findCityByName,
  LocalPackageId,
  LOCAL_PACKAGES,
  LOCAL_PRICING,
  calculateLocalPackageFare,
  calculateDrivingRoute,
  estimateDuration,
  isVadodaraAhmedabadRoute
} from '../utils/distanceCalculator';
import { openWhatsApp } from '../utils/whatsappHelper';
import { MapRouteView } from './MapRouteView';

export type TripType = 'one-way' | 'round-trip' | 'local';

interface BookingFormProps {
  onBookingConfirmed: (bookingData: BookingRecord) => void;
  selectedPackageRoute?: { from: string; to: string; car?: CarId } | null;
}

export interface BookingRecord {
  bookingId: string;
  tripType: TripType;
  pickup: LocationPoint;
  destination: LocationPoint;
  pickupDate: string;
  pickupTime: string;
  returnDate?: string;
  returnTime?: string;
  car: CarOption;
  fareResult: FareCalculationResult;
  customerName: string;
  customerPhone: string;
  pickupAddress: string;
  specialNotes?: string;
  createdAt: string;
}

export const BookingForm: React.FC<BookingFormProps> = ({
  onBookingConfirmed,
  selectedPackageRoute
}) => {
  // Trip Type State
  const [tripType, setTripType] = useState<TripType>('round-trip');
  const [localPackageId, setLocalPackageId] = useState<LocalPackageId>('8h-80km');

  // Location States (Initially empty - no default locations or default fares)
  const [pickupCity, setPickupCity] = useState<LocationPoint | null>(null);
  const [destinationCity, setDestinationCity] = useState<LocationPoint | null>(null);

  const [pickupSearch, setPickupSearch] = useState('');
  const [destinationSearch, setDestinationSearch] = useState('');
  const [showPickupDropdown, setShowPickupDropdown] = useState(false);
  const [showDestDropdown, setShowDestDropdown] = useState(false);
  const pickupContainerRef = React.useRef<HTMLDivElement>(null);
  const destContainerRef = React.useRef<HTMLDivElement>(null);
  const passengerDetailsRef = React.useRef<HTMLDivElement>(null);
  const nameInputRef = React.useRef<HTMLInputElement>(null);
  const phoneInputRef = React.useRef<HTMLInputElement>(null);
  const [highlightPassengerStep, setHighlightPassengerStep] = useState(false);

  // Google Maps Places Autocomplete Integration for Destination Search
  interface GooglePlaceItem {
    placeId: string;
    mainText: string;
    secondaryText: string;
    description: string;
  }

  const placesLib = useMapsLibrary('places');
  const [googleDestPredictions, setGoogleDestPredictions] = useState<GooglePlaceItem[]>([]);
  const [isSearchingGoogle, setIsSearchingGoogle] = useState(false);
  const autocompleteServiceRef = React.useRef<google.maps.places.AutocompleteService | null>(null);
  const geocoderRef = React.useRef<google.maps.Geocoder | null>(null);

  useEffect(() => {
    if (placesLib) {
      autocompleteServiceRef.current = new placesLib.AutocompleteService();
    } else if (window.google?.maps?.places?.AutocompleteService) {
      autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
    }
    if (window.google?.maps?.Geocoder) {
      geocoderRef.current = new window.google.maps.Geocoder();
    }
  }, [placesLib]);

  // Dynamically search Google Maps places when user types in the destination field
  useEffect(() => {
    const query = destinationSearch.trim();
    if (query.length < 2) {
      setGoogleDestPredictions([]);
      setIsSearchingGoogle(false);
      return;
    }

    setIsSearchingGoogle(true);
    const timer = setTimeout(() => {
      if (!autocompleteServiceRef.current) {
        if (placesLib?.AutocompleteService) {
          autocompleteServiceRef.current = new placesLib.AutocompleteService();
        } else if (window.google?.maps?.places?.AutocompleteService) {
          autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
        }
      }

      if (autocompleteServiceRef.current) {
        try {
          autocompleteServiceRef.current.getPlacePredictions(
            {
              input: query,
              componentRestrictions: { country: 'in' }
            },
            (predictions, status) => {
              setIsSearchingGoogle(false);
              if (
                status === (window.google?.maps?.places?.PlacesServiceStatus?.OK || 'OK') &&
                predictions &&
                predictions.length > 0
              ) {
                setGoogleDestPredictions(
                  predictions.slice(0, 5).map((p) => ({
                    placeId: p.place_id,
                    mainText: p.structured_formatting?.main_text || p.description,
                    secondaryText: p.structured_formatting?.secondary_text || '',
                    description: p.description
                  }))
                );
              } else {
                setGoogleDestPredictions([]);
              }
            }
          );
        } catch (err) {
          console.warn('Google Maps Autocomplete search error:', err);
          setIsSearchingGoogle(false);
          setGoogleDestPredictions([]);
        }
      } else {
        setIsSearchingGoogle(false);
      }
    }, 180);

    return () => clearTimeout(timer);
  }, [destinationSearch, placesLib]);

  // Handle selecting a place returned from Google Maps
  const handleSelectGooglePlace = (item: GooglePlaceItem) => {
    setDestinationSearch(item.mainText);
    setShowDestDropdown(false);

    // 1. Check if it matches a registered local city
    const localMatch = findCityByName(item.mainText);
    if (localMatch) {
      setDestinationCity(localMatch);
      return;
    }

    // 2. Resolve coordinates using Google Maps Geocoder
    try {
      const geocoder =
        geocoderRef.current ||
        (window.google?.maps?.Geocoder ? new window.google.maps.Geocoder() : null);

      if (geocoder) {
        geocoder.geocode({ placeId: item.placeId }, (results, status) => {
          if (status === 'OK' && results && results[0]) {
            const loc = results[0].geometry.location;
            setDestinationCity({
              name: item.mainText,
              lat: loc.lat(),
              lng: loc.lng(),
              district: item.secondaryText || 'Gujarat'
            });
          } else {
            // Fallback by address string geocode
            geocoder.geocode({ address: item.description }, (res, st) => {
              if (st === 'OK' && res && res[0]) {
                const loc = res[0].geometry.location;
                setDestinationCity({
                  name: item.mainText,
                  lat: loc.lat(),
                  lng: loc.lng(),
                  district: item.secondaryText || 'Gujarat'
                });
              } else {
                setDestinationCity({
                  name: item.mainText,
                  district: item.secondaryText || 'Gujarat'
                });
              }
            });
          }
        });
      } else {
        setDestinationCity({
          name: item.mainText,
          district: item.secondaryText || 'Gujarat'
        });
      }
    } catch (err) {
      console.warn('Error resolving place coordinates:', err);
      setDestinationCity({
        name: item.mainText,
        district: item.secondaryText || 'Gujarat'
      });
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickupContainerRef.current &&
        !pickupContainerRef.current.contains(event.target as Node)
      ) {
        setShowPickupDropdown(false);
      }
      if (
        destContainerRef.current &&
        !destContainerRef.current.contains(event.target as Node)
      ) {
        setShowDestDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Date & Time States (Initially blank on first load - no default date/time)
  const [pickupDate, setPickupDate] = useState<string>('');
  const [pickupTime, setPickupTime] = useState<string>('');
  const [returnDate, setReturnDate] = useState<string>('');
  const [returnTime, setReturnTime] = useState<string>('');

  // Car Selection State (Initially null until customer selects a vehicle)
  const [selectedCarId, setSelectedCarId] = useState<CarId | null>(null);

  // Filter available vehicles: round-trip shows all 4 vehicles, local shows Sedan, Ertiga, and Innova Crysta, one-way keeps sedan and ertiga
  const availableCars =
    tripType === 'round-trip'
      ? CAR_OPTIONS
      : tripType === 'local'
      ? CAR_OPTIONS.filter((c) => c.id === 'sedan' || c.id === 'ertiga' || c.id === 'innova-crysta')
      : CAR_OPTIONS.filter((c) => c.id === 'sedan' || c.id === 'ertiga');

  // Customer Contact Details
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [specialNotes, setSpecialNotes] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // WhatsApp Contact Number for Gujarat Ride
  const businessWhatsAppNumber = '919773203109';

  // Handle external prefilled route from packages
  useEffect(() => {
    if (selectedPackageRoute) {
      if (selectedPackageRoute.from) {
        const fromMatch = findCityByName(selectedPackageRoute.from);
        if (fromMatch) {
          setPickupCity(fromMatch);
          setPickupSearch(fromMatch.name);
        } else {
          setPickupCity({ name: selectedPackageRoute.from });
          setPickupSearch(selectedPackageRoute.from);
        }
      }

      if (selectedPackageRoute.to) {
        const toMatch = findCityByName(selectedPackageRoute.to);
        if (toMatch) {
          setDestinationCity(toMatch);
          setDestinationSearch(toMatch.name);
        } else {
          setDestinationCity({ name: selectedPackageRoute.to });
          setDestinationSearch(selectedPackageRoute.to);
        }
      }

      if (selectedPackageRoute.car) {
        setSelectedCarId(selectedPackageRoute.car);
      }
    }
  }, [selectedPackageRoute]);

  // Check required details for fare calculation:
  // Required details are: trip type, pickup location, destination (if not local), date/time, and selected vehicle.
  const hasPickup = Boolean(pickupSearch.trim() && (pickupCity?.name || pickupSearch.trim().length >= 2));
  const hasDestination = Boolean(destinationSearch.trim() && (destinationCity?.name || destinationSearch.trim().length >= 2));
  const isLocationsDistinct =
    hasPickup &&
    hasDestination &&
    pickupSearch.trim().toLowerCase() !== destinationSearch.trim().toLowerCase();

  const isRouteReady =
    tripType === 'local'
      ? hasPickup
      : hasPickup && hasDestination && isLocationsDistinct;

  const isDatesReady =
    tripType === 'round-trip'
      ? Boolean(
          pickupDate &&
          pickupTime &&
          returnDate &&
          returnTime &&
          returnDate >= pickupDate
        )
      : Boolean(pickupDate && pickupTime);

  const isVehicleSelected = Boolean(selectedCarId);

  // Fare calculation must remain completely hidden until the customer has entered all required trip details
  const isFareReady = Boolean(isRouteReady && isDatesReady && isVehicleSelected);

  // Google Maps DirectionsService Driving Distance States
  const routesLib = useMapsLibrary('routes');
  const [drivingDistanceKm, setDrivingDistanceKm] = useState<number>(0);
  const [drivingDurationText, setDrivingDurationText] = useState<string>('');
  const [directionsResult, setDirectionsResult] = useState<google.maps.DirectionsResult | null>(null);

  // Trigger Google Maps DirectionsService calculation with travelMode: DRIVING
  useEffect(() => {
    if (tripType === 'local') {
      setDrivingDistanceKm(0);
      setDrivingDurationText('');
      setDirectionsResult(null);
      return;
    }

    if (!isRouteReady || !pickupSearch.trim() || !destinationSearch.trim()) {
      setDrivingDistanceKm(0);
      setDrivingDurationText('');
      setDirectionsResult(null);
      return;
    }

    // Check if route distance is available in ROAD_DISTANCES table for immediate sync
    const initialKm = getRouteDistanceKm(
      pickupCity || { name: pickupSearch },
      destinationCity || { name: destinationSearch }
    );
    if (initialKm > 0) {
      setDrivingDistanceKm((prev) => (prev === 0 ? initialKm : prev));
      setDrivingDurationText((prev) => (prev === '' ? estimateDuration(initialKm) : prev));
    }

    let isCancelled = false;

    const origin = (pickupCity?.lat && pickupCity?.lng)
      ? { lat: pickupCity.lat, lng: pickupCity.lng, name: pickupSearch }
      : (pickupCity || { name: pickupSearch.trim() });

    const destination = (destinationCity?.lat && destinationCity?.lng)
      ? { lat: destinationCity.lat, lng: destinationCity.lng, name: destinationSearch }
      : (destinationCity || { name: destinationSearch.trim() });

    calculateDrivingRoute(origin, destination, routesLib)
      .then((routeData) => {
        if (!isCancelled) {
          setDrivingDistanceKm(routeData.distanceKm);
          setDrivingDurationText(routeData.durationText);
          setDirectionsResult(routeData.result);
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          console.warn('Google Maps DirectionsService route error:', err);
          const fallbackKm = getRouteDistanceKm(
            pickupCity || { name: pickupSearch },
            destinationCity || { name: destinationSearch }
          );
          if (fallbackKm > 0) {
            setDrivingDistanceKm(fallbackKm);
            setDrivingDurationText(estimateDuration(fallbackKm));
          }
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [tripType, isRouteReady, pickupCity, destinationCity, pickupSearch, destinationSearch, routesLib]);

  const handleRouteCalculated = (distKm: number, durText: string, result?: google.maps.DirectionsResult) => {
    if (distKm > 0) {
      setDrivingDistanceKm(distKm);
      setDrivingDurationText(durText);
      if (result) {
        setDirectionsResult(result);
      }
    }
  };

  // Calculate actual driving route distance from Google Maps DirectionsService (not applicable for local packages)
  const distanceKm = tripType !== 'local' ? drivingDistanceKm : 0;

  // Selected Car Option
  const selectedCar = selectedCarId
    ? CAR_OPTIONS.find((c) => c.id === selectedCarId) || null
    : null;

  // Final calculated fare - calculated when all required details are valid
  const fareResult: FareCalculationResult | null =
    isFareReady && selectedCarId
      ? tripType === 'local'
        ? calculateLocalPackageFare(selectedCarId, localPackageId)
        : distanceKm > 0
        ? calculateTripFare(
            distanceKm,
            selectedCarId,
            tripType === 'round-trip',
            pickupDate,
            returnDate,
            pickupCity || (pickupSearch ? { name: pickupSearch } : null),
            destinationCity || (destinationSearch ? { name: destinationSearch } : null)
          )
        : null
      : null;

  // Swap pickup & destination
  const handleSwapLocations = () => {
    if (!pickupCity && !destinationCity && !pickupSearch && !destinationSearch) return;
    const tempCity = pickupCity;
    const tempSearch = pickupSearch;
    setPickupCity(destinationCity);
    setPickupSearch(destinationSearch);
    setDestinationCity(tempCity);
    setDestinationSearch(tempSearch);
  };

  // Filter city suggestions
  const filterCities = (query: string) => {
    if (!query) return GUJARAT_CITIES.slice(0, 8);
    const q = query.toLowerCase();
    return GUJARAT_CITIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.district.toLowerCase().includes(q) ||
        c.popularSpots?.some((s) => s.toLowerCase().includes(q))
    ).slice(0, 7);
  };

  // Quick Pick Chips
  const popularChips = [
    'Ahmedabad',
    'Vadodara',
    'Surat',
    'Rajkot',
    'Statue of Unity',
    'Somnath',
    'Dwarka'
  ];

  // Geolocation handler
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setPickupCity({
          name: 'Current Location (GPS)',
          lat: latitude,
          lng: longitude
        });
        setPickupSearch('Current Location (GPS)');
      },
      () => {
        alert('Could not retrieve your location. Please select a city from the list.');
      }
    );
  };

  // Validate form fields
  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!pickupSearch.trim()) {
      errors.pickup = 'Please enter a pickup location';
    }
    if (tripType !== 'local') {
      if (!destinationSearch.trim() || !destinationCity?.name) {
        errors.destination = 'Please enter a destination';
      } else if (
        pickupSearch.trim().toLowerCase() === destinationSearch.trim().toLowerCase()
      ) {
        errors.destination = 'Pickup and destination cannot be the same';
      }
    }
    if (!selectedCarId) {
      errors.car = 'Please select a vehicle';
    }
    if (!pickupDate) {
      errors.pickupDate = 'Please select pickup date';
    }
    if (!pickupTime) {
      errors.pickupTime = 'Please select pickup time';
    }
    if (tripType === 'round-trip') {
      if (!returnDate) {
        errors.returnDate = 'Please select return date';
      } else if (returnDate < pickupDate) {
        errors.returnDate = 'Return date must be on or after pickup date';
      }
      if (!returnTime) {
        errors.returnTime = 'Please select return time';
      }
    }
    // Only check phone format if user entered a phone number; if blank, "To be shared on chat" is used
    if (customerPhone.trim() && !/^[6-9]\d{9}$/.test(customerPhone.trim().replace(/\D/g, ''))) {
      errors.phone = 'Please enter a valid 10-digit Indian phone number';
    }
    setFormErrors(errors);
    return (
      Object.keys(errors).length === 0 &&
      Boolean(fareResult && selectedCar && pickupSearch && (tripType === 'local' || destinationCity))
    );
  };

  // Helper to build WhatsApp booking message with Passenger Details right below Booking ID
  const buildWhatsAppBookingMessage = (params: {
    bookingId: string;
    tripType: TripType;
    pickupText: string;
    destinationText?: string;
    pickupDateStr: string;
    pickupTimeStr: string;
    returnDateStr?: string;
    returnTimeStr?: string;
    car: CarOption;
    fare: FareCalculationResult;
    name?: string;
    phone?: string;
    landmark?: string;
    notes?: string;
    sourceTag?: string;
    packageName?: string;
    extraKmRate?: number;
    extraHourRate?: number;
    packageHours?: number;
    packageKm?: number;
  }) => {
    const formattedName = params.name?.trim() || 'To be shared on chat';
    const rawPhone = params.phone?.trim();
    const formattedPhone = rawPhone
      ? (rawPhone.startsWith('+') ? rawPhone : `+91 ${rawPhone}`)
      : 'To be shared on chat';
    const landmarkText = params.landmark?.trim();

    const tripTypeLabel =
      params.tripType === 'local'
        ? 'Local'
        : params.tripType === 'round-trip'
        ? 'Round Trip'
        : 'One Way';

    const lines = [
      `🚖 *CAB BOOKING REQUEST - RIDDHI TRAVELS*`,
      `*Booking ID:* ${params.bookingId}`,
      `• Passenger Name: ${formattedName}`,
      `• Contact Number: ${formattedPhone}`,
      landmarkText ? `• Pickup Landmark / Address: ${landmarkText}` : '',
      `---------------------------------------`,
      `📍 *Pickup:* ${params.pickupText}`,
      params.tripType !== 'local' && params.destinationText ? `🏁 *Drop:* ${params.destinationText}` : '',
      `🗺️ *Trip Type:* ${tripTypeLabel}`,
      params.tripType === 'local' && params.packageName ? `📦 *Rental Package:* ${params.packageName}` : '',
      `📅 *Pickup Date:* ${params.pickupDateStr || 'To be confirmed'}${params.pickupTimeStr ? ` at ${params.pickupTimeStr}` : ''}`,
      params.tripType === 'round-trip' ? `🔄 *Return Date:* ${params.returnDateStr || 'To be confirmed'}${params.returnTimeStr ? ` at ${params.returnTimeStr}` : ''}` : '',
      ``,
      `🚗 *Selected Car:* ${params.car.name} (${params.car.category})`,
      params.tripType === 'local'
        ? `⏱️ *Package Coverage:* ${params.packageHours || params.fare.packageHours || 8} Hours & ${params.packageKm || params.fare.packageKm || 80} KM Included`
        : `📏 *Est. Distance:* ${params.fare.oneWayDistanceKm} km ${params.tripType === 'round-trip' ? `(${params.fare.totalBillableKm} km billable)` : ''}`,
      params.tripType !== 'local' ? `⏱️ *Travel Duration:* ~${params.fare.estimatedDurationText}` : '',
      params.tripType === 'local' && params.extraKmRate
        ? `⚡ *Extra Charges:* ₹${params.extraKmRate}/km • ₹${params.extraHourRate}/hr`
        : '',
      ``,
      params.tripType === 'local' ? `💵 *PACKAGE FARE:*` : `💵 *ESTIMATED FARE:*`,
      params.tripType === 'local'
        ? `• Package Fare: ₹${params.fare.estimatedTotal.toLocaleString('en-IN')}`
        : `• Base Vehicle Fare: ₹${params.fare.baseFare.toLocaleString('en-IN')}`,
      params.tripType !== 'local'
        ? params.fare.driverAllowance > 0
          ? `• Driver Allowance: ₹${params.fare.driverAllowance.toLocaleString('en-IN')} (${params.fare.numberOfDays} Day${params.fare.numberOfDays > 1 ? 's' : ''})`
          : `• Driver Allowance: ₹0 (One Way - Driver Included)`
        : '',
      `• *Total Estimated Fare:* ₹${params.fare.estimatedTotal.toLocaleString('en-IN')}`,
      params.tripType === 'one-way'
        ? params.fare.isFixedFare
          ? `Note: All Inclusive Fixed Fare (Tolls & Taxes Included).`
          : `Note: Fuel & Driver included. Toll, Parking & State Border Tax extra as per actuals.`
        : `*Tag: ${params.fare.tag || (params.tripType === 'local' ? 'Fuel & Chauffeur Included (Toll/Parking extra)' : 'Toll & Parking Extra as per actuals')}*`,
      ``,
      params.notes?.trim() ? `📝 *Special Request:* ${params.notes.trim()}` : '',
      `---------------------------------------`,
      params.sourceTag || `_Sent via GujaratRide by Riddhi Travels_`
    ].filter(Boolean);

    return lines.join('\n');
  };

  // Submit and send to WhatsApp
  const handleWhatsAppBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !fareResult || !selectedCar || !pickupSearch || (tripType !== 'local' && !destinationCity)) {
      return;
    }

    const bookingId = `GR-${Math.floor(1000 + Math.random() * 9000)}`;
    const finalCustomerName = customerName.trim() || 'To be shared on chat';
    const finalCustomerPhone = customerPhone.trim() || 'To be shared on chat';

    const newBooking: BookingRecord = {
      bookingId,
      tripType,
      pickup: pickupCity || { name: pickupSearch },
      destination:
        tripType === 'local'
          ? { name: `Local Package (${fareResult.packageName})` }
          : destinationCity!,
      pickupDate,
      pickupTime,
      returnDate: tripType === 'round-trip' ? returnDate : undefined,
      returnTime: tripType === 'round-trip' ? returnTime : undefined,
      car: selectedCar,
      fareResult,
      customerName: finalCustomerName,
      customerPhone: finalCustomerPhone,
      pickupAddress: pickupAddress.trim() || 'Same as pickup area',
      specialNotes,
      createdAt: new Date().toISOString()
    };

    // Construct structured WhatsApp message with Passenger Details right below Booking ID
    const message = buildWhatsAppBookingMessage({
      bookingId,
      tripType,
      pickupText: pickupSearch,
      destinationText: tripType === 'local' ? '' : destinationSearch,
      pickupDateStr: pickupDate,
      pickupTimeStr: pickupTime,
      returnDateStr: returnDate,
      returnTimeStr: returnTime,
      car: selectedCar,
      fare: fareResult,
      name: customerName,
      phone: customerPhone,
      landmark: pickupAddress,
      notes: specialNotes,
      packageName: fareResult.packageName,
      extraKmRate: fareResult.extraKmRate,
      extraHourRate: fareResult.extraHourRate,
      packageHours: fareResult.packageHours,
      packageKm: fareResult.packageKm,
      sourceTag: `_Sent from GujaratRide by Riddhi Travels Web App_`
    });

    // Open WhatsApp using universal deep linking with fallback
    openWhatsApp(businessWhatsAppNumber, message);

    // Notify parent to show confirmation modal
    onBookingConfirmed(newBooking);
  };

  // 1-Tap direct WhatsApp booking from vehicle card
  const handleQuickWhatsAppBook = (car: CarOption) => {
    setSelectedCarId(car.id);

    // Validate minimum required locations
    if (!pickupSearch) {
      setFormErrors((prev) => ({ ...prev, pickup: 'Please enter pickup location' }));
      pickupContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    if (tripType !== 'local' && !destinationSearch) {
      setFormErrors((prev) => ({ ...prev, destination: 'Please enter drop location' }));
      destContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // Behavior:
    // If user clicks "Book on WhatsApp" directly from the vehicle card,
    // auto-scroll them to Step 5 (or pre-fill whatever details they entered)
    // so the name and contact number are never missed in the message.
    if (!customerName.trim() || !customerPhone.trim()) {
      setHighlightPassengerStep(true);
      passengerDetailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => {
        if (!customerName.trim()) {
          nameInputRef.current?.focus();
        } else {
          phoneInputRef.current?.focus();
        }
      }, 350);
      setTimeout(() => setHighlightPassengerStep(false), 3500);
      return;
    }

    const calculatedFare =
      tripType === 'local'
        ? calculateLocalPackageFare(car.id, localPackageId)
        : distanceKm > 0
        ? calculateTripFare(
            distanceKm,
            car.id,
            tripType === 'round-trip',
            pickupDate,
            returnDate,
            pickupCity || { name: pickupSearch },
            destinationCity || { name: destinationSearch }
          )
        : null;

    if (!calculatedFare) {
      passengerDetailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    const bookingId = `GR-${Math.floor(1000 + Math.random() * 9000)}`;
    const finalCustomerName = customerName.trim() || 'To be shared on chat';
    const finalCustomerPhone = customerPhone.trim() || 'To be shared on chat';

    const message = buildWhatsAppBookingMessage({
      bookingId,
      tripType,
      pickupText: pickupSearch,
      destinationText: tripType === 'local' ? '' : destinationSearch,
      pickupDateStr: pickupDate,
      pickupTimeStr: pickupTime,
      returnDateStr: returnDate,
      returnTimeStr: returnTime,
      car,
      fare: calculatedFare,
      name: customerName,
      phone: customerPhone,
      landmark: pickupAddress,
      notes: specialNotes,
      packageName: calculatedFare.packageName,
      extraKmRate: calculatedFare.extraKmRate,
      extraHourRate: calculatedFare.extraHourRate,
      packageHours: calculatedFare.packageHours,
      packageKm: calculatedFare.packageKm,
      sourceTag: `_Sent via 1-Tap Booking on GujaratRide by Riddhi Travels_`
    });

    // Open WhatsApp using universal deep linking with fallback
    openWhatsApp(businessWhatsAppNumber, message);

    onBookingConfirmed({
      bookingId,
      tripType,
      pickup: pickupCity || { name: pickupSearch },
      destination:
        tripType === 'local'
          ? { name: `Local Package (${calculatedFare.packageName})` }
          : destinationCity || { name: destinationSearch },
      pickupDate: pickupDate || 'Not specified',
      pickupTime: pickupTime || 'Flexible',
      returnDate,
      returnTime,
      car,
      fareResult: calculatedFare,
      customerName: finalCustomerName,
      customerPhone: finalCustomerPhone,
      pickupAddress: pickupAddress.trim() || 'Same as pickup area',
      specialNotes,
      createdAt: new Date().toISOString()
    });
  };

  return (
    <div id="booking-section" className="scroll-mt-20">
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-200/80 overflow-hidden">
        {/* Form Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider mb-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Guaranteed On-Time Cab
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                Book Your Gujarat Ride
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
                Instant Fare Calculation • All-Inclusive Transparent Billing • 1-Tap WhatsApp Booking
              </p>
            </div>

            {/* Prominent Pill-Shaped Trip Type Tabs */}
            <div className="bg-slate-800/95 p-1 rounded-full flex items-center border border-slate-700/80 shadow-inner shrink-0 self-start sm:self-auto gap-0.5 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  setTripType('one-way');
                  if (selectedCarId === 'innova' || selectedCarId === 'innova-crysta') {
                    setSelectedCarId('sedan');
                  }
                }}
                className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-black transition-all cursor-pointer ${
                  tripType === 'one-way'
                    ? 'bg-amber-500 text-slate-950 shadow-md scale-[1.02]'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <span>➡️ One Way</span>
              </button>
              <button
                type="button"
                onClick={() => setTripType('round-trip')}
                className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-black transition-all cursor-pointer ${
                  tripType === 'round-trip'
                    ? 'bg-amber-500 text-slate-950 shadow-md scale-[1.02]'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <span>🔄 Round Trip</span>
                <span className="hidden xs:inline text-[9px] bg-slate-950/40 text-amber-200 px-1.5 py-0.5 rounded-full font-bold">
                  Best Value
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setTripType('local');
                  if (selectedCarId === 'innova') {
                    setSelectedCarId('innova-crysta');
                  }
                }}
                className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-black transition-all cursor-pointer ${
                  tripType === 'local'
                    ? 'bg-amber-500 text-slate-950 shadow-md scale-[1.02]'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <span>📍 Local</span>
                <span className="hidden xs:inline text-[9px] bg-slate-950/40 text-amber-200 px-1.5 py-0.5 rounded-full font-bold">
                  Rental
                </span>
              </button>
            </div>
          </div>
        </div>

        <form onSubmit={handleWhatsAppBooking} className="p-4 sm:p-6 space-y-5 sm:space-y-6">
          {/* STEP 1: Locations (Pickup & Destination / Local Package) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-amber-500" />
                {tripType === 'local' ? '1. Pickup City & Rental Package' : '1. Select Route (Pickup & Drop)'}
              </label>
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer bg-amber-50 hover:bg-amber-100 px-2.5 py-0.5 rounded-lg transition-colors"
              >
                <Navigation className="w-3 h-3 text-amber-600" />
                Use My Location
              </button>
            </div>

            {tripType === 'local' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start">
                {/* Pickup Input */}
                <div ref={pickupContainerRef} className="relative">
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Pickup City / Area in Gujarat
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-3 ring-emerald-100"></span>
                    </div>
                    <input
                      type="text"
                      value={pickupSearch}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPickupSearch(val);
                        setShowPickupDropdown(true);
                        if (val.trim().length === 0) {
                          setPickupCity(null);
                          return;
                        }
                        const match = findCityByName(val);
                        if (match) {
                          setPickupCity(match);
                        } else if (val.trim().length >= 2) {
                          setPickupCity({ name: val.trim() });
                        } else {
                          setPickupCity(null);
                        }
                      }}
                      onFocus={() => setShowPickupDropdown(true)}
                      placeholder="Enter pickup city / area"
                      className="w-full pl-8 pr-8 py-2.5 sm:py-3 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-amber-500 rounded-xl text-slate-900 font-semibold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-xs sm:text-sm transition-all"
                    />
                    {pickupSearch && (
                      <button
                        type="button"
                        onClick={() => {
                          setPickupSearch('');
                          setPickupCity(null);
                          setShowPickupDropdown(true);
                        }}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 text-xs"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  {formErrors.pickup && (
                    <p className="text-red-500 text-xs mt-1 font-medium">{formErrors.pickup}</p>
                  )}

                  {/* Pickup Dropdown Suggestions */}
                  {showPickupDropdown && (
                    <div className="absolute z-30 left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden max-h-60 overflow-y-auto">
                      <div className="p-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 border-b border-slate-100">
                        Popular Gujarat Cities & Airports
                      </div>
                      {filterCities(pickupSearch).map((city) => (
                        <button
                          key={city.id}
                          type="button"
                          onClick={() => {
                            setPickupCity(city);
                            setPickupSearch(city.name);
                            setShowPickupDropdown(false);
                          }}
                          className="w-full text-left px-3.5 py-2 hover:bg-amber-50 flex items-center justify-between text-xs sm:text-sm transition-colors border-b border-slate-50 last:border-0"
                        >
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <div>
                              <span className="font-semibold text-slate-800">{city.name}</span>
                              <span className="text-xs text-slate-400 ml-1.5">({city.district})</span>
                            </div>
                          </div>
                          {city.isAirportOrStation && (
                            <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                              Airport/Station
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Rental Package Dropdown */}
                <div className="relative">
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Select Rental Package
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Clock className="w-4 h-4 text-amber-500" />
                    </div>
                    <select
                      value={localPackageId}
                      onChange={(e) => setLocalPackageId(e.target.value as LocalPackageId)}
                      className="w-full pl-9 pr-9 py-2.5 sm:py-3 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-amber-500 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-xs sm:text-sm transition-all appearance-none cursor-pointer"
                    >
                      {LOCAL_PACKAGES.map((pkg) => (
                        <option key={pkg.id} value={pkg.id}>
                          {pkg.label}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1 font-medium">
                    <span className="text-emerald-700 font-bold">✓ Fuel & Driver Included</span>
                    <span className="text-slate-400">Unlimited City Stops</span>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-11 gap-2.5 items-center">
              {/* Pickup Input */}
              <div ref={pickupContainerRef} className="md:col-span-5 relative">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-3 ring-emerald-100"></span>
                  </div>
                  <input
                    type="text"
                    value={pickupSearch}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPickupSearch(val);
                      setShowPickupDropdown(true);
                      if (val.trim().length === 0) {
                        setPickupCity(null);
                        return;
                      }
                      const match = findCityByName(val);
                      if (match) {
                        setPickupCity(match);
                      } else if (val.trim().length >= 2) {
                        setPickupCity({ name: val.trim() });
                      } else {
                        setPickupCity(null);
                      }
                    }}
                    onFocus={() => setShowPickupDropdown(true)}
                    placeholder="Enter pickup city / area"
                    className="w-full pl-8 pr-8 py-2.5 sm:py-3 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-amber-500 rounded-xl text-slate-900 font-semibold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-xs sm:text-sm transition-all"
                  />
                  {pickupSearch && (
                    <button
                      type="button"
                      onClick={() => {
                        setPickupSearch('');
                        setPickupCity(null);
                        setShowPickupDropdown(true);
                      }}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>
                {formErrors.pickup && (
                  <p className="text-red-500 text-xs mt-1 font-medium">{formErrors.pickup}</p>
                )}

                {/* Pickup Dropdown Suggestions */}
                {showPickupDropdown && (
                  <div className="absolute z-30 left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden max-h-60 overflow-y-auto">
                    <div className="p-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 border-b border-slate-100">
                      Popular Gujarat Cities & Airports
                    </div>
                    {filterCities(pickupSearch).map((city) => (
                      <button
                        key={city.id}
                        type="button"
                        onClick={() => {
                          setPickupCity(city);
                          setPickupSearch(city.name);
                          setShowPickupDropdown(false);
                        }}
                        className="w-full text-left px-3.5 py-2 hover:bg-amber-50 flex items-center justify-between text-xs sm:text-sm transition-colors border-b border-slate-50 last:border-0"
                      >
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <div>
                            <span className="font-semibold text-slate-800">{city.name}</span>
                            <span className="text-xs text-slate-400 ml-1.5">({city.district})</span>
                          </div>
                        </div>
                        {city.isAirportOrStation && (
                          <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                            Airport/Station
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Swap Button */}
              <div className="md:col-span-1 flex justify-center">
                <button
                  type="button"
                  onClick={handleSwapLocations}
                  title="Swap Pickup and Drop"
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-100 hover:bg-amber-100 border border-slate-200 text-slate-600 hover:text-amber-700 flex items-center justify-center transition-all hover:rotate-180 duration-300 shadow-xs cursor-pointer"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Destination Input */}
              <div ref={destContainerRef} className="md:col-span-5 relative">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 ring-3 ring-red-100"></span>
                  </div>
                  <input
                    type="text"
                    value={destinationSearch}
                    onChange={(e) => {
                      const val = e.target.value;
                      setDestinationSearch(val);
                      setShowDestDropdown(true);
                      if (val.trim().length === 0) {
                        setDestinationCity(null);
                        return;
                      }
                      const match = findCityByName(val);
                      if (match) {
                        setDestinationCity(match);
                      } else if (val.trim().length >= 2) {
                        setDestinationCity({ name: val.trim() });
                      } else {
                        setDestinationCity(null);
                      }
                    }}
                    onFocus={() => setShowDestDropdown(true)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (googleDestPredictions.length > 0) {
                          handleSelectGooglePlace(googleDestPredictions[0]);
                        } else {
                          const match = findCityByName(destinationSearch);
                          if (match) {
                            setDestinationCity(match);
                            setDestinationSearch(match.name);
                            setShowDestDropdown(false);
                          } else if (destinationSearch.trim().length >= 2) {
                            setDestinationCity({ name: destinationSearch.trim() });
                            setShowDestDropdown(false);
                          }
                        }
                      }
                    }}
                    placeholder="Enter destination city / place"
                    className="w-full pl-8 pr-8 py-2.5 sm:py-3 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-amber-500 rounded-xl text-slate-900 font-semibold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-xs sm:text-sm transition-all"
                  />
                  {destinationSearch && (
                    <button
                      type="button"
                      onClick={() => {
                        setDestinationSearch('');
                        setDestinationCity(null);
                        setGoogleDestPredictions([]);
                        setShowDestDropdown(true);
                      }}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>
                {formErrors.destination && (
                  <p className="text-red-500 text-xs mt-1 font-medium">{formErrors.destination}</p>
                )}

                {/* Destination Dropdown */}
                {showDestDropdown && (
                  <div className="absolute z-30 left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden max-h-64 overflow-y-auto">
                    {/* Dynamic Google Maps Places Results */}
                    {googleDestPredictions.length > 0 && (
                      <div>
                        <div className="p-2 text-[11px] font-bold text-emerald-800 uppercase tracking-wider bg-emerald-50 border-b border-emerald-100 flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            Google Maps Places
                          </span>
                          <span className="text-[10px] text-emerald-600 font-medium">Verified Location</span>
                        </div>
                        {googleDestPredictions.map((item) => (
                          <button
                            key={item.placeId}
                            type="button"
                            onClick={() => handleSelectGooglePlace(item)}
                            className="w-full text-left px-3.5 py-2 hover:bg-amber-50 flex items-center justify-between text-xs sm:text-sm transition-colors border-b border-slate-50 last:border-0 cursor-pointer"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <div className="truncate">
                                <span className="font-semibold text-slate-900 block truncate">{item.mainText}</span>
                                {item.secondaryText && (
                                  <span className="text-xs text-slate-500 block truncate">{item.secondaryText}</span>
                                )}
                              </div>
                            </div>
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold shrink-0 ml-2">
                              Select
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Google Searching Loading State */}
                    {isSearchingGoogle && googleDestPredictions.length === 0 && (
                      <div className="p-3 text-xs text-slate-500 flex items-center justify-center gap-2 bg-slate-50 border-b border-slate-100">
                        <div className="w-3.5 h-3.5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                        <span>Searching Google Maps places...</span>
                      </div>
                    )}

                    {/* Popular Gujarat Destinations */}
                    {filterCities(destinationSearch).length > 0 && (
                      <div>
                        <div className="p-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 border-b border-slate-100">
                          {googleDestPredictions.length > 0 ? 'Gujarat Routes Database' : 'Popular Gujarat Destinations'}
                        </div>
                        {filterCities(destinationSearch).map((city) => (
                          <button
                            key={city.id}
                            type="button"
                            onClick={() => {
                              setDestinationCity(city);
                              setDestinationSearch(city.name);
                              setShowDestDropdown(false);
                            }}
                            className="w-full text-left px-3.5 py-2 hover:bg-amber-50 flex items-center justify-between text-xs sm:text-sm transition-colors border-b border-slate-50 last:border-0 cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                              <div>
                                <span className="font-semibold text-slate-800">{city.name}</span>
                                <span className="text-xs text-slate-400 ml-1.5">({city.district})</span>
                              </div>
                            </div>
                            {city.isAirportOrStation && (
                              <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                                Airport/Station
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

                {/* Quick Destination Chips */}
                <div className="flex items-center gap-1.5 flex-wrap pt-0.5 text-xs">
                  <span className="text-slate-400 font-semibold text-[11px]">Quick:</span>
                  {popularChips.map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => {
                        const match = findCityByName(chip);
                        if (match) {
                          setDestinationCity(match);
                          setDestinationSearch(match.name);
                        }
                      }}
                      className="bg-slate-100 hover:bg-amber-100 hover:text-amber-800 text-slate-700 px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer border border-slate-200/60"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* STEP 2: Date & Time Selectors */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-amber-500" />
              2. Travel Date & Pickup Time
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {/* Pickup Date */}
              <div
                onClick={(e) => {
                  if (e.target instanceof HTMLInputElement) return;
                  const input = e.currentTarget.querySelector('input');
                  if (input) {
                    try {
                      input.showPicker?.();
                    } catch {
                      input.focus();
                    }
                  }
                }}
                className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 focus-within:border-amber-500 transition-colors cursor-pointer select-none [touch-action:manipulation]"
              >
                <span className="text-[10px] font-bold text-slate-500 block mb-0.5 pointer-events-none">
                  Pickup Date
                </span>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400 shrink-0 pointer-events-none" />
                  <input
                    type="date"
                    value={pickupDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => {
                      const newDate = e.target.value;
                      setPickupDate(newDate);
                      if (returnDate && returnDate < newDate) {
                        setReturnDate(newDate);
                      }
                      if (formErrors.pickupDate) {
                        setFormErrors((prev) => ({ ...prev, pickupDate: '' }));
                      }
                    }}
                    onClick={(e) => {
                      try {
                        e.currentTarget.showPicker?.();
                      } catch {}
                    }}
                    placeholder="Select Date"
                    className="w-full min-h-[28px] bg-transparent font-semibold text-xs sm:text-sm text-slate-800 focus:outline-none cursor-pointer [touch-action:manipulation]"
                  />
                </div>
                {formErrors.pickupDate && (
                  <p className="text-red-500 text-xs mt-0.5 font-medium">{formErrors.pickupDate}</p>
                )}
              </div>

              {/* Pickup Time */}
              <div
                onClick={(e) => {
                  if (e.target instanceof HTMLInputElement) return;
                  const input = e.currentTarget.querySelector('input');
                  if (input) {
                    try {
                      input.showPicker?.();
                    } catch {
                      input.focus();
                    }
                  }
                }}
                className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 focus-within:border-amber-500 transition-colors cursor-pointer select-none [touch-action:manipulation]"
              >
                <span className="text-[10px] font-bold text-slate-500 block mb-0.5 pointer-events-none">
                  Pickup Time
                </span>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400 shrink-0 pointer-events-none" />
                  <input
                    type="time"
                    value={pickupTime}
                    onChange={(e) => {
                      setPickupTime(e.target.value);
                      if (formErrors.pickupTime) {
                        setFormErrors((prev) => ({ ...prev, pickupTime: '' }));
                      }
                    }}
                    onClick={(e) => {
                      try {
                        e.currentTarget.showPicker?.();
                      } catch {}
                    }}
                    placeholder="Select Time"
                    className="w-full min-h-[28px] bg-transparent font-semibold text-xs sm:text-sm text-slate-800 focus:outline-none cursor-pointer [touch-action:manipulation]"
                  />
                </div>
                {formErrors.pickupTime && (
                  <p className="text-red-500 text-xs mt-0.5 font-medium">{formErrors.pickupTime}</p>
                )}
              </div>

              {/* Return Date (only for Round Trip) */}
              {tripType === 'round-trip' ? (
                <>
                  <div
                    onClick={(e) => {
                      if (e.target instanceof HTMLInputElement) return;
                      const input = e.currentTarget.querySelector('input');
                      if (input) {
                        try {
                          input.showPicker?.();
                        } catch {
                          input.focus();
                        }
                      }
                    }}
                    className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 focus-within:border-amber-500 transition-colors cursor-pointer select-none [touch-action:manipulation]"
                  >
                    <span className="text-[10px] font-bold text-slate-500 block mb-0.5 pointer-events-none">
                      Return Date
                    </span>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-amber-600 shrink-0 pointer-events-none" />
                      <input
                        type="date"
                        value={returnDate}
                        min={pickupDate || new Date().toISOString().split('T')[0]}
                        onChange={(e) => {
                          setReturnDate(e.target.value);
                          if (formErrors.returnDate) {
                            setFormErrors((prev) => ({ ...prev, returnDate: '' }));
                          }
                        }}
                        onClick={(e) => {
                          try {
                            e.currentTarget.showPicker?.();
                          } catch {}
                        }}
                        placeholder="Select Return Date"
                        className="w-full min-h-[28px] bg-transparent font-semibold text-xs sm:text-sm text-slate-800 focus:outline-none cursor-pointer [touch-action:manipulation]"
                      />
                    </div>
                    {formErrors.returnDate && (
                      <p className="text-red-500 text-xs mt-0.5 font-medium">{formErrors.returnDate}</p>
                    )}
                  </div>

                  <div
                    onClick={(e) => {
                      if (e.target instanceof HTMLInputElement) return;
                      const input = e.currentTarget.querySelector('input');
                      if (input) {
                        try {
                          input.showPicker?.();
                        } catch {
                          input.focus();
                        }
                      }
                    }}
                    className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 focus-within:border-amber-500 transition-colors cursor-pointer select-none [touch-action:manipulation]"
                  >
                    <span className="text-[10px] font-bold text-slate-500 block mb-0.5 pointer-events-none">
                      Return Time
                    </span>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-600 shrink-0 pointer-events-none" />
                      <input
                        type="time"
                        value={returnTime}
                        onChange={(e) => {
                          setReturnTime(e.target.value);
                          if (formErrors.returnTime) {
                            setFormErrors((prev) => ({ ...prev, returnTime: '' }));
                          }
                        }}
                        onClick={(e) => {
                          try {
                            e.currentTarget.showPicker?.();
                          } catch {}
                        }}
                        placeholder="Select Return Time"
                        className="w-full min-h-[28px] bg-transparent font-semibold text-xs sm:text-sm text-slate-800 focus:outline-none cursor-pointer [touch-action:manipulation]"
                      />
                    </div>
                    {formErrors.returnTime && (
                      <p className="text-red-500 text-xs mt-0.5 font-medium">{formErrors.returnTime}</p>
                    )}
                  </div>
                </>
              ) : (
                <div className="sm:col-span-2 bg-amber-50/60 border border-amber-200/80 rounded-xl p-2.5 flex items-center gap-2.5">
                  <Info className="w-4 h-4 text-amber-600 shrink-0" />
                  <p className="text-xs text-amber-900">
                    <strong className="font-semibold">One-Way Drop:</strong> Cab drops you at your
                    destination. Driver will not wait for return.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* STEP 3: Car Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Car className="w-4 h-4 text-amber-500" />
                3. Choose Your Vehicle
              </label>
              <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                All vehicles are clean, AC & Fastag equipped
              </span>
            </div>

            {formErrors.car && (
              <p className="text-red-500 text-xs font-semibold -mt-1">
                {formErrors.car}
              </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {availableCars.map((car) => {
                const isSelected = selectedCarId === car.id;
                const isVadodaraAhmedabad = isVadodaraAhmedabadRoute(
                  pickupCity || (pickupSearch ? { name: pickupSearch } : null),
                  destinationCity || (destinationSearch ? { name: destinationSearch } : null)
                );
                const isOneWayFixedRoute = tripType === 'one-way' && isVadodaraAhmedabad && (car.id === 'sedan' || car.id === 'ertiga');

                const carFare =
                  tripType === 'local'
                    ? calculateLocalPackageFare(car.id, localPackageId)
                    : isRouteReady && isDatesReady && distanceKm > 0
                    ? calculateTripFare(
                        distanceKm,
                        car.id,
                        tripType === 'round-trip',
                        pickupDate,
                        returnDate,
                        pickupCity || (pickupSearch ? { name: pickupSearch } : null),
                        destinationCity || (destinationSearch ? { name: destinationSearch } : null)
                      )
                    : null;

                return (
                  <div
                    key={car.id}
                    onClick={() => setSelectedCarId(car.id)}
                    className={`relative p-4 sm:p-5 rounded-[14px] bg-white transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-2 border-amber-500 ring-2 ring-amber-500/20 shadow-md bg-amber-50/15'
                        : 'border border-slate-200/90 shadow-sm hover:shadow-md hover:border-slate-300'
                    }`}
                  >
                    {/* Badge */}
                    {car.badge && (
                      <span
                        className={`absolute -top-2.5 right-4 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-xs ${
                          car.id === 'sedan'
                            ? 'bg-amber-500 text-slate-950'
                            : car.id === 'ertiga'
                            ? 'bg-emerald-600 text-white'
                            : car.id === 'innova'
                            ? 'bg-blue-600 text-white'
                            : 'bg-indigo-600 text-white'
                        }`}
                      >
                        {car.badge}
                      </span>
                    )}

                    <div>
                      {/* Top car summary */}
                      <div className="flex items-start justify-between gap-3 mb-2.5">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-black text-slate-900 leading-snug">
                              {car.name}
                            </h3>
                            {isSelected && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                                <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 fill-amber-100" />
                                Selected
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 font-medium">{car.models}</p>
                        </div>
                      </div>

                      {/* Prominent Pricing Block */}
                      <div className="my-2.5 py-2.5 px-3 bg-slate-50/90 rounded-xl border border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                        <div>
                          <span className="text-[10px] text-slate-500 font-medium block">
                            {tripType === 'local' ? 'Package Fare' : 'Total Estimated Fare'}
                          </span>
                          {carFare ? (
                            <div className="text-2xl sm:text-[26px] font-black text-slate-950 tracking-tight leading-none mt-0.5">
                              ₹{carFare.estimatedTotal.toLocaleString('en-IN')}
                            </div>
                          ) : isOneWayFixedRoute ? (
                            <div className="text-2xl sm:text-[26px] font-black text-slate-950 tracking-tight leading-none mt-0.5">
                              ₹{(car.id === 'sedan' ? 1799 : 2499).toLocaleString('en-IN')}
                            </div>
                          ) : (
                            <div className="text-xs font-semibold text-slate-500 mt-0.5">
                              Enter route to calculate
                            </div>
                          )}
                        </div>

                        {/* Prominent elegant badge */}
                        <div>
                          {tripType === 'local' ? (
                            <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200/90 px-2.5 py-1 rounded-md text-[11px] font-bold shadow-xs">
                              <span>✓ {LOCAL_PACKAGES.find((p) => p.id === localPackageId)?.label || 'Package'} Included</span>
                            </div>
                          ) : tripType === 'one-way' ? (
                            carFare?.isFixedFare || isOneWayFixedRoute ? (
                              <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200/90 px-2.5 py-1 rounded-full text-[11px] font-bold shadow-xs">
                                <span>All Inclusive Fixed Fare</span>
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200/90 px-2.5 py-1 rounded-full text-[11px] font-bold shadow-xs">
                                <span>✔ Fuel & Driver Allowance Included</span>
                              </div>
                            )
                          ) : (
                            <div className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-900 border border-amber-200/90 px-2.5 py-1 rounded-md text-[11px] font-bold shadow-xs">
                              <span>✓ Toll & Parking Extra as per actuals</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* One-way specific sub-note */}
                      {tripType === 'one-way' && (
                        <div className={`mb-2.5 py-1.5 px-2.5 rounded-xl text-[11px] font-medium flex items-center gap-1.5 ${
                          carFare?.isFixedFare || isOneWayFixedRoute
                            ? 'bg-emerald-50/70 border border-emerald-200/60 text-emerald-800'
                            : 'bg-slate-100/90 border border-slate-200/80 text-slate-700'
                        }`}>
                          {carFare?.isFixedFare || isOneWayFixedRoute ? (
                            <span>⚡ All Inclusive - Tolls & Taxes Included</span>
                          ) : (
                            <span>⚡ Toll, Parking & State Border Entry Tax extra as per actual receipts / FASTag</span>
                          )}
                        </div>
                      )}

                      {/* For local trips, show all 3 package options with clear pricing comparison */}
                      {tripType === 'local' && LOCAL_PRICING[car.id] && (
                        <div className="my-2.5">
                          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
                            <span>Package Options</span>
                            <span className="text-amber-700 font-semibold normal-case">Tap to select package</span>
                          </div>
                          <div className="grid grid-cols-3 gap-1.5 text-center">
                            {LOCAL_PACKAGES.map((pkg) => {
                              const isPkgActive = localPackageId === pkg.id;
                              const pkgFare = LOCAL_PRICING[car.id].packages[pkg.id];
                              return (
                                <button
                                  key={pkg.id}
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setLocalPackageId(pkg.id);
                                    setSelectedCarId(car.id);
                                  }}
                                  className={`px-1.5 py-1.5 rounded-lg border text-xs transition-all cursor-pointer ${
                                    isPkgActive
                                      ? 'bg-amber-500 text-slate-950 font-black border-amber-600 shadow-xs ring-1 ring-amber-600/30'
                                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold border-slate-200'
                                  }`}
                                >
                                  <div className="text-[10px] leading-tight opacity-80">{pkg.label}</div>
                                  <div className="text-xs sm:text-sm font-extrabold mt-0.5">
                                    ₹{pkgFare.toLocaleString('en-IN')}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Extra KM and Extra Hour Charges for Local Packages (Requirement 4) */}
                      {tripType === 'local' && LOCAL_PRICING[car.id] && (
                        <div className="mb-2.5 py-2 px-3 bg-amber-500/10 border border-amber-500/25 rounded-xl flex items-center justify-between text-xs font-bold text-amber-950 shadow-xs">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
                            Extra KM: <span className="text-amber-950 font-extrabold text-xs sm:text-sm">₹{LOCAL_PRICING[car.id].extraKmRate}/km</span>
                          </span>
                          <span className="text-amber-400 font-normal">|</span>
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
                            Extra Hour: <span className="text-amber-950 font-extrabold text-xs sm:text-sm">₹{LOCAL_PRICING[car.id].extraHourRate}/hr</span>
                          </span>
                        </div>
                      )}

                      {/* Specs Badges */}
                      <div className="flex items-center gap-2 text-xs text-slate-600 mb-3 flex-wrap">
                        <span className="inline-flex items-center gap-1 bg-slate-100/90 px-2 py-1 rounded-md font-medium text-[11px]">
                          <Users className="w-3.5 h-3.5 text-slate-500" />
                          {car.capacity}
                        </span>
                        <span className="inline-flex items-center gap-1 bg-slate-100/90 px-2 py-1 rounded-md font-medium text-[11px]">
                          <Briefcase className="w-3.5 h-3.5 text-slate-500" />
                          {car.luggage}
                        </span>
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md font-medium text-[11px]">
                          {car.ac}
                        </span>
                      </div>

                      {/* Feature Bullet points */}
                      <ul className="text-xs text-slate-600 space-y-1 border-t border-slate-100 pt-2.5">
                        {car.features.slice(0, 3).map((feat, idx) => (
                          <li key={idx} className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
                            <span className="text-[11px] sm:text-xs text-slate-600">{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Bottom Actions: Select & 1-Tap Book on WhatsApp */}
                    <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCarId(car.id);
                        }}
                        className={`text-xs font-bold px-3 py-2 rounded-xl transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {isSelected ? '✓ Selected' : 'Select'}
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQuickWhatsAppBook(car);
                        }}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-extrabold px-3 py-2 rounded-xl text-xs sm:text-sm shadow-sm hover:shadow transition-all cursor-pointer"
                        title="Book directly on WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4 fill-white shrink-0" />
                        <span>Book on WhatsApp</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* STEP 4: Google Maps Route & Distance Display (Hidden for Local Rental) */}
          {tripType !== 'local' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Navigation className="w-4 h-4 text-amber-500" />
                  4. Google Maps Route & Highway Distance
                </label>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                  Verified Route
                </span>
              </div>

              <MapRouteView
                origin={pickupCity}
                destination={destinationCity}
                distanceKm={distanceKm}
                durationText={drivingDurationText || fareResult?.estimatedDurationText || 'Calculated on Route'}
                isRoundTrip={tripType === 'round-trip'}
                isRouteReady={isRouteReady}
                directionsResult={directionsResult}
                onRouteCalculated={handleRouteCalculated}
              />
            </div>
          )}

          {/* Fare Calculation & Summary Box (Appears only when fare is calculated) */}
          {isFareReady && selectedCar && fareResult ? (
            <div className="bg-gradient-to-br from-amber-50 via-orange-50/40 to-amber-50/20 rounded-3xl p-6 border-2 border-amber-300/80 shadow-md">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                {/* Left Breakdown */}
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-1.5 bg-amber-200/70 text-amber-900 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    <FileText className="w-3.5 h-3.5 text-amber-800" />
                    {tripType === 'local' ? 'Local Rental Package Summary' : 'Transparent Fare Breakdown'}
                  </div>
                  <h3 className="text-xl font-black text-slate-900">
                    {selectedCar.name} • {tripType === 'local' ? `Local Rental (${fareResult.packageName})` : tripType === 'round-trip' ? 'Round Trip' : 'One Way'}
                  </h3>

                  {tripType === 'local' ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                      <div className="bg-white/90 p-2.5 rounded-xl border border-amber-200">
                        <span className="text-slate-500 block">Selected Package</span>
                        <span className="font-bold text-slate-800 text-sm">{fareResult.packageName}</span>
                      </div>

                      <div className="bg-white/90 p-2.5 rounded-xl border border-amber-200">
                        <span className="text-slate-500 block">Included Coverage</span>
                        <span className="font-bold text-slate-800 text-sm">
                          {fareResult.packageHours} hrs / {fareResult.packageKm} km
                        </span>
                      </div>

                      <div className="bg-white/90 p-2.5 rounded-xl border border-amber-200">
                        <span className="text-slate-500 block">Selected Vehicle</span>
                        <span className="font-bold text-slate-800 text-sm truncate block">
                          {selectedCar.name}
                        </span>
                      </div>

                      <div className="bg-white/90 p-2.5 rounded-xl border border-amber-200">
                        <span className="text-slate-500 block">Package Base Fare</span>
                        <span className="font-bold text-slate-800 text-sm">
                          ₹{fareResult.baseFare.toLocaleString('en-IN')}
                        </span>
                      </div>

                      <div className="bg-white/90 p-2.5 rounded-xl border border-amber-200">
                        <span className="text-slate-500 block">Extra KM Charge</span>
                        <span className="font-bold text-slate-800 text-sm">
                          ₹{fareResult.extraKmRate}/km
                        </span>
                      </div>

                      <div className="bg-white/90 p-2.5 rounded-xl border border-amber-200">
                        <span className="text-slate-500 block">Extra Hour Charge</span>
                        <span className="font-bold text-slate-800 text-sm">
                          ₹{fareResult.extraHourRate}/hr
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                      <div className="bg-white/90 p-2.5 rounded-xl border border-amber-200">
                        <span className="text-slate-500 block">Distance (One Way)</span>
                        <span className="font-bold text-slate-800 text-sm">{distanceKm} km</span>
                      </div>

                      <div className="bg-white/90 p-2.5 rounded-xl border border-amber-200">
                        <span className="text-slate-500 block">Billable Distance</span>
                        <span className="font-bold text-slate-800 text-sm">
                          {fareResult.totalBillableKm} km
                          {fareResult.minimumKmApplied && (
                            <span className="text-[10px] text-amber-700 block font-normal">
                              (Min. limit applied)
                            </span>
                          )}
                        </span>
                      </div>

                      <div className="bg-white/90 p-2.5 rounded-xl border border-amber-200">
                        <span className="text-slate-500 block">Selected Vehicle</span>
                        <span className="font-bold text-slate-800 text-sm truncate block">
                          {selectedCar.name}
                        </span>
                      </div>

                      <div className="bg-white/90 p-2.5 rounded-xl border border-amber-200">
                        <span className="text-slate-500 block">Base Vehicle Fare</span>
                        <span className="font-bold text-slate-800 text-sm">
                          ₹{fareResult.baseFare.toLocaleString('en-IN')}
                        </span>
                      </div>

                      <div className="bg-white/90 p-2.5 rounded-xl border border-amber-200">
                        <span className="text-slate-500 block">Driver Allowance</span>
                        <span className="font-bold text-slate-800 text-sm">
                          ₹{fareResult.driverAllowance.toLocaleString('en-IN')}{' '}
                          {tripType === 'round-trip' ? `(${fareResult.numberOfDays}d)` : '(₹0 One Way)'}
                        </span>
                      </div>

                      <div className="bg-white/90 p-2.5 rounded-xl border border-amber-200">
                        <span className="text-slate-500 block">Estimated Travel Time</span>
                        <span className="font-bold text-slate-800 text-sm">
                          ~{fareResult.estimatedDurationText}
                        </span>
                      </div>
                    </div>
                  )}

                  <p className="text-xs font-semibold">
                    {tripType === 'local' ? (
                      <span className="inline-flex items-center gap-1.5 text-emerald-900 bg-emerald-100/90 px-3 py-1.5 rounded-lg border border-emerald-300">
                        Tag: Fuel & Chauffeur Included (Toll & Parking Extra as per actuals)
                      </span>
                    ) : tripType === 'round-trip' ? (
                      <span className="inline-flex items-center gap-1.5 text-amber-900 bg-amber-100/90 px-3 py-1.5 rounded-lg border border-amber-300">
                        Tag: Toll & Parking Extra as per actuals
                      </span>
                    ) : fareResult.isFixedFare ? (
                      <span className="inline-flex items-center gap-1.5 text-emerald-900 bg-emerald-100/90 px-3 py-1.5 rounded-lg border border-emerald-300">
                        All Inclusive Fixed Fare (Tolls & Taxes Included)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-emerald-900 bg-emerald-100/90 px-3 py-1.5 rounded-lg border border-emerald-300">
                        ✔ Fuel & Driver Allowance Included (Toll, Parking & State Tax Extra)
                      </span>
                    )}
                  </p>
                </div>

                {/* Right Total Big Badge */}
                <div className="bg-slate-950 text-white p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col items-center justify-center text-center min-w-[240px]">
                  <span className="text-xs text-amber-400 font-bold uppercase tracking-wider mb-1">
                    {tripType === 'local' ? 'Package Fare' : 'Estimated Total Fare'}
                  </span>
                  <div className="text-3xl sm:text-4xl font-black text-amber-400">
                    ₹{fareResult.estimatedTotal.toLocaleString('en-IN')}
                  </div>
                  <span className="text-[11px] text-slate-300 mt-1 font-medium">
                    {tripType === 'local'
                      ? 'Fuel & Chauffeur Included (Toll & Parking extra)'
                      : tripType === 'round-trip'
                      ? 'Toll & Parking Extra as per actuals'
                      : fareResult.isFixedFare
                      ? 'All Inclusive - Tolls & Taxes Included'
                      : 'Fuel & Driver Allowance Included'}
                  </span>
                  <div className="mt-3 text-[11px] bg-slate-900 text-emerald-400 px-3 py-1 rounded-full font-medium flex items-center gap-1 border border-slate-800">
                    <Shield className="w-3 h-3 text-emerald-400" />
                    Zero Cancellation Fee
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {/* Passenger Details & WhatsApp Booking Action */}
          <div
            ref={passengerDetailsRef}
            className={`space-y-4 pt-2 transition-all duration-300 rounded-2xl ${
              highlightPassengerStep
                ? 'ring-2 ring-emerald-500 bg-emerald-50/70 p-4 shadow-lg'
                : ''
            }`}
          >
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4 text-amber-500" />
                {tripType === 'local' ? '4. Passenger Details for WhatsApp Confirmation' : '5. Passenger Details for WhatsApp Confirmation'}
              </label>
              {selectedCar && (
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/80 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                  🚗 Vehicle: {selectedCar.name}
                </span>
              )}
            </div>

            {highlightPassengerStep && (
              <div className="bg-emerald-600 text-white px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md animate-pulse">
                <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
                <span>
                  Vehicle selected! Enter passenger name & mobile below to complete your WhatsApp booking.
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Your Full Name
                </label>
                <input
                  ref={nameInputRef}
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 focus:bg-white border border-slate-200 focus:border-amber-500 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-sm transition-all"
                />
                {formErrors.name && (
                  <p className="text-red-500 text-xs mt-1 font-medium">{formErrors.name}</p>
                )}
              </div>

              {/* Mobile Number */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  WhatsApp / Mobile Number
                </label>
                <div className="flex items-center">
                  <span className="bg-slate-100 border border-r-0 border-slate-200 px-3.5 py-3 rounded-l-xl text-sm font-bold text-slate-600">
                    +91
                  </span>
                  <input
                    ref={phoneInputRef}
                    type="tel"
                    value={customerPhone}
                    maxLength={10}
                    onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-4 py-3 bg-slate-50 focus:bg-white border border-slate-200 focus:border-amber-500 rounded-r-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-sm transition-all"
                  />
                </div>
                {formErrors.phone && (
                  <p className="text-red-500 text-xs mt-1 font-medium">{formErrors.phone}</p>
                )}
              </div>

              {/* Exact Pickup Address / Landmark */}
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Exact Pickup Landmark / Street Address (Optional)
                </label>
                <input
                  type="text"
                  value={pickupAddress}
                  onChange={(e) => setPickupAddress(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 focus:bg-white border border-slate-200 focus:border-amber-500 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-sm transition-all"
                />
              </div>

              {/* Notes */}
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Special Instructions or Return Notes (Optional)
                </label>
                <input
                  type="text"
                  value={specialNotes}
                  onChange={(e) => setSpecialNotes(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 focus:bg-white border border-slate-200 focus:border-amber-500 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-sm transition-all"
                />
              </div>
            </div>

            {/* Prominent Action Button: Book via WhatsApp */}
            <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="submit"
                className="w-full sm:flex-1 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-extrabold py-4 px-6 rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2.5 transition-all cursor-pointer text-base sm:text-lg group"
              >
                <MessageCircle className="w-6 h-6 fill-white group-hover:scale-110 transition-transform" />
                <span>Send Booking Details to WhatsApp</span>
              </button>

              <a
                href="tel:+919773203109"
                className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 text-sm transition-colors"
              >
                <Phone className="w-4 h-4 text-emerald-600" />
                <span>Call to Inquire</span>
              </a>
            </div>

            <div className="flex items-center justify-center gap-4 text-slate-500 text-xs pt-2">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Instant WhatsApp Reply
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                No Advance Required
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Fastag Vehicles
              </span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
