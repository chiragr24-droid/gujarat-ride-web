export interface CityLocation {
  id: string;
  name: string;
  district: string;
  lat: number;
  lng: number;
  popularSpots?: string[];
  isAirportOrStation?: boolean;
}

export const GUJARAT_CITIES: CityLocation[] = [
  {
    id: 'amd',
    name: 'Ahmedabad',
    district: 'Ahmedabad',
    lat: 23.0225,
    lng: 72.5714,
    popularSpots: ['Ahmedabad Airport (AMD)', 'Kalupur Railway Station', 'SG Highway', 'Maninagar', 'Prahlad Nagar', 'Bopal']
  },
  {
    id: 'amd-airport',
    name: 'Ahmedabad Airport (AMD)',
    district: 'Ahmedabad',
    lat: 23.0734,
    lng: 72.6266,
    isAirportOrStation: true,
    popularSpots: ['Terminal 1 (Domestic)', 'Terminal 2 (International)']
  },
  {
    id: 'gandhinagar',
    name: 'Gandhinagar',
    district: 'Gandhinagar',
    lat: 23.2156,
    lng: 72.6369,
    popularSpots: ['Akshardham Temple', 'GIFT City', 'Infocity', 'Sector 11', 'Mahatma Mandir']
  },
  {
    id: 'vadodara',
    name: 'Vadodara (Baroda)',
    district: 'Vadodara',
    lat: 22.3072,
    lng: 73.1812,
    popularSpots: ['Vadodara Junction', 'Alkapuri', 'Manjalpur', 'Sayajigunj', 'Vadodara Airport (BDQ)']
  },
  {
    id: 'surat',
    name: 'Surat',
    district: 'Surat',
    lat: 21.1702,
    lng: 72.8311,
    popularSpots: ['Surat Railway Station', 'Surat Airport (STV)', 'Adajan', 'Vesu', 'Varachha', 'Ring Road']
  },
  {
    id: 'rajkot',
    name: 'Rajkot',
    district: 'Rajkot',
    lat: 22.3039,
    lng: 70.8022,
    popularSpots: ['Hirasar International Airport', 'Yagnik Road', 'Kalawad Road', 'Rajkot Junction', 'Madhapar']
  },
  {
    id: 'statue-of-unity',
    name: 'Statue of Unity (Kevadia/Ekta Nagar)',
    district: 'Narmada',
    lat: 21.838,
    lng: 73.7191,
    popularSpots: ['Ekta Nagar Station', 'Statue Viewing Gallery', 'Tent City 1 & 2', 'Valley of Flowers', 'Jungle Safari']
  },
  {
    id: 'somnath',
    name: 'Somnath Temple',
    district: 'Gir Somnath',
    lat: 20.888,
    lng: 70.4012,
    popularSpots: ['Somnath Jyotirlinga Temple', 'Veraval Station', 'Triveni Sangam', 'Prabhas Patan']
  },
  {
    id: 'dwarka',
    name: 'Dwarka',
    district: 'Devbhumi Dwarka',
    lat: 22.2442,
    lng: 68.9685,
    popularSpots: ['Dwarkadhish Temple', 'Bet Dwarka / Sudama Setu', 'Shivrajpur Blue Flag Beach', 'Nageshwar Jyotirlinga']
  },
  {
    id: 'bhuj',
    name: 'Bhuj (Kutch)',
    district: 'Kutch',
    lat: 23.242,
    lng: 69.6669,
    popularSpots: ['Bhuj Airport (BHJ)', 'Bhuj Station', 'White Rann (Dhordo)', 'Mandvi Beach', 'Aina Mahal']
  },
  {
    id: 'bhavnagar',
    name: 'Bhavnagar',
    district: 'Bhavnagar',
    lat: 21.7645,
    lng: 72.1519,
    popularSpots: ['Bhavnagar Airport', 'Bhavnagar Terminus', 'Ghogha Ro-Pax Ferry', 'Takhteshwar Temple']
  },
  {
    id: 'palitana',
    name: 'Palitana',
    district: 'Bhavnagar',
    lat: 21.5222,
    lng: 71.8296,
    popularSpots: ['Shatrunjaya Hill Jain Temples', 'Taleti Road', 'Palitana Station', 'Gheti']
  },
  {
    id: 'jamnagar',
    name: 'Jamnagar',
    district: 'Jamnagar',
    lat: 22.4707,
    lng: 70.0577,
    popularSpots: ['Jamnagar Airport', 'Reliance Greens', 'Lakhota Lake', 'Digjam Circle']
  },
  {
    id: 'junagadh',
    name: 'Junagadh',
    district: 'Junagadh',
    lat: 21.5222,
    lng: 70.4579,
    popularSpots: ['Girnar Ropeway', 'Uparkot Fort', 'Junagadh Junction', 'Sakkarbaug Zoo']
  },
  {
    id: 'sasan-gir',
    name: 'Sasan Gir (Lion Sanctuary)',
    district: 'Gir Somnath',
    lat: 21.134,
    lng: 70.575,
    popularSpots: ['Gir National Park Safari Reception', 'Devalia Safari Park', 'Sinh Sadan']
  },
  {
    id: 'anand',
    name: 'Anand / Vidyanagar',
    district: 'Anand',
    lat: 22.5645,
    lng: 72.9289,
    popularSpots: ['Amul Dairy Campus', 'Vallabh Vidyanagar', 'Anand Junction', 'Karamsad']
  },
  {
    id: 'nadiad',
    name: 'Nadiad',
    district: 'Kheda',
    lat: 22.6916,
    lng: 72.8634,
    popularSpots: ['Santram Mandir', 'Nadiad Junction', 'Express Highway Toll']
  },
  {
    id: 'mehsana',
    name: 'Mehsana',
    district: 'Mehsana',
    lat: 23.588,
    lng: 72.3693,
    popularSpots: ['Modhera Sun Temple', 'Mehsana Water Park', 'Mehsana Bypass']
  },
  {
    id: 'palanpur',
    name: 'Palanpur',
    district: 'Banaskantha',
    lat: 24.1724,
    lng: 72.4346,
    popularSpots: ['Palanpur Junction', 'Aroma Circle', 'Ambaji Road']
  },
  {
    id: 'ambaji',
    name: 'Ambaji (Gabbar)',
    district: 'Banaskantha',
    lat: 24.3312,
    lng: 72.8519,
    popularSpots: ['Ambaji Mata Temple', 'Gabbar Hill Ropeway', 'Mansarovar']
  },
  {
    id: 'mount-abu',
    name: 'Mount Abu (Rajasthan Border)',
    district: 'Sirohi',
    lat: 24.5925,
    lng: 72.7156,
    popularSpots: ['Nakki Lake', 'Dilwara Temples', 'Sunset Point', 'Guru Shikhar']
  },
  {
    id: 'vapi',
    name: 'Vapi / Daman',
    district: 'Valsad',
    lat: 20.3893,
    lng: 72.9106,
    popularSpots: ['Vapi GIDC', 'Vapi Station', 'Daman Devka Beach', 'Silvassa']
  },
  {
    id: 'bharuch',
    name: 'Bharuch / Ankleshwar',
    district: 'Bharuch',
    lat: 21.7051,
    lng: 72.9959,
    popularSpots: ['Golden Bridge', 'Ankleshwar GIDC', 'Bharuch Station', 'Dahej Port']
  },
  {
    id: 'porbandar',
    name: 'Porbandar',
    district: 'Porbandar',
    lat: 21.6417,
    lng: 69.6293,
    popularSpots: ['Kirti Mandir', 'Chowpati Beach', 'Porbandar Airport', 'Sudama Mandir']
  },
  {
    id: 'diu',
    name: 'Diu',
    district: 'Diu',
    lat: 20.7144,
    lng: 70.9874,
    popularSpots: ['Nagoa Beach', 'Diu Fort', 'Diu Airport', 'Ghoghla Beach']
  },
  {
    id: 'mumbai',
    name: 'Mumbai (International Airport / City)',
    district: 'Mumbai',
    lat: 19.076,
    lng: 72.8777,
    popularSpots: ['Mumbai Airport T2', 'Borivali', 'Bandra', 'Andheri']
  },
  {
    id: 'udaipur',
    name: 'Udaipur (City of Lakes)',
    district: 'Udaipur',
    lat: 24.5854,
    lng: 73.7125,
    popularSpots: ['City Palace', 'Fateh Sagar', 'Udaipur Airport', 'Sukher']
  },
  {
    id: 'dahod',
    name: 'Dahod',
    district: 'Dahod',
    lat: 22.8364,
    lng: 74.2541,
    popularSpots: ['Dahod Railway Station', 'Govind Nagar', 'Station Road', 'APMC Market']
  },
  {
    id: 'godhra',
    name: 'Godhra',
    district: 'Panchmahal',
    lat: 22.7758,
    lng: 73.6149,
    popularSpots: ['Godhra Junction', 'Vavdi Road', 'Bhamaiya', 'Lalbagh Bus Stand']
  }
];

