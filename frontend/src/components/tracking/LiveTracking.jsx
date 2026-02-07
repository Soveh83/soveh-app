import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { GoogleMap, useJsApiLoader, Marker, Polyline, InfoWindow } from '@react-google-maps/api';
import { Phone, MessageCircle, Navigation, Clock, Package, Truck, MapPin } from 'lucide-react';
import { Button } from '../ui';

const libraries = ['places', 'geometry'];

const mapStyles = [
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
];

export const LiveDeliveryTracker = ({ order, deliveryLocation, destinationLocation }) => {
  const [driverPosition, setDriverPosition] = useState(deliveryLocation || { lat: 19.076, lng: 72.8777 });
  const [eta, setEta] = useState('15 mins');
  const [distance, setDistance] = useState('2.5 km');
  const [showDriverInfo, setShowDriverInfo] = useState(false);
  const mapRef = useRef(null);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_KEY || '',
    libraries
  });

  // Simulate live GPS movement
  useEffect(() => {
    if (!destinationLocation) return;
    
    const interval = setInterval(() => {
      setDriverPosition(prev => {
        const latDiff = (destinationLocation.lat - prev.lat) * 0.05;
        const lngDiff = (destinationLocation.lng - prev.lng) * 0.05;
        
        // Stop if very close to destination
        if (Math.abs(latDiff) < 0.0001 && Math.abs(lngDiff) < 0.0001) {
          clearInterval(interval);
          return prev;
        }
        
        return {
          lat: prev.lat + latDiff + (Math.random() - 0.5) * 0.001,
          lng: prev.lng + lngDiff + (Math.random() - 0.5) * 0.001
        };
      });
      
      // Update ETA
      setEta(prev => {
        const mins = parseInt(prev);
        return mins > 1 ? `${mins - 1} mins` : 'Arriving';
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [destinationLocation]);

  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  if (!isLoaded) {
    return (
      <div className="h-64 bg-slate-100 rounded-2xl flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <Navigation className="w-8 h-8 text-blue-600 mx-auto" />
          </motion.div>
          <p className="text-sm text-slate-500 mt-2">Loading map...</p>
        </div>
      </div>
    );
  }

  const destination = destinationLocation || { lat: 19.082, lng: 72.8826 };

  return (
    <div className="space-y-4">
      {/* Live Map */}
      <div className="relative rounded-2xl overflow-hidden shadow-lg">
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '250px' }}
          center={driverPosition}
          zoom={15}
          onLoad={onMapLoad}
          options={{
            styles: mapStyles,
            disableDefaultUI: true,
            zoomControl: true,
          }}
        >
          {/* Driver Marker */}
          <Marker
            position={driverPosition}
            onClick={() => setShowDriverInfo(true)}
            icon={{
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="24" cy="24" r="20" fill="#2563EB"/>
                  <circle cx="24" cy="24" r="16" fill="white"/>
                  <path d="M24 16L30 24H18L24 16Z" fill="#2563EB"/>
                  <circle cx="24" cy="26" r="4" fill="#2563EB"/>
                </svg>
              `),
              scaledSize: { width: 48, height: 48 },
              anchor: { x: 24, y: 24 },
            }}
          />

          {/* Destination Marker */}
          <Marker
            position={destination}
            icon={{
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="40" height="50" viewBox="0 0 40 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 0C8.954 0 0 8.954 0 20c0 14 20 30 20 30s20-16 20-30c0-11.046-8.954-20-20-20z" fill="#10B981"/>
                  <circle cx="20" cy="20" r="8" fill="white"/>
                </svg>
              `),
              scaledSize: { width: 40, height: 50 },
              anchor: { x: 20, y: 50 },
            }}
          />

          {/* Route Line */}
          <Polyline
            path={[driverPosition, destination]}
            options={{
              strokeColor: '#2563EB',
              strokeWeight: 4,
              strokeOpacity: 0.8,
              geodesic: true,
            }}
          />

          {/* Driver Info Window */}
          {showDriverInfo && (
            <InfoWindow
              position={driverPosition}
              onCloseClick={() => setShowDriverInfo(false)}
            >
              <div className="p-2">
                <p className="font-semibold">Delivery Partner</p>
                <p className="text-sm text-gray-600">Rajesh Kumar</p>
                <p className="text-xs text-gray-500">Vehicle: MH-12-AB-1234</p>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>

        {/* Live Badge */}
        <div className="absolute top-3 left-3">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500 text-white text-xs font-semibold shadow-lg"
          >
            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
            LIVE
          </motion.div>
        </div>

        {/* ETA Card */}
        <div className="absolute bottom-3 left-3 right-3">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <motion.div
                    animate={{ y: [0, -3, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <Truck className="w-5 h-5 text-blue-600" />
                  </motion.div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Arriving in {eta}</p>
                  <p className="text-xs text-slate-500">{distance} away</p>
                </div>
              </div>
              <div className="flex gap-2">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => window.open('tel:+919876543210')}
                  className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center"
                >
                  <Phone className="w-5 h-5 text-green-600" />
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center"
                >
                  <MessageCircle className="w-5 h-5 text-blue-600" />
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Driver Card */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xl font-bold">
            RK
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-slate-900">Rajesh Kumar</h4>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span>⭐ 4.8</span>
              <span>•</span>
              <span>500+ deliveries</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">MH-12-AB-1234 • Honda Activa</p>
          </div>
          <div className="flex flex-col gap-2">
            <Button size="sm" role="customer" onClick={() => window.open('tel:+919876543210')}>
              <Phone className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Delivery Timeline */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
        <h4 className="font-semibold text-slate-900 mb-3">Delivery Updates</h4>
        <div className="space-y-3">
          {[
            { time: '2:30 PM', status: 'Order picked up from warehouse', done: true },
            { time: '2:45 PM', status: 'On the way to your location', done: true },
            { time: `${eta}`, status: 'Estimated arrival', done: false, current: true },
          ].map((item, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div className={`w-3 h-3 rounded-full ${
                  item.done ? 'bg-green-500' : item.current ? 'bg-blue-500 animate-pulse' : 'bg-slate-200'
                }`} />
                {index < 2 && <div className={`w-0.5 h-8 ${item.done ? 'bg-green-500' : 'bg-slate-200'}`} />}
              </div>
              <div className="flex-1 -mt-0.5">
                <p className={`text-sm font-medium ${item.current ? 'text-blue-600' : 'text-slate-900'}`}>
                  {item.status}
                </p>
                <p className="text-xs text-slate-500">{item.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Location Picker Component
export const LocationPicker = ({ onLocationSelect, initialLocation }) => {
  const [position, setPosition] = useState(initialLocation || { lat: 19.076, lng: 72.8777 });
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const mapRef = useRef(null);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_KEY || '',
    libraries
  });

  // Get current location on mount
  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setPosition(newPos);
          await reverseGeocode(newPos);
          setLoading(false);
        },
        (err) => {
          console.error('Location error:', err);
          setLoading(false);
        },
        { enableHighAccuracy: true }
      );
    }
  };

  const reverseGeocode = async (pos) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${pos.lat},${pos.lng}&key=${process.env.REACT_APP_GOOGLE_MAPS_KEY}`
      );
      const data = await response.json();
      if (data.results?.[0]) {
        setAddress(data.results[0].formatted_address);
        onLocationSelect?.({ ...pos, address: data.results[0].formatted_address });
      }
    } catch (e) {
      console.error('Geocoding error:', e);
    }
  };

  const handleMapClick = async (e) => {
    const newPos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
    setPosition(newPos);
    await reverseGeocode(newPos);
  };

  if (!isLoaded) {
    return (
      <div className="h-64 bg-slate-100 rounded-2xl animate-pulse flex items-center justify-center">
        <Navigation className="w-8 h-8 text-slate-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Current Location Button */}
      <Button
        onClick={getCurrentLocation}
        loading={loading}
        fullWidth
        variant="outline"
        role="retailer"
      >
        <Navigation className="w-4 h-4 mr-2" />
        {loading ? 'Detecting location...' : 'Use Current Location'}
      </Button>

      {/* Map */}
      <div className="rounded-2xl overflow-hidden shadow-lg border-2 border-slate-200">
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '200px' }}
          center={position}
          zoom={16}
          onClick={handleMapClick}
          options={{
            disableDefaultUI: true,
            zoomControl: true,
            styles: mapStyles,
          }}
        >
          <Marker
            position={position}
            draggable
            onDragEnd={(e) => handleMapClick(e)}
          />
        </GoogleMap>
      </div>

      {/* Selected Address */}
      {address && (
        <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
          <div className="flex items-start gap-2">
            <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">Selected Location</p>
              <p className="text-sm text-blue-700">{address}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
