import { GUJARAT_CITIES, ROAD_DISTANCES, CAR_OPTIONS, CarId } from '../data/gujaratRoutes';

export interface LocationPoint {
  name: string;
  lat?: number;
  lng?: number;
  district?: string;
}

export interface FareCalculationResult {
  oneWayDistanceKm: number;
  totalBillableKm: number;
  isRoundTrip: boolean;
  baseFare: number;
  driverAllowance: number;
  ratePerKm: number;
  estimatedTotal: number;
  estimatedDurationText: string;
  numberOfDays: number;
  minimumKmApplied: boolean;
  isFixedFare?: boolean;
  tag: string;
  isLocal?: boolean;
  packageName?: string;
  packageHours?: number;
  packageKm?: number;
  extraKmRate?: number;
  extraHourRate?: number;
}

export interface DrivingRouteResult {
  distanceKm: number;
  durationText: string;
  result: google.maps.DirectionsResult;
}

// Fallback estimation using road network factor when Google Maps API quota is reached
function calculateRoadFallbackKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straight = R * c;

  // Check if trip crosses the Gulf of Khambhat (South/Central Gujarat to Saurashtra)
  const crossesGulf =
    (lon1 > 72.8 && lon2 < 72.2 && lat1 < 22.5 && lat2 < 22.5) ||
    (lon2 > 72.8 && lon1 < 72.2 && lat1 < 22.5 && lat2 < 22.5);

  if (crossesGulf) {
    return Math.round(straight * 1.55);
  }
  return Math.round(straight * 1.25);
}

// In-memory cache for driving routes to prevent redundant Google Maps calls
const drivingRouteCache = new Map<string, DrivingRouteResult>();

// Calculate actual driving route using Google Maps DirectionsService with DRIVING travel mode
export function calculateDrivingRoute(
  origin: LocationPoint | string,
  destination: LocationPoint | string,
  routesLib?: google.maps.RoutesLibrary | null
): Promise<DrivingRouteResult> {
  return new Promise((resolve, reject) => {
    const DirectionsServiceClass =
      routesLib?.DirectionsService || window.google?.maps?.DirectionsService;

    if (!DirectionsServiceClass) {
      return reject(new Error('Google Maps DirectionsService not available'));
    }

    let originParam: string | google.maps.LatLngLiteral = '';
    let originKey = '';
    if (typeof origin === 'string') {
      originParam = origin.includes('Gujarat') ? origin : `${origin}, Gujarat, India`;
      originKey = origin.trim().toLowerCase();
    } else if (origin.lat && origin.lng) {
      originParam = { lat: origin.lat, lng: origin.lng };
      originKey = `${origin.lat.toFixed(4)},${origin.lng.toFixed(4)}`;
    } else {
      originParam = origin.name.includes('Gujarat') ? origin.name : `${origin.name}, Gujarat, India`;
      originKey = origin.name.trim().toLowerCase();
    }

    let destParam: string | google.maps.LatLngLiteral = '';
    let destKey = '';
    if (typeof destination === 'string') {
      destParam = destination.includes('Gujarat') ? destination : `${destination}, Gujarat, India`;
      destKey = destination.trim().toLowerCase();
    } else if (destination.lat && destination.lng) {
      destParam = { lat: destination.lat, lng: destination.lng };
      destKey = `${destination.lat.toFixed(4)},${destination.lng.toFixed(4)}`;
    } else {
      destParam = destination.name.includes('Gujarat') ? destination.name : `${destination.name}, Gujarat, India`;
      destKey = destination.name.trim().toLowerCase();
    }

    const cacheKey = `${originKey}->${destKey}`;
    if (drivingRouteCache.has(cacheKey)) {
      return resolve(drivingRouteCache.get(cacheKey)!);
    }

    const service = new DirectionsServiceClass();
    const travelMode =
      window.google?.maps?.TravelMode?.DRIVING || ('DRIVING' as google.maps.TravelMode);

    service.route(
      {
        origin: originParam,
        destination: destParam,
        travelMode: travelMode,
        provideRouteAlternatives: false
      },
      (res, status) => {
        if (status === 'OK' && res && res.routes?.[0]?.legs?.[0]) {
          const leg = res.routes[0].legs[0];
          // Retrieve actual highway driving distance in kilometers from leg.distance.value / 1000
          const distKm = leg.distance ? Math.round(leg.distance.value / 1000) : 0;
          const durText = leg.duration?.text || '';
          const routeResult: DrivingRouteResult = {
            distanceKm: distKm,
            durationText: durText,
            result: res
          };
          drivingRouteCache.set(cacheKey, routeResult);
          resolve(routeResult);
        } else {
          if (status === 'OVER_QUERY_LIMIT' || status === 'REQUEST_DENIED') {
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
            }
          }
          // Graceful fallback to verified road distance so user flow never breaks
          const originPoint = typeof origin === 'string' ? { name: origin } : origin;
          const destPoint = typeof destination === 'string' ? { name: destination } : destination;
          const fallbackKm = getRouteDistanceKm(originPoint, destPoint);
          if (fallbackKm > 0) {
            const fallbackResult: DrivingRouteResult = {
              distanceKm: fallbackKm,
              durationText: estimateDuration(fallbackKm),
              result: {
                routes: []
              } as unknown as google.maps.DirectionsResult
            };
            return resolve(fallbackResult);
          }
          reject(new Error(`DirectionsService status: ${status}`));
        }
      }
    );
  });
}

