import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Linking,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  View,
} from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import WebView from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface HospitalItem {
  id: string;
  name: string;
  type: string;
  address: string;
  fullAddress: string;
  latitude: number;
  longitude: number;
  phone: string;
  rating: string;
  openHours: string;
  distance?: string;
  distanceKm?: number;
  isNearest?: boolean;
}

export const HOSPITALS_DATA: HospitalItem[] = [
  {
    id: 'kariadi',
    name: 'RSUP Dr. Kariadi',
    type: 'RSUP Rujukan Pulmonologi Anak',
    address: 'Randusari, Semarang Selatan',
    fullAddress: 'Jl. Dr. Sutomo No.16, Randusari, Kec. Semarang Sel., Semarang',
    latitude: -6.9985,
    longitude: 110.4127,
    phone: '(024) 8413476',
    rating: '4.8',
    openHours: '24 Jam',
    distance: '1,2 km',
  },
  {
    id: 'hermina',
    name: 'RS Hermina Pandanaran',
    type: 'RS Ibu & Anak (Poli Anak 24 Jam)',
    address: 'Pandanaran, Semarang',
    fullAddress: 'Jl. Pandanaran No.24, Pekunden, Kec. Semarang Tengah, Semarang',
    latitude: -6.9885,
    longitude: 110.4140,
    phone: '(024) 8442525',
    rating: '4.7',
    openHours: '24 Jam',
    distance: '1,8 km',
  },
  {
    id: 'telogorejo',
    name: 'SMC RS Telogorejo',
    type: 'RS Pusat Unggulan Terapi Paru',
    address: 'Pekunden, Semarang',
    fullAddress: 'Jl. KH. Ahmad Dahlan, Pekunden, Kec. Semarang Tengah, Semarang',
    latitude: -6.9868,
    longitude: 110.4195,
    phone: '(024) 86466000',
    rating: '4.8',
    openHours: '24 Jam',
    distance: '2,4 km',
  },
  {
    id: 'elisabeth',
    name: 'RS St. Elisabeth',
    type: 'RS Layanan Sesak & Respirologi',
    address: 'Wonotingal, Candisari',
    fullAddress: 'Jl. Kawi Raya No.1, Wonotingal, Kec. Candisari, Semarang',
    latitude: -7.0090,
    longitude: 110.4220,
    phone: '(024) 8310076',
    rating: '4.7',
    openHours: '24 Jam',
    distance: '3,5 km',
  },
  {
    id: 'columbia',
    name: 'Columbia Asia Hospital',
    type: 'RS Swasta & IGD Anak Darurat',
    address: 'Kalibanteng Kulon, Semarang Barat',
    fullAddress: 'Jl. Siliwangi No.143, Kalibanteng Kulon, Kec. Semarang Barat, Semarang',
    latitude: -6.9830,
    longitude: 110.3790,
    phone: '(024) 7629999',
    rating: '4.9',
    openHours: '24 Jam',
    distance: '4,6 km',
  },
];

