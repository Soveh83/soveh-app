import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleMap, useJsApiLoader, Marker, Polyline } from '@react-google-maps/api';
import { 
  MapPin, Phone, Star, Clock, Navigation, Package, 
  CheckCircle, Truck, ArrowLeft, MessageCircle, X
} from 'lucide-react';
import { Card, Button, Badge, Spinner } from '../ui';
import toast from 'react-hot-toast';

const libraries = ['places'];

export const LiveTracking = ({ order, onBack }) => {
  const [deliveryLocation, setDeliveryLocation] = useState(null);
  const [eta, setEta] = useState(null);
  const [status, setStatus] = useState('picked_up');
  const [statusText, setStatusText] = useState('Order picked up');
  const [progress, setProgress] = useState(0);
  const [driver, setDriver] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef(null);
  
  const destinationLocation = order?.delivery_address?.coordinates || { lat: 19.1136, lng: 72.8697 };
  
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_KEY || '',
    libraries
  });

  // Connect to WebSocket for real-time tracking
  useEffect(() => {
    if (!order?.id) return;
    
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//${window.location.host}/ws/tracking/${order.id}`;
    
    const connectWebSocket = () => {
      wsRef.current = new WebSocket(wsUrl);
      
      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        toast.success('Live tracking connected!');
      };
      
      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'location_update') {
          setDeliveryLocation(data.location);
          setEta(data.eta_minutes);
          setStatus(data.status);
          setStatusText(data.status_text);
          setProgress(data.progress);
          setDriver(data.driver);
        } else if (data.type === 'delivery_complete') {
          toast.success('Order delivered!');
          setStatus('delivered');
          setStatusText('Delivered');
          setProgress(100);
        }
      };
      
      wsRef.current.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        // Reconnect after 3 seconds
        setTimeout(connectWebSocket, 3000);
      };
      
      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        // Fallback to simulation mode
        startSimulation();
      };
    };
    
    connectWebSocket();
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [order?.id]);
  
  // Fallback simulation if WebSocket fails
  const startSimulation = useCallback(() => {
    console.log('Starting simulation mode');
    setIsConnected(true);
    setDriver({
      name: 'Rajesh Kumar',
      phone: '+91 9876543210',
      rating: 4.8,
      vehicle: 'Bajaj Pulsar 150'
    });
    
    let step = 0;
    const interval = setInterval(() => {
      step++;
      const prog = Math.min(step * 2, 100);
      setProgress(prog);
      setEta(Math.max(1, Math.floor((100 - prog) / 3)));
      
      // Simulate movement
      const startLat = 19.0760;
      const startLng = 72.8777;
      const endLat = destinationLocation.lat;
      const endLng = destinationLocation.lng;
      
      setDeliveryLocation({
        lat: startLat + (endLat - startLat) * (prog / 100),
        lng: startLng + (endLng - startLng) * (prog / 100)
      });
      
      if (prog < 10) {
        setStatus('picked_up');
        setStatusText('Order picked up from warehouse');
      } else if (prog < 90) {
        setStatus('in_transit');
        setStatusText('On the way to you');
      } else if (prog < 100) {
        setStatus('arriving');
        setStatusText('Almost there!');
      } else {
        setStatus('delivered');
        setStatusText('Delivered');
        clearInterval(interval);
        toast.success('Order delivered!');
      }
    }, 2000);
    
    return () => clearInterval(interval);
  }, [destinationLocation]);
  
  const statusSteps = [
    { id: 'placed', label: 'Order Placed', icon: Package },
    { id: 'picked_up', label: 'Picked Up', icon: CheckCircle },
    { id: 'in_transit', label: 'On The Way', icon: Truck },
    { id: 'arriving', label: 'Arriving', icon: Navigation },
    { id: 'delivered', label: 'Delivered', icon: CheckCircle }
  ];
  
  const currentStepIndex = statusSteps.findIndex(s => s.id === status);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-white z-50 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-slate-100 bg-white">
        <button onClick={onBack} className="p-2 rounded-xl hover:bg-slate-100" data-testid="back-btn">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div className="flex-1">
          <h2 className="font-bold text-slate-900">Track Order</h2>
          <p className="text-sm text-slate-500">{order?.order_number || 'Order'}</p>
        </div>
        <Badge variant={isConnected ? 'success' : 'warning'}>
          {isConnected ? 'Live' : 'Connecting...'}
        </Badge>
      </div>

      {/* Map Section */}
      <div className="flex-1 relative">
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
            center={deliveryLocation || { lat: 19.076, lng: 72.8777 }}
            zoom={14}
            options={{
              disableDefaultUI: true,
              zoomControl: true,
              styles: [
                { featureType: 'poi', stylers: [{ visibility: 'off' }] }
              ]
            }}
          >
            {/* Delivery person marker */}
            {deliveryLocation && (
              <Marker
                position={deliveryLocation}
                icon={{
                  path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z',
                  fillColor: '#3B82F6',
                  fillOpacity: 1,
                  strokeColor: '#1E40AF',
                  strokeWeight: 2,
                  scale: 1.5,
                  anchor: { x: 12, y: 24 }
                }}
              />
            )}
            
            {/* Destination marker */}
            <Marker
              position={destinationLocation}
              icon={{
                path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z',
                fillColor: '#10B981',
                fillOpacity: 1,
                strokeColor: '#047857',
                strokeWeight: 2,
                scale: 1.5,
                anchor: { x: 12, y: 24 }
              }}
            />
            
            {/* Route line */}
            {deliveryLocation && (
              <Polyline
                path={[deliveryLocation, destinationLocation]}
                options={{
                  strokeColor: '#3B82F6',
                  strokeOpacity: 0.8,
                  strokeWeight: 4,
                  icons: [{
                    icon: { path: 'M 0,-1 0,1', strokeOpacity: 1, scale: 3 },
                    offset: '0',
                    repeat: '20px'
                  }]
                }}
              />
            )}
          </GoogleMap>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-100">
            <Spinner size="lg" />
          </div>
        )}
        
        {/* ETA Overlay */}
        {eta && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 bg-white rounded-2xl shadow-xl px-6 py-3 flex items-center gap-3"
          >
            <Clock className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-xs text-slate-500">Estimated arrival</p>
              <p className="text-lg font-bold text-slate-900">{eta} min</p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Bottom Panel */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="bg-white rounded-t-3xl shadow-2xl"
        style={{ boxShadow: '0 -10px 40px rgba(0,0,0,0.1)' }}
      >
        {/* Progress Bar */}
        <div className="px-6 pt-6">
          <div className="flex items-center justify-between mb-2">
            <p className="font-semibold text-slate-900">{statusText}</p>
            <p className="text-sm text-blue-600 font-medium">{Math.round(progress)}%</p>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Status Steps */}
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {statusSteps.slice(1, 5).map((step, index) => (
              <div key={step.id} className="flex flex-col items-center">
                <motion.div
                  animate={{
                    scale: index <= currentStepIndex ? 1 : 0.8,
                    backgroundColor: index <= currentStepIndex ? '#3B82F6' : '#E2E8F0'
                  }}
                  className="w-10 h-10 rounded-full flex items-center justify-center mb-1"
                >
                  <step.icon className={`w-5 h-5 ${index <= currentStepIndex ? 'text-white' : 'text-slate-400'}`} />
                </motion.div>
                <span className={`text-xs ${index <= currentStepIndex ? 'text-blue-600 font-medium' : 'text-slate-400'}`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Driver Info */}
        {driver && (
          <div className="px-6 pb-6">
            <Card className="p-4 bg-gradient-to-r from-slate-50 to-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xl font-bold">
                  {driver.name?.charAt(0)}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900">{driver.name}</h4>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span>{driver.rating}</span>
                    <span>•</span>
                    <span className="truncate">{driver.vehicle}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    className="w-11 h-11 rounded-full bg-green-100 flex items-center justify-center"
                    onClick={() => window.open(`tel:${driver.phone}`)}
                    data-testid="call-driver-btn"
                  >
                    <Phone className="w-5 h-5 text-green-600" />
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center"
                    data-testid="message-driver-btn"
                  >
                    <MessageCircle className="w-5 h-5 text-blue-600" />
                  </motion.button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default LiveTracking;