// Find matched city in our database by name (fuzzy or partial)
export function findCityByName(name: string) {
  if (!name) return null;
  const clean = name.toLowerCase().trim();
  return GUJARAT_CITIES.find(
    (c) =>
      clean.includes(c.name.toLowerCase()) ||
      clean.includes(c.id.toLowerCase()) ||
      c.popularSpots?.some((spot) => clean.includes(spot.toLowerCase()))
  );
}

// Get road route distance between two locations (checks known road distance matrix or driving route cache)
export function getRouteDistanceKm(
  origin: LocationPoint | null,
  destination: LocationPoint | null
): number {
  if (!origin?.name || !destination?.name) return 0;

  // 1. Try known verified road distance matrix
  const originCity = findCityByName(origin.name);
  const destCity = findCityByName(destination.name);

  if (originCity && destCity) {
    if (originCity.id === destCity.id) {
      return 25; // Local city trip minimum
    }

    const key1 = `${originCity.id}-${destCity.id}`;
    const key2 = `${destCity.id}-${originCity.id}`;

    if (ROAD_DISTANCES[key1]) return ROAD_DISTANCES[key1];
    if (ROAD_DISTANCES[key2]) return ROAD_DISTANCES[key2];
  }

  // 2. Check cached Google Maps driving route
  let originKey = '';
  if (origin.lat && origin.lng) originKey = `${origin.lat.toFixed(4)},${origin.lng.toFixed(4)}`;
  else originKey = origin.name.trim().toLowerCase();

  let destKey = '';
  if (destination.lat && destination.lng) destKey = `${destination.lat.toFixed(4)},${destination.lng.toFixed(4)}`;
  else destKey = destination.name.trim().toLowerCase();

  const cacheKey = `${originKey}->${destKey}`;
  if (drivingRouteCache.has(cacheKey)) {
    return drivingRouteCache.get(cacheKey)!.distanceKm;
  }

  // 3. Fallback coordinate calculation when Google Maps Directions quota is exhausted
  if (origin.lat && origin.lng && destination.lat && destination.lng) {
    return calculateRoadFallbackKm(origin.lat, origin.lng, destination.lat, destination.lng);
  }

  return 0;
}

// Estimate driving duration based on average Gujarat highway speed (~60 km/h)
export function estimateDuration(distanceKm: number): string {
  if (!distanceKm || distanceKm <= 0) return '0 mins';
  const averageSpeedKmH = 55; // Realistic speed including tolls and town bypasses
  const totalHours = distanceKm / averageSpeedKmH;
  const hours = Math.floor(totalHours);
  const minutes = Math.round((totalHours - hours) * 60);

  if (hours === 0) {
    return `${minutes} mins`;
  } else if (minutes === 0) {
    return `${hours} hr${hours > 1 ? 's' : ''}`;
  }
  return `${hours} hr${hours > 1 ? 's' : ''} ${minutes} min${minutes > 1 ? 's' : ''}`;
}

// Check if location represents Ahmedabad (city, airport, or district)
export function isAhmedabadLocation(loc?: LocationPoint | null): boolean {
  if (!loc?.name) return false;
  const name = loc.name.toLowerCase().trim();
  const district = (loc.district || '').toLowerCase().trim();

  if (
    name.includes('ahmedabad') ||
    name.includes('amd') ||
    district.includes('ahmedabad')
  ) {
    return true;
  }

  const city = findCityByName(loc.name);
  if (
    city &&
    (city.id === 'amd' ||
      city.id === 'amd-airport' ||
      city.district.toLowerCase() === 'ahmedabad')
  ) {
    return true;
  }

  return false;
}

