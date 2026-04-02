import React, { useState, useCallback, useRef } from 'react';
import { GoogleMap, LoadScript, Marker, Autocomplete } from '@react-google-maps/api';

const mapContainerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '1rem'
};

const defaultCenter = {
  lat: 24.7136,
  lng: 46.6753
};

const libraries = ['places'];

const LocationPicker = ({ onLocationSelect, initialLocation = null }) => {
  const [selectedLocation, setSelectedLocation] = useState(initialLocation || defaultCenter);
  const [address, setAddress] = useState('');
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [autocomplete, setAutocomplete] = useState(null);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const onLoad = useCallback((map) => {
    setMap(map);
    if (initialLocation) {
      map.panTo(initialLocation);
    }
  }, [initialLocation]);

  const onLoadAutocomplete = (autocomplete) => {
    setAutocomplete(autocomplete);
  };

  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      if (place.geometry) {
        const location = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        };
        setSelectedLocation(location);
        setAddress(place.formatted_address || place.name);
        setMarker(location);
        if (map) map.panTo(location);
        if (onLocationSelect) {
          onLocationSelect({
            lat: location.lat,
            lng: location.lng,
            address: place.formatted_address || place.name,
            name: place.name,
            placeId: place.place_id
          });
        }
      }
    }
  };

  const onMapClick = (event) => {
    const location = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng()
    };
    setSelectedLocation(location);
    setMarker(location);
    setAddress('موقع محدد على الخريطة');
    if (onLocationSelect) {
      onLocationSelect({
        lat: location.lat,
        lng: location.lng,
        address: 'موقع محدد على الخريطة'
      });
    }
  };

  const onMarkerDragEnd = (event) => {
    const location = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng()
    };
    setSelectedLocation(location);
    setMarker(location);
    if (onLocationSelect) {
      onLocationSelect({
        lat: location.lat,
        lng: location.lng,
        address: address || 'موقع محدد على الخريطة'
      });
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setSelectedLocation(location);
          setMarker(location);
          if (map) map.panTo(location);
          if (onLocationSelect) {
            onLocationSelect({
              lat: location.lat,
              lng: location.lng,
              address: 'موقعك الحالي'
            });
          }
        },
        () => {
          alert('لم نتمكن من تحديد موقعك. يرجى اختيار الموقع يدوياً.');
        }
      );
    }
  };

  if (!apiKey) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
        <p className="text-yellow-700">⚠️ لم يتم إعداد Google Maps API. الرجاء إضافة مفتاح API في ملف .env</p>
      </div>
    );
  }

  return (
    <LoadScript googleMapsApiKey={apiKey} libraries={libraries}>
      <div className="space-y-4">
        <div className="flex gap-3 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <Autocomplete
              onLoad={onLoadAutocomplete}
              onPlaceChanged={onPlaceChanged}
            >
              <input
                type="text"
                placeholder="ابحث عن صالة، فندق، استراحة، أو موقع..."
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
              />
            </Autocomplete>
            <p className="text-xs text-primary-light mt-1">
              ✏️ اكتب اسم الصالة - ستظهر لك خيارات أثناء الكتابة
            </p>
          </div>
          <button
            onClick={getCurrentLocation}
            className="px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition whitespace-nowrap"
          >
            📍 موقعي الحالي
          </button>
        </div>

        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={selectedLocation}
          zoom={15}
          onLoad={onLoad}
          onClick={onMapClick}
        >
          {marker && (
            <Marker
              position={marker}
              draggable={true}
              onDragEnd={onMarkerDragEnd}
            />
          )}
        </GoogleMap>

        {address && (
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-primary-light text-sm mb-2">📍 الموقع المحدد:</p>
            <p className="text-primary font-medium">{address}</p>
            <p className="text-xs text-primary-light mt-2">
              خط العرض: {selectedLocation.lat.toFixed(6)} | خط الطول: {selectedLocation.lng.toFixed(6)}
            </p>
          </div>
        )}
      </div>
    </LoadScript>
  );
};

export default LocationPicker;