// Pre-measured road route matrix between popular pairs (in KM) for instant calculation
export const ROAD_DISTANCES: Record<string, number> = {
  'amd-vadodara': 110,
  'amd-surat': 265,
  'amd-rajkot': 215,
  'amd-statue-of-unity': 198,
  'amd-somnath': 410,
  'amd-dwarka': 440,
  'amd-bhuj': 335,
  'amd-bhavnagar': 175,
  'amd-jamnagar': 305,
  'amd-junagadh': 315,
  'amd-sasan-gir': 365,
  'amd-anand': 75,
  'amd-nadiad': 58,
  'amd-mehsana': 75,
  'amd-palanpur': 145,
  'amd-ambaji': 185,
  'amd-mount-abu': 225,
  'amd-udaipur': 260,
  'amd-mumbai': 525,
  'amd-diu': 360,
  'amd-vapi': 360,
  'amd-bharuch': 190,
  'amd-dahod': 210,
  'amd-godhra': 125,

  'vadodara-surat': 155,
  'vadodara-statue-of-unity': 90,
  'vadodara-anand': 45,
  'vadodara-mumbai': 415,
  'vadodara-rajkot': 285,
  'vadodara-bharuch': 80,
  'vadodara-ahmedabad-airport': 115,
  'vadodara-dahod': 145,
  'vadodara-godhra': 82,
  'vadodara-palitana': 256,
  'palitana-vadodara': 256,
  'amd-palitana': 215,
  'palitana-amd': 215,
  'surat-palitana': 310,
  'palitana-surat': 310,

  'surat-mumbai': 280,
  'surat-statue-of-unity': 155,
  'surat-vapi': 95,
  'surat-bharuch': 75,
  'surat-bhavnagar': 360,
  'surat-diu': 430,

  'rajkot-jamnagar': 90,
  'rajkot-dwarka': 225,
  'rajkot-somnath': 195,
  'rajkot-junagadh': 105,
  'rajkot-sasan-gir': 155,
  'rajkot-porbandar': 180,

  'dwarka-somnath': 235,
  'somnath-sasan-gir': 45,
  'junagadh-somnath': 95,
  'junagadh-sasan-gir': 55
};