// Check if location represents Vadodara / Baroda
export function isVadodaraLocation(loc?: LocationPoint | null): boolean {
  if (!loc?.name) return false;
  const name = loc.name.toLowerCase().trim();
  const district = (loc.district || '').toLowerCase().trim();

  if (
    name.includes('vadodara') ||
    name.includes('baroda') ||
    district.includes('vadodara')
  ) {
    return true;
  }

  const city = findCityByName(loc.name);
  if (
    city &&
    (city.id === 'vadodara' ||
      city.district.toLowerCase() === 'vadodara')
  ) {
    return true;
  }

  return false;
}

// Check if the route is Vadodara -> Ahmedabad or Ahmedabad -> Vadodara
export function isVadodaraAhmedabadRoute(
  origin?: LocationPoint | null,
  destination?: LocationPoint | null
): boolean {
  if (!origin || !destination) return false;
  return (
    (isVadodaraLocation(origin) && isAhmedabadLocation(destination)) ||
    (isAhmedabadLocation(origin) && isVadodaraLocation(destination))
  );
}

export function calculateTripFare(
  distanceKm: number,
  carType: CarId,
  isRoundTrip: boolean,
  startDateStr: string,
  endDateStr?: string,
  origin?: LocationPoint | null,
  destination?: LocationPoint | null
): FareCalculationResult {
  const car = CAR_OPTIONS.find((c) => c.id === carType) || CAR_OPTIONS[0];

  // 1. ONE-WAY FARE RULES
  if (!isRoundTrip) {
    // Vadodara <-> Ahmedabad: Fixed flat fare of Sedan ₹1,799 and Ertiga ₹2,499 (All-Inclusive).
    if (isVadodaraAhmedabadRoute(origin, destination)) {
      if (carType === 'sedan') {
        const fixedFare = 1799;
        return {
          oneWayDistanceKm: distanceKm,
          totalBillableKm: distanceKm,
          isRoundTrip: false,
          baseFare: fixedFare,
          driverAllowance: 0,
          ratePerKm: 0,
          estimatedTotal: fixedFare,
          estimatedDurationText: estimateDuration(distanceKm),
          numberOfDays: 1,
          minimumKmApplied: false,
          isFixedFare: true,
          tag: 'Fuel & Driver Allowance Included'
        };
      } else if (carType === 'ertiga') {
        const fixedFare = 2499;
        return {
          oneWayDistanceKm: distanceKm,
          totalBillableKm: distanceKm,
          isRoundTrip: false,
          baseFare: fixedFare,
          driverAllowance: 0,
          ratePerKm: 0,
          estimatedTotal: fixedFare,
          estimatedDurationText: estimateDuration(distanceKm),
          numberOfDays: 1,
          minimumKmApplied: false,
          isFixedFare: true,
          tag: 'Fuel & Driver Allowance Included'
        };
      }
    }

    // All other routes:
    // Base fare up to 50 km: Prime Sedan = ₹1,300, Ertiga = ₹1,750.
    // Extra KM after 50 km: Prime Sedan = ₹11/km, Ertiga = ₹13/km.
    // Keep the 50km base fare calculation in the backend; display the calculated total fare directly to the user.
    const baseKm = car.oneWayBaseKm || 50;
    const baseFare50Km = car.oneWayBaseFare || (carType === 'ertiga' ? 1750 : 1300);
    const extraRatePerKm = car.oneWayExtraRatePerKm || (carType === 'ertiga' ? 13 : 11);

    let calculatedFare = baseFare50Km;
    if (distanceKm > baseKm) {
      calculatedFare = baseFare50Km + Math.round((distanceKm - baseKm) * extraRatePerKm);
    }

    return {
      oneWayDistanceKm: distanceKm,
      totalBillableKm: distanceKm,
      isRoundTrip: false,
      baseFare: calculatedFare,
      driverAllowance: 0,
      ratePerKm: extraRatePerKm,
      estimatedTotal: calculatedFare,
      estimatedDurationText: estimateDuration(distanceKm),
      numberOfDays: 1,
      minimumKmApplied: false,
      isFixedFare: false,
      tag: 'Fuel & Driver Allowance Included'
    };
  }

  // 2. ROUND-TRIP FARE RULES:
  // - Minimum daily average: 300 km/day across all vehicles.
  // - Driver Allowance (DA): Flat ₹300/day for ALL vehicles (Sedan, Ertiga, and Innova Crysta).
  // - Rates per KM:
  //   * Prime Sedan: ₹11/km
  //   * Maruti Suzuki Ertiga: ₹13/km
  //   * Innova Crysta: ₹19/km
  // - Tag: "Toll & Parking Extra as per actuals".
  let numberOfDays = 1;
  if (startDateStr && endDateStr) {
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    numberOfDays = Math.max(1, diffDays + 1); // e.g. same day is 1 day, next day is 2 days
  }

  const ratePerKm = car.roundTripRatePerKm;
  const actualRoundKm = distanceKm * 2;
  const minRequiredKm = numberOfDays * 300; // 300 km/day across all vehicles
  let totalBillableKm = actualRoundKm;
  let minimumKmApplied = false;

  if (actualRoundKm < minRequiredKm) {
    totalBillableKm = minRequiredKm;
    minimumKmApplied = true;
  }

  const baseFare = totalBillableKm * ratePerKm;
  const driverAllowance = numberOfDays * 300; // Flat ₹300/day across all vehicles
  const estimatedTotal = baseFare + driverAllowance;

  const estimatedDurationText = estimateDuration(actualRoundKm);

  return {
    oneWayDistanceKm: distanceKm,
    totalBillableKm,
    isRoundTrip: true,
    baseFare,
    driverAllowance,
    ratePerKm,
    estimatedTotal,
    estimatedDurationText,
    numberOfDays,
    minimumKmApplied,
    isFixedFare: false,
    tag: 'Toll & Parking Extra as per actuals'
  };
}

