import React, { useEffect, useState, useRef } from 'react';
import {
  Map,
  useMapsLibrary,
  useMap,
  AdvancedMarker,
  Pin
} from '@vis.gl/react-google-maps';
import { MapPin, Navigation, Maximize2, Minimize2, ExternalLink, Route as RouteIcon } from 'lucide-react';
import { LocationPoint } from '../utils/distanceCalculator';

interface MapRouteViewProps {
  origin: LocationPoint | null;
  destination: LocationPoint | null;
  distanceKm: number;
  durationText: string;
  isRoundTrip: boolean;
  isRouteReady?: boolean;
  directionsResult?: google.maps.DirectionsResult | null;
  onRouteCalculated?: (distKm: number, durText: string, result?: google.maps.DirectionsResult) => void;
}

// Inner component that calculates and draws the actual driving route on the Google Map using DirectionsRenderer
const RouteController: React.FC<{
  origin: LocationPoint | null;
  destination: LocationPoint | null;
  directionsResult?: google.maps.DirectionsResult | null;
  onRouteCalculated?: (distKm: number, durText: string, result?: google.maps.DirectionsResult) => void;
}> = ({ origin, destination, directionsResult, onRouteCalculated }) => {
  const map = useMap();
  const routesLib = useMapsLibrary('routes');
  const rendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const requestIdRef = useRef<number>(0);

  // Initialize and manage a single DirectionsRenderer instance on the map
  useEffect(() => {
    if (!map) return;

    const DirectionsRendererClass =
      routesLib?.DirectionsRenderer || window.google?.maps?.DirectionsRenderer;

    if (!DirectionsRendererClass) return;

    if (!rendererRef.current) {
      rendererRef.current = new DirectionsRendererClass({
        map,
        suppressMarkers: true, // We already render custom green pickup and red destination AdvancedMarker pins
        preserveViewport: false,
        routeIndex: 0, // Strict: show only the single direct selected route
        polylineOptions: {
          strokeColor: '#f59e0b', // Amber theme
          strokeOpacity: 0.95,
          strokeWeight: 5,
          zIndex: 10,
        },
      });
    } else {
      rendererRef.current.setMap(map);
    }

    return () => {
      if (rendererRef.current) {
        rendererRef.current.setMap(null);
        rendererRef.current = null;
      }
    };
  }, [map, routesLib]);

  // Handle route display & calculation with single clean route enforcement
  useEffect(() => {
    if (!map) return;

    const renderer = rendererRef.current;
    const currentRequestId = ++requestIdRef.current;

    if (!origin || !destination) {
      if (renderer) {
        try {
          renderer.setDirections({ routes: [] } as unknown as google.maps.DirectionsResult);
        } catch {}
      }
      return;
    }

    // 1. If directionsResult is already provided, immediately render only the single direct route
    if (directionsResult?.routes?.[0] && renderer) {
      const singleRouteResult: google.maps.DirectionsResult = {
        ...directionsResult,
        routes: [directionsResult.routes[0]]
      };
      renderer.setRouteIndex(0);
      renderer.setDirections(singleRouteResult);

      if (directionsResult.routes[0].bounds) {
        map.fitBounds(directionsResult.routes[0].bounds, { top: 40, right: 40, bottom: 40, left: 40 });
      }
      return;
    }

    // 2. Otherwise calculate driving route via Google Maps DirectionsService
    const DirectionsServiceClass =
      routesLib?.DirectionsService || window.google?.maps?.DirectionsService;

    if (!DirectionsServiceClass) {
      return;
    }

    const originParam: google.maps.LatLngLiteral | string =
      origin.lat && origin.lng
        ? { lat: origin.lat, lng: origin.lng }
        : origin.name.includes('Gujarat')
        ? origin.name
        : `${origin.name}, Gujarat, India`;

    const destParam: google.maps.LatLngLiteral | string =
      destination.lat && destination.lng
        ? { lat: destination.lat, lng: destination.lng }
        : destination.name.includes('Gujarat')
        ? destination.name
        : `${destination.name}, Gujarat, India`;

    try {
      const service = new DirectionsServiceClass();
      const travelMode =
        window.google?.maps?.TravelMode?.DRIVING || ('DRIVING' as google.maps.TravelMode);

      service.route(
        {
          origin: originParam,
          destination: destParam,
          travelMode: travelMode,
          provideRouteAlternatives: false, // Strict: Do NOT return alternatives to prevent ghost lines
        },
        (result, status) => {
          // If a newer request has started, discard this result
          if (currentRequestId !== requestIdRef.current) return;

          if (status === 'OK' && result && result.routes?.[0] && renderer) {
            const route = result.routes[0];
            const leg = route.legs?.[0];

            const singleRouteResult: google.maps.DirectionsResult = {
              ...result,
              routes: [result.routes[0]]
            };
            renderer.setRouteIndex(0);
            renderer.setDirections(singleRouteResult);

            if (route.bounds) {
              map.fitBounds(route.bounds, { top: 40, right: 40, bottom: 40, left: 40 });
            }

            if (leg && onRouteCalculated) {
              const km = leg.distance ? Math.round(leg.distance.value / 1000) : 0;
              const durText = leg.duration?.text || '';
              onRouteCalculated(km, durText, singleRouteResult);
            }
          } else {
            if (status === 'OVER_QUERY_LIMIT' || status === 'REQUEST_DENIED') {
              window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
            }
            // Fit bounds to markers so map is cleanly centered even if directions quota is reached
            if (origin.lat && origin.lng && destination.lat && destination.lng) {
              const bounds = new google.maps.LatLngBounds();
              bounds.extend({ lat: origin.lat, lng: origin.lng });
              bounds.extend({ lat: destination.lat, lng: destination.lng });
              map.fitBounds(bounds, { top: 40, right: 40, bottom: 40, left: 40 });
            }
          }
        }
      );
    } catch (err) {
      console.warn('Google Maps DirectionsService execution error:', err);
    }
  }, [map, routesLib, origin?.lat, origin?.lng, destination?.lat, destination?.lng, origin?.name, destination?.name, directionsResult]);

  return null;
};