function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function RuteBundaScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const webViewRef = useRef<WebView>(null);
  const [hospitals, setHospitals] = useState<HospitalItem[]>(HOSPITALS_DATA);
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>('kariadi');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>({
    lat: -6.9932,
    lng: 110.4203,
  });
  const [isGpsActive, setIsGpsActive] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          const uLat = loc.coords.latitude;
          const uLng = loc.coords.longitude;
          setUserLocation({ lat: uLat, lng: uLng });
          setIsGpsActive(true);

          // Hitung jarak dinamis untuk semua rumah sakit
          const updated = HOSPITALS_DATA.map((h) => {
            const dKm = calculateDistanceKm(uLat, uLng, h.latitude, h.longitude);
            return {
              ...h,
              distanceKm: dKm,
              distance: `${dKm.toFixed(1).replace('.', ',')} km`,
            };
          });

          updated.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));

          if (updated.length > 0) {
            updated[0].isNearest = true;
            updated[0].distance = `${updated[0].distance} - Terdekat`;
            setSelectedHospitalId(updated[0].id);
          }

          setHospitals(updated);

          // Update Leaflet map with new user location and hospitals
          const jsCode = `
            if (window.setUserAndHospitals) {
              window.setUserAndHospitals(${uLat}, ${uLng}, ${JSON.stringify(updated)});
            }
            true;
          `;
          webViewRef.current?.injectJavaScript(jsCode);
        }
      } catch (err) {
        console.log('GPS error fallback to default Semarang center');
      }
    })();
  }, []);

  const selectedHospital = hospitals.find((h) => h.id === selectedHospitalId) || hospitals[0];

  const handleSelectHospital = (hospital: HospitalItem) => {
    setSelectedHospitalId(hospital.id);
    webViewRef.current?.injectJavaScript(`
      if (window.selectHospitalById) {
        window.selectHospitalById("${hospital.id}");
      }
      true;
    `);
  };

  const handleCenterMap = () => {
    webViewRef.current?.injectJavaScript(`
      if (window.centerOnSelected) {
        window.centerOnSelected();
      } else {
        map.setView([${selectedHospital.latitude}, ${selectedHospital.longitude}], 16, { animate: true });
      }
      true;
    `);
  };

  const handleNavigasi = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedHospital.latitude},${selectedHospital.longitude}&travelmode=driving`;
    Linking.openURL(url);
  };

  const handleCallHospital = () => {
    const cleanNumber = selectedHospital.phone.replace(/[^0-9+]/g, '');
    Linking.openURL(`tel:${cleanNumber}`);
  };

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'SELECT_HOSPITAL' && data.id) {
        setSelectedHospitalId(data.id);
      }
    } catch (e) {}
  };

  const LEAFLET_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #map { width: 100%; height: 100%; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }

    /* Custom marker pin */
    .hospital-pin {
      width: 38px; height: 38px;
      background: #6CA8C2;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 3px solid #fff;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      cursor: pointer;
    }
    .hospital-pin.selected {
      background: #FFAE9D;
      transform: rotate(-45deg) scale(1.18);
      border-color: #ffffff;
      box-shadow: 0 6px 16px rgba(255,174,157,0.6);
      z-index: 1000 !important;
    }
    .hospital-pin-icon {
      transform: rotate(45deg);
      color: #ffffff;
      font-weight: 900;
      font-size: 16px;
    }

    /* User location marker */
    .user-pin {
      width: 20px; height: 20px;
      background: #2E7D32;
      border: 3.5px solid #ffffff;
      border-radius: 50%;
      box-shadow: 0 0 0 6px rgba(46, 125, 50, 0.25);
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(46, 125, 50, 0.4); }
      70% { box-shadow: 0 0 0 14px rgba(46, 125, 50, 0); }
      100% { box-shadow: 0 0 0 0 rgba(46, 125, 50, 0); }
    }

    /* Custom popup */
    .leaflet-popup-content-wrapper {
      border-radius: 16px;
      box-shadow: 0 6px 20px rgba(0,0,0,0.15);
      padding: 4px;
    }
    .leaflet-popup-content { margin: 8px 12px; }
    .popup-title { font-weight: 700; color: #3D7371; font-size: 13px; }
    .popup-sub   { color: #666; font-size: 11px; margin-top: 2px; }
    .popup-dist  { color: #E65100; font-size: 11px; font-weight: 700; margin-top: 4px; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var userLat = ${userLocation.lat};
    var userLng = ${userLocation.lng};
    var hospitalsList = ${JSON.stringify(hospitals)};
    var selectedId = "${selectedHospitalId}";

    var map = L.map('map', {
      zoomControl: false,
      attributionControl: false,
    }).setView([userLat, userLng], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    var userMarker = null;
    var markersMap = {};
    var routeLine = null;

    function renderMarkers() {
      // Clear old
      Object.keys(markersMap).forEach(function(k) {
        map.removeLayer(markersMap[k]);
      });
      markersMap = {};

      if (userMarker) {
        map.removeLayer(userMarker);
      }
      if (routeLine) {
        map.removeLayer(routeLine);
      }

      // User location
      var userIcon = L.divIcon({
        className: '',
        html: '<div class="user-pin"></div>',
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });
      userMarker = L.marker([userLat, userLng], { icon: userIcon }).addTo(map).bindPopup('<div class="popup-title">📍 Lokasi Bunda</div>');

      // Hospitals
      hospitalsList.forEach(function(h) {
        var isSel = h.id === selectedId;
        var iconHtml = '<div class="hospital-pin ' + (isSel ? 'selected' : '') + '"><span class="hospital-pin-icon">+</span></div>';
        var pinIcon = L.divIcon({
          className: '',
          html: iconHtml,
          iconSize: [38, 38],
          iconAnchor: [19, 38],
          popupAnchor: [0, -40],
        });

        var m = L.marker([h.latitude, h.longitude], { icon: pinIcon })
          .addTo(map)
          .bindPopup(
            '<div class="popup-title">' + h.name + '</div>' +
            '<div class="popup-sub">' + h.address + '</div>' +
            '<div class="popup-dist">🚗 ' + (h.distance || 'Terdekat') + '</div>'
          );

        m.on('click', function() {
          selectHospitalById(h.id);
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'SELECT_HOSPITAL', id: h.id }));
          }
        });

        markersMap[h.id] = m;
      });

      // Draw dashed route line to selected
      var targetHospital = hospitalsList.find(function(h) { return h.id === selectedId; }) || hospitalsList[0];
      if (targetHospital) {
        routeLine = L.polyline([
          [userLat, userLng],
          [targetHospital.latitude, targetHospital.longitude]
        ], {
          color: '#FFAE9D',
          weight: 4,
          opacity: 0.85,
          dashArray: '8, 8'
        }).addTo(map);

        if (markersMap[selectedId]) {
          markersMap[selectedId].openPopup();
        }
      }
    }

    window.selectHospitalById = function(id) {
      selectedId = id;
      renderMarkers();
      var target = hospitalsList.find(function(h) { return h.id === id; });
      if (target) {
        map.flyTo([target.latitude, target.longitude], 15, { duration: 0.8 });
      }
    };

    window.centerOnSelected = function() {
      var target = hospitalsList.find(function(h) { return h.id === selectedId; });
      if (target) {
        map.flyTo([target.latitude, target.longitude], 16, { duration: 0.8 });
      }
    };

    window.setUserAndHospitals = function(lat, lng, newList) {
      userLat = lat;
      userLng = lng;
      hospitalsList = newList;
      renderMarkers();
      map.setView([userLat, userLng], 14);
    };

    renderMarkers();
  </script>
</body>
</html>
`;

  return (
    <View className="flex-1 bg-[#FDE3E7]">
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      {/* ── Leaflet Interactive Map ── */}
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: LEAFLET_HTML }}
        style={{ flex: 1 }}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState={false}
        scrollEnabled={false}
        onMessage={handleWebViewMessage}
      />

      {/* ── Floating Header ── */}
      <View
        style={{ paddingTop: Math.max(insets.top + 8, 44) }}
        className="absolute top-0 left-0 right-0 pb-3 px-4 flex-row items-center gap-3"
      >
        {/* Back Button */}
        <Pressable
          onPress={() => router.back()}
          className="bg-white/95 rounded-full p-2.5 elevation-6 shadow-sm active:bg-white/70"
          hitSlop={10}
        >
          <Ionicons name="arrow-back" size={20} color="#6CA8C2" />
        </Pressable>

        {/* Title Bar */}
        <View className="flex-1 bg-white/95 rounded-2xl py-2 px-3.5 flex-row items-center gap-3 elevation-6 shadow-sm">
          <View className="bg-[#FFAE9D] rounded-full w-9 h-9 items-center justify-center">
            <MaterialCommunityIcons name="hospital-building" size={20} color="#FFFFFF" />
          </View>

          <View className="flex-1 overflow-hidden">
            <Text style={{ fontFamily: 'FuzzyBubbles_700Bold' }} className="text-[11px] text-[#FFAE9D]">
              Rute Bunda & Faskes Paru
            </Text>
            <Text
              style={{ fontFamily: 'FuzzyBubbles_700Bold' }}
              className="text-sm text-[#3D7371]"
              numberOfLines={1}
            >
              {hospitals.length} Rumah Sakit Terdekat
            </Text>
          </View>

          {/* Quick Doctor Link */}
          <Pressable
            onPress={() => router.push('/dokter-list')}
            className="bg-[#6CA8C2] rounded-xl p-2 active:bg-[#5C94AD]"
            hitSlop={8}
          >
            <Feather name="user-check" size={16} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>

      {/* ── Center / Locate Button ── */}
      <Pressable
        onPress={handleCenterMap}
        style={{ bottom: Math.max(insets.bottom + 235, 250) }}
        className="absolute right-4 bg-white/95 rounded-full p-3 elevation-6 shadow-md active:bg-white/70"
        hitSlop={10}
      >
        <Ionicons name="locate" size={22} color="#6CA8C2" />
      </Pressable>

      {/* ── Bottom Drawer: Hospital List & Selected Hospital Details ── */}
      <View
        style={{ paddingBottom: Math.max(insets.bottom + 12, 24) }}
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl pt-3 px-5 elevation-10 shadow-lg"
      >
        {/* Handle */}
        <View className="w-10 h-1 bg-gray-300 rounded-full self-center mb-3" />

        {/* Horizontal Hospital Chips Selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingBottom: 10 }}
        >
          {hospitals.map((h) => {
            const isSelected = h.id === selectedHospitalId;
            return (
              <Pressable
                key={h.id}
                onPress={() => handleSelectHospital(h)}
                className={`py-1.5 px-3 rounded-full border flex-row items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#6CA8C2] border-[#6CA8C2]'
                    : 'bg-[#F7FBFA] border-[#E0ECE9]'
                }`}
              >
                <MaterialCommunityIcons
                  name="hospital-marker"
                  size={14}
                  color={isSelected ? '#FFFFFF' : '#3D7371'}
                />
                <Text
                  style={{ fontFamily: 'FuzzyBubbles_700Bold' }}
                  className={`text-xs ${isSelected ? 'text-white' : 'text-[#3D7371]'}`}
                  numberOfLines={1}
                >
                  {h.name}
                </Text>
                {h.distance && (
                  <Text
                    style={{ fontFamily: 'FuzzyBubbles_700Bold' }}
                    className={`text-[10px] ${isSelected ? 'text-[#FFE5E5]' : 'text-[#E65100]'}`}
                  >
                    ({h.distance.split(' - ')[0]})
                  </Text>
                )}
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Selected Hospital Info Card */}
        <View className="mt-1">
          <View className="flex-row justify-between items-start mb-1">
            <View className="flex-1 pr-2 overflow-hidden">
              <View className="bg-[#FFE5E5] self-start px-2 py-0.5 rounded-md mb-1">
                <Text style={{ fontFamily: 'FuzzyBubbles_700Bold' }} className="text-[10px] text-[#F0A080]">
                  {selectedHospital.type}
                </Text>
              </View>
              <Text
                style={{ fontFamily: 'FuzzyBubbles_700Bold' }}
                className="text-base text-[#3D3D3D]"
                numberOfLines={1}
              >
                {selectedHospital.name}
              </Text>
            </View>

            {/* Distance badge */}
            <View className="bg-[#E8F5F2] px-2.5 py-1 rounded-xl items-center border border-[#95C1B6]">
              <Text style={{ fontFamily: 'FuzzyBubbles_700Bold' }} className="text-xs text-[#2E7D32]">
                {selectedHospital.distance || 'Terdekat'}
              </Text>
            </View>
          </View>

          {/* Address */}
          <View className="flex-row items-center gap-1.5 mb-2.5">
            <Ionicons name="location-outline" size={14} color="#6CA8C2" />
            <Text
              style={{ fontFamily: 'FuzzyBubbles_400Regular' }}
              className="text-xs text-gray-500 flex-1"
              numberOfLines={1}
            >
              {selectedHospital.fullAddress}
            </Text>
          </View>

          {/* Quick Info Badges */}
          <View className="flex-row gap-2 mb-3">
            <View className="flex-1 bg-[#FFF8F6] rounded-xl py-2 px-1.5 items-center flex-row justify-center gap-1 border border-[#FFE0D8]">
              <Feather name="phone" size={12} color="#FFAE9D" />
              <Text
                style={{ fontFamily: 'FuzzyBubbles_700Bold' }}
                className="text-[10.5px] text-gray-700"
                numberOfLines={1}
              >
                {selectedHospital.phone}
              </Text>
            </View>
            <View className="flex-1 bg-[#F0F8F6] rounded-xl py-2 px-1.5 items-center flex-row justify-center gap-1 border border-[#CDE5E0]">
              <Feather name="clock" size={12} color="#6CA8C2" />
              <Text
                style={{ fontFamily: 'FuzzyBubbles_700Bold' }}
                className="text-[10.5px] text-gray-700"
                numberOfLines={1}
              >
                {selectedHospital.openHours}
              </Text>
            </View>
            <View className="bg-[#FFF8F6] rounded-xl py-2 px-2.5 items-center flex-row justify-center gap-1 border border-[#FFE0D8]">
              <Feather name="star" size={12} color="#FFAE9D" />
              <Text style={{ fontFamily: 'FuzzyBubbles_700Bold' }} className="text-[10.5px] text-gray-700">
                {selectedHospital.rating}
              </Text>
            </View>
          </View>

          {/* Action Buttons: Detail Rumah Sakit & Navigasi Google Maps */}
          <View className="flex-row gap-2.5">
            <Pressable
              onPress={() =>
                router.push({
                  pathname: '/rumah-sakit-detail',
                  params: { id: selectedHospital.id },
                })
              }
              className="bg-[#FFE5E5] rounded-2xl py-3 px-3.5 items-center justify-center flex-row gap-1.5 elevation-2 active:bg-[#FFD6D6]"
            >
              <Feather name="info" size={15} color="#6CA8C2" />
              <Text style={{ fontFamily: 'FuzzyBubbles_700Bold' }} className="text-[#6CA8C2] text-xs">
                Detail RS
              </Text>
            </Pressable>

            <Pressable
              onPress={handleNavigasi}
              className="flex-1 bg-[#6CA8C2] rounded-2xl py-3 items-center justify-center flex-row gap-2 elevation-3 shadow-md active:bg-[#5C94AD]"
            >
              <Feather name="navigation" size={16} color="#FFFFFF" />
              <Text style={{ fontFamily: 'FuzzyBubbles_700Bold' }} className="text-white text-xs">
                Mulai Navigasi Rute
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}