// -------------------------------------------------------------
// LOCAL HOURLY RENTAL PACKAGES & PRICING
// -------------------------------------------------------------

export type LocalPackageId = '4h-40km' | '8h-80km' | '12h-120km';

export interface LocalPackageOption {
  id: LocalPackageId;
  label: string;
  hours: number;
  km: number;
}

export const LOCAL_PACKAGES: LocalPackageOption[] = [
  { id: '4h-40km', label: '4 Hours / 40 KM', hours: 4, km: 40 },
  { id: '8h-80km', label: '8 Hours / 80 KM', hours: 8, km: 80 },
  { id: '12h-120km', label: '12 Hours / 120 KM', hours: 12, km: 120 }
];

export interface LocalPricingConfig {
  packages: Record<LocalPackageId, number>;
  extraKmRate: number;
  extraHourRate: number;
}

export const LOCAL_PRICING: Record<string, LocalPricingConfig> = {
  sedan: {
    packages: {
      '4h-40km': 1400,
      '8h-80km': 2000,
      '12h-120km': 2800
    },
    extraKmRate: 11,
    extraHourRate: 150
  },
  ertiga: {
    packages: {
      '4h-40km': 1800,
      '8h-80km': 2600,
      '12h-120km': 3600
    },
    extraKmRate: 13,
    extraHourRate: 200
  },
  'innova-crysta': {
    packages: {
      '4h-40km': 2400,
      '8h-80km': 3600,
      '12h-120km': 4800
    },
    extraKmRate: 20,
    extraHourRate: 250
  }
};

export function calculateLocalPackageFare(
  carId: CarId,
  packageId: LocalPackageId
): FareCalculationResult {
  const pkg = LOCAL_PACKAGES.find((p) => p.id === packageId) || LOCAL_PACKAGES[1]; // default 8h/80km
  const pricing = LOCAL_PRICING[carId] || LOCAL_PRICING['sedan'];
  const fare = pricing.packages[packageId] || pricing.packages['8h-80km'];

  return {
    oneWayDistanceKm: pkg.km,
    totalBillableKm: pkg.km,
    isRoundTrip: false,
    baseFare: fare,
    driverAllowance: 0,
    ratePerKm: pricing.extraKmRate,
    estimatedTotal: fare,
    estimatedDurationText: `${pkg.hours} Hours Included`,
    numberOfDays: 1,
    minimumKmApplied: false,
    isFixedFare: true,
    tag: `All-Inclusive: ${pkg.hours}h & ${pkg.km}km (Fuel + Chauffeur)`,
    isLocal: true,
    packageName: pkg.label,
    packageHours: pkg.hours,
    packageKm: pkg.km,
    extraKmRate: pricing.extraKmRate,
    extraHourRate: pricing.extraHourRate
  };
}