export const MapRouteView: React.FC<MapRouteViewProps> = ({
  origin,
  destination,
  distanceKm,
  durationText,
  isRoundTrip,
  directionsResult,
  onRouteCalculated
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [mapError, setMapError] = useState(false);
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyBtz25OJBMgFyr5uwC_9tr94fmdU9MEY74';

  const hasValidRoute = Boolean(origin?.name && destination?.name && distanceKm > 0);

  const defaultCenter = {
    lat: origin?.lat || 22.3094, // Central Gujarat
    lng: origin?.lng || 72.1362,
  };

  const hasCoordinates = Boolean(
    hasValidRoute && origin?.lat && origin?.lng && destination?.lat && destination?.lng
  );

  // Link to open actual Google Maps on phone or desktop
  const googleMapsUrl = hasValidRoute
    ? `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
        origin?.name || ''
      )}&destination=${encodeURIComponent(destination?.name || '')}&travelmode=driving`
    : 'https://www.google.com/maps/place/Gujarat,+India';

  return (
    <div
      className={`relative rounded-2xl overflow-hidden border border-slate-200/80 shadow-md bg-slate-900 transition-all duration-300 ${
        isExpanded ? 'fixed inset-4 z-50 rounded-2xl' : 'w-full h-[360px] md:h-[420px]'
      }`}
    >
      {/* Top Map Bar with Info Badges */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
        <div className="bg-slate-900/90 backdrop-blur-md text-white text-xs px-3.5 py-1.5 rounded-full shadow-lg border border-slate-700/60 flex items-center gap-2 pointer-events-auto">
          <RouteIcon className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span className="font-semibold text-amber-400">Live Route Map:</span>
          {hasValidRoute ? (
            <span className="truncate max-w-[130px] sm:max-w-[180px] font-medium text-slate-200">
              {origin?.name} → {destination?.name}
            </span>
          ) : (
            <span className="font-medium text-slate-300">Gujarat Highway Network</span>
          )}
        </div>

        <div className="flex items-center gap-1.5 pointer-events-auto">
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Open in Google Maps App"
            className="bg-white/95 hover:bg-white text-slate-800 p-2 rounded-xl shadow-md border border-slate-200 text-xs flex items-center gap-1 transition-all hover:scale-105"
          >
            <ExternalLink className="w-3.5 h-3.5 text-slate-700" />
            <span className="hidden sm:inline font-semibold">Open Maps</span>
          </a>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Minimize Map' : 'Full Screen Map'}
            className="bg-white/95 hover:bg-white text-slate-800 p-2 rounded-xl shadow-md border border-slate-200 transition-all hover:scale-105"
          >
            {isExpanded ? (
              <Minimize2 className="w-4 h-4 text-slate-800" />
            ) : (
              <Maximize2 className="w-4 h-4 text-slate-800" />
            )}
          </button>
        </div>
      </div>

      {/* Floating Bottom Route Stat Card */}
      <div className="absolute bottom-3 left-3 right-3 z-10 pointer-events-none">
        <div className="bg-slate-950/90 backdrop-blur-md p-3.5 rounded-xl border border-slate-800 shadow-xl pointer-events-auto text-white flex items-center justify-between">
          {hasValidRoute ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-lg">
                <Navigation className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                  Est. Distance & Duration
                </div>
                <div className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <span>{distanceKm} km</span>
                  {isRoundTrip && (
                    <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-md font-medium border border-amber-500/30">
                      ({distanceKm * 2} km Return)
                    </span>
                  )}
                  <span className="text-slate-500">•</span>
                  <span className="text-amber-400 font-medium text-sm sm:text-base">
                    ~{durationText}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-lg">
                <Navigation className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                  Interactive Route Navigator
                </div>
                <div className="text-xs sm:text-sm font-semibold text-slate-200">
                  Enter pickup & destination above to calculate highway route and distance
                </div>
              </div>
            </div>
          )}

          <div className="text-right hidden sm:block">
            <span className="text-[11px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-1 rounded-full font-medium inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              Fastag Highway Route
            </span>
          </div>
        </div>
      </div>

      {/* Map Rendering Container */}
      {!mapError ? (
        <div className="w-full h-full min-h-[340px]">
          <Map
            mapId="DEMO_MAP_ID"
            defaultCenter={defaultCenter}
            defaultZoom={8}
            gestureHandling="greedy"
            disableDefaultUI={false}
            zoomControl={true}
            mapTypeControl={false}
            streetViewControl={false}
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
            className="w-full h-full"
          >
            {hasCoordinates && (
              <>
                {/* Origin Marker (Green Pick-up Pin) */}
                {origin?.lat && origin?.lng && (
                  <AdvancedMarker position={{ lat: origin.lat, lng: origin.lng }} title={origin.name}>
                    <Pin
                      background="#10b981"
                      glyphColor="#ffffff"
                      borderColor="#065f46"
                      scale={1.1}
                    />
                  </AdvancedMarker>
                )}

                {/* Destination Marker (Red Drop-off Pin) */}
                {destination?.lat && destination?.lng && (
                  <AdvancedMarker position={{ lat: destination.lat, lng: destination.lng }} title={destination.name}>
                    <Pin
                      background="#ef4444"
                      glyphColor="#ffffff"
                      borderColor="#991b1b"
                      scale={1.1}
                    />
                  </AdvancedMarker>
                )}

                {/* Route Polyline drawer */}
                <RouteController
                  origin={origin}
                  destination={destination}
                  directionsResult={directionsResult}
                  onRouteCalculated={onRouteCalculated}
                />
              </>
            )}
          </Map>
        </div>
      ) : (
        /* Fallback Visual Route Graphic if Map WebGL or network drops */
        <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-950 text-white text-center">
          <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mb-4">
            <RouteIcon className="w-8 h-8 text-amber-400" />
          </div>
          <h4 className="text-lg font-bold mb-1">
            {hasValidRoute ? `${origin?.name} to ${destination?.name}` : 'Gujarat Highway Route Map'}
          </h4>
          <p className="text-sm text-slate-300 mb-4 max-w-sm">
            {hasValidRoute
              ? `Highway route calculated: ${distanceKm} km ${isRoundTrip ? '(Round Trip: ' + distanceKm * 2 + ' km)' : ''} • Approx ${durationText} driving time`
              : 'Enter pickup and destination above to view highway route & distance'}
          </p>
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl shadow-lg transition-transform hover:scale-105"
          >
            <span>View Full Route in Google Maps</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      )}
    </div>
  );
};