export type CarId = 'sedan' | 'ertiga' | 'innova' | 'innova-crysta';

export interface CarOption {
  id: CarId;
  name: string;
  tagline: string;
  category: string;
  models: string;
  capacity: string;
  luggage: string;
  ac: string;
  roundTripRatePerKm: number; // Internal: Sedan 11, Ertiga 13, Innova 17, Innova Crysta 19
  oneWayBaseKm: number; // 50 km base
  oneWayBaseFare: number; // Sedan: 1300, Ertiga: 1750
  oneWayExtraRatePerKm: number; // Sedan: 11, Ertiga: 13
  oneWayRatePerKm: number; // Internal extra rate
  minKmPerDayRoundTrip: number; // 300 km/day
  minKmOneWay: number; // 50 km
  driverAllowancePerDay: number; // ₹300 per day
  image: string;
  badge?: string;
  features: string[];
}

export const CAR_OPTIONS: CarOption[] = [
  {
    id: 'sedan',
    name: 'Prime Sedan',
    tagline: 'Comfortable & economical for couples & small families',
    category: 'Sedan (Dzire / Etios / Aura)',
    models: 'Maruti Suzuki Dzire, Toyota Etios, Hyundai Aura',
    capacity: '4 Passengers + 1 Driver',
    luggage: '2 Medium + 2 Hand Bags',
    ac: 'Chilled Air Conditioning',
    roundTripRatePerKm: 11, // Sedan Round Trip: ₹11/km
    oneWayBaseKm: 50,
    oneWayBaseFare: 1300, // Base fare up to 50 km: ₹1,300
    oneWayExtraRatePerKm: 11, // Extra KM after 50 km: ₹11/km
    oneWayRatePerKm: 11,
    minKmPerDayRoundTrip: 300, // Min 300 km/day
    minKmOneWay: 50,
    driverAllowancePerDay: 300, // ₹300/day
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
    badge: 'Most Popular',
    features: [
      'Top-rated Dzire / Etios',
      'High mileage & smooth suspension',
      'Clean sanitized interior with seat covers',
      'Mobile charging port & music system',
      'Fastag enabled - instant toll transit'
    ]
  },
  {
    id: 'ertiga',
    name: 'Maruti Suzuki Ertiga',
    tagline: 'Spacious 7-seater for family vacations & group tours',
    category: 'MUV (Maruti Ertiga / XL6)',
    models: 'Maruti Suzuki Ertiga, XL6 (6+1 Seater)',
    capacity: '6 Passengers + 1 Driver',
    luggage: '3-4 Bags (Roof Carrier on request)',
    ac: 'Dual AC Vents (Front & Rear)',
    roundTripRatePerKm: 13, // Ertiga Round Trip: ₹13/km
    oneWayBaseKm: 50,
    oneWayBaseFare: 1750, // Base fare up to 50 km: ₹1,750
    oneWayExtraRatePerKm: 13, // Extra KM after 50 km: ₹13/km
    oneWayRatePerKm: 13,
    minKmPerDayRoundTrip: 300, // Min 300 km/day
    minKmOneWay: 50,
    driverAllowancePerDay: 300, // ₹300/day
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
    badge: 'Best For Family',
    features: [
      'Comfortable 3-row recliner seating',
      'Spacious legroom for long highway journeys',
      'Individual roof AC vents for all rows',
      'Large boot space or luggage carrier available',
      'Experienced highway & hill driver'
    ]
  },
  {
    id: 'innova',
    name: 'Toyota Innova',
    tagline: 'Reliable, powerful & ultra-comfortable for long Gujarat tours',
    category: 'MUV / SUV (7+1 Seater)',
    models: 'Toyota Innova 2.5V / GX (7+1 Seater)',
    capacity: '7 Passengers + 1 Driver',
    luggage: '4-5 Large Bags',
    ac: 'Dual AC (Front & Rear)',
    roundTripRatePerKm: 17, // Innova Round Trip: ₹17/km
    oneWayBaseKm: 50,
    oneWayBaseFare: 2300,
    oneWayExtraRatePerKm: 17,
    oneWayRatePerKm: 17,
    minKmPerDayRoundTrip: 300, // Min 300 km/day
    minKmOneWay: 50,
    driverAllowancePerDay: 300, // ₹300/day
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
    badge: 'Premium Comfort',
    features: [
      'Spacious 7+1 captain & bench seating',
      'Legendary highway ride stability & comfort',
      'Ample luggage room for long itineraries',
      'High ground clearance for all road terrains',
      'Expert long-distance highway chauffeur'
    ]
  },
  {
    id: 'innova-crysta',
    name: 'Toyota Innova Crysta',
    tagline: 'Executive luxury, whisper-quiet cabin & superior ride',
    category: 'Luxury MUV / Executive (7+1 Seater)',
    models: 'Toyota Innova Crysta 2.4 VX / ZX',
    capacity: '7 Passengers + 1 Driver',
    luggage: '4-5 Large Bags',
    ac: 'Automatic Climate Control (All Rows)',
    roundTripRatePerKm: 19, // Innova Crysta Round Trip: ₹19/km
    oneWayBaseKm: 50,
    oneWayBaseFare: 2600,
    oneWayExtraRatePerKm: 19,
    oneWayRatePerKm: 19,
    minKmPerDayRoundTrip: 300, // Min 300 km/day
    minKmOneWay: 50,
    driverAllowancePerDay: 300, // ₹300/day
    image: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=800&q=80',
    badge: 'Executive Luxury',
    features: [
      'Plush leather upholstery & reclining seats',
      'Whisper-quiet acoustic insulated cabin',
      'Digital automatic AC vents for every row',
      'USB fast charging & ambient cabin lighting',
      'Top-rated senior executive chauffeur'
    ]
  }
];

export interface PopularPackage {
  id: string;
  title: string;
  from: string;
  to: string;
  days: string;
  distance: string;
  sedanPrice: number;
  ertigaPrice: number;
  highlights: string[];
  image: string;
}

export const POPULAR_PACKAGES: PopularPackage[] = [
  {
    id: 'pkg-sou',
    title: 'Statue of Unity 1-Day Tour',
    from: 'Ahmedabad / Vadodara',
    to: 'Ekta Nagar (Kevadia)',
    days: '1 Day',
    distance: '400 km Return',
    sedanPrice: 4700,
    ertigaPrice: 5500,
    highlights: ['Statue Viewing Gallery', 'Valley of Flowers', 'Glow Garden & Laser Show', 'Same-day return'],
    image: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'pkg-saurashtra',
    title: 'Dwarka - Somnath Saurashtra Darshan',
    from: 'Ahmedabad / Rajkot',
    to: 'Dwarka, Somnath, Junagadh',
    days: '3-4 Days',
    distance: '1000 km Total',
    sedanPrice: 11900,
    ertigaPrice: 13900,
    highlights: ['Dwarkadhish Temple', 'Bet Dwarka & Shivrajpur Beach', 'Somnath Mahadev Aarti', 'Girnar Ropeway'],
    image: 'https://images.unsplash.com/photo-1609137144822-0a13d7890cfb?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'pkg-kutch',
    title: 'Rann of Kutch & Mandvi Safari',
    from: 'Ahmedabad',
    to: 'Dhordo, Bhuj, Mandvi Beach',
    days: '3 Days',
    distance: '850 km Total',
    sedanPrice: 10800,
    ertigaPrice: 12600,
    highlights: ['White Desert Sunset', 'Kalo Dungar Magnetic Hill', 'Aina Mahal & Prag Mahal', 'Mandvi Palace & Beach'],
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'pkg-airport',
    title: 'Vadodara to Ahmedabad Airport Transfer',
    from: 'Vadodara',
    to: 'Ahmedabad Airport (AMD)',
    days: 'One Way / Return',
    distance: '115 km',
    sedanPrice: 1799,
    ertigaPrice: 2499,
    highlights: ['Doorstep pickup anywhere in Baroda', 'NE1 Expressway nonstop route', 'Flight delay buffer', 'Assistance with luggage'],
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80'
  }
];

export const TESTIMONIALS = [
  {
    name: 'Jayesh Patel',
    city: 'Ahmedabad',
    route: 'Ahmedabad to Statue of Unity',
    rating: 5,
    car: 'Ertiga (6+1)',
    comment: 'Booked Ertiga for our family trip to Kevadia. Driver Bharatbhai arrived 10 minutes early in SG Highway. Clean cab, smooth driving and fair rates without any hidden tolls or extra charge disputes. Highly recommended!'
  },
  {
    name: 'Kavita Shah',
    city: 'Vadodara',
    route: 'Vadodara to Dwarka - Somnath',
    rating: 5,
    car: 'Prime Sedan',
    comment: 'Did a 4-day pilgrimage tour with my elderly parents. The Sedan was spotless with great AC. The upfront round trip pricing was completely transparent. The driver was very patient during temple visits.'
  },
  {
    name: 'Hardik Mehta',
    city: 'Surat',
    route: 'Surat to Mumbai Airport',
    rating: 5,
    car: 'Prime Sedan',
    comment: 'Smooth one-way drop to Mumbai International Airport. Booking on WhatsApp was instantaneous. Got driver details 2 hours before trip. Excellent service by Gujarat Ride!'
  }
];
