import { Feather, Ionicons } from '@expo/vector-icons';
import { useRef } from 'react';
import { useRouter } from 'expo-router';
import {
  Linking,
  Pressable,
  StatusBar,
  Text,
  View,
} from 'react-native';
import WebView from 'react-native-webview';

// Koordinat RSUP Dr. Kariadi, Semarang
const HOSPITAL = {
  name: 'RSUP Dr. Kariadi',
  subtitle: 'Rute Bunda',
  address: 'Randusari, Semarang',
  fullAddress: 'Jl. Dr. Sutomo No.16, Randusari, Kec. Semarang Sel., Semarang',
  latitude: -6.9985,
  longitude: 110.4127,
  phone: '(024) 8413476',
  type: 'Rumah Sakit Umum Pusat',
};

// ── Leaflet HTML ──────────────────────────────────────────────────────────────
const LEAFLET_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0,
        maximum-scale=1.0, user-scalable=no" />
  <link
    rel="stylesheet"
    href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
  />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #map { width: 100%; height: 100%; }

    /* Custom marker pin */
    .hospital-pin {
      width: 34px; height: 34px;
      background: #FFB6A6;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 3px solid #fff;
      box-shadow: 0 3px 10px rgba(0,0,0,0.25);
    }
    .hospital-pin::after {
      content: '';
      position: absolute;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%) rotate(45deg);
      width: 10px; height: 10px;
      background: #fff;
      border-radius: 50%;
    }

    /* Custom popup */
    .leaflet-popup-content-wrapper {
      border-radius: 14px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
      font-family: sans-serif;
    }
    .leaflet-popup-content { margin: 10px 14px; }
    .popup-title { font-weight: 700; color: #3D3D3D; font-size: 13px; }
    .popup-sub   { color: #9E9E9E; font-size: 11px; margin-top: 2px; }

    /* Zoom control position */
    .leaflet-top.leaflet-right { top: 10px; right: 10px; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var LAT = ${HOSPITAL.latitude};
    var LNG = ${HOSPITAL.longitude};

    var map = L.map('map', {
      zoomControl: false,
      attributionControl: false,
    }).setView([LAT, LNG], 16);

    // OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    // Zoom control (bottom-right to avoid header overlap)
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Custom hospital marker
    var pinIcon = L.divIcon({
      className: '',
      html: '<div class="hospital-pin"></div>',
      iconSize:   [34, 34],
      iconAnchor: [17, 34],
      popupAnchor:[0, -38],
    });

    L.marker([LAT, LNG], { icon: pinIcon })
      .addTo(map)
      .bindPopup(
        '<div class="popup-title">RSUP Dr. Kariadi</div>' +
        '<div class="popup-sub">Randusari, Semarang</div>'
      )
      .openPopup();

    // Re-center command from React Native
    function handleMessage(e) {
      try {
        var msg = typeof e.data === 'string' ? e.data : JSON.stringify(e.data);
        if (msg === 'center') {
          map.setView([LAT, LNG], 16, { animate: true });
        }
      } catch(_) {}
    }
    document.addEventListener('message', handleMessage);
    window.addEventListener('message', handleMessage);
  </script>
</body>
</html>
`;

export default function RuteBundaScreen() {
  const router   = useRouter();
  const webViewRef = useRef<WebView>(null);

  const handleCenterMap = () => {
    // Send 'center' message to Leaflet inside WebView
    webViewRef.current?.injectJavaScript(`
      map.setView([${HOSPITAL.latitude}, ${HOSPITAL.longitude}], 16, { animate: true });
      true;
    `);
  };

  const handleNavigasi = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${HOSPITAL.latitude},${HOSPITAL.longitude}&travelmode=driving`;
    Linking.openURL(url);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FDE3E7' }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      {/* ── Leaflet Map via WebView ── */}
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: LEAFLET_HTML }}
        style={{ flex: 1 }}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState={false}
        scrollEnabled={false}
      />

      {/* ── Floating Header ── */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          paddingTop: 48,
          paddingBottom: 16,
          paddingHorizontal: 16,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        }}
      >
        {/* Back Button */}
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => ({
            backgroundColor: pressed ? 'rgba(255,235,235,0.95)' : 'rgba(255,255,255,0.95)',
            borderRadius: 999,
            padding: 10,
            elevation: 6,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 5,
          })}
        >
          <Ionicons name="arrow-back" size={20} color="#6CA8C2" />
        </Pressable>

        {/* Title Card */}
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(255,255,255,0.95)',
            borderRadius: 20,
            paddingVertical: 10,
            paddingHorizontal: 14,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            elevation: 6,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.12,
            shadowRadius: 5,
          }}
        >
          {/* Location icon */}
          <View
            style={{
              backgroundColor: '#FFB6A6',
              borderRadius: 999,
              width: 42,
              height: 42,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="location" size={22} color="#FFFFFF" />
          </View>

          {/* Text */}
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontFamily: 'FuzzyBubbles_400Regular',
                fontSize: 11,
                color: '#FFB6A6',
                marginBottom: 1,
              }}
            >
              {HOSPITAL.subtitle}
            </Text>
            <Text
              style={{
                fontFamily: 'FuzzyBubbles_700Bold',
                fontSize: 16,
                color: '#4A4A4A',
                lineHeight: 20,
              }}
            >
              {HOSPITAL.name}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 }}>
              <Ionicons name="location-outline" size={11} color="#FFB6A6" />
              <Text
                style={{
                  fontFamily: 'FuzzyBubbles_400Regular',
                  fontSize: 11,
                  color: '#9E9E9E',
                }}
              >
                {HOSPITAL.address}
              </Text>
            </View>
          </View>

          {/* Search → Dokter List */}
          <Pressable
            onPress={() => router.push('/dokter-list')}
            style={({ pressed }) => ({
              backgroundColor: pressed ? '#FFD0C0' : '#FFB6A6',
              borderRadius: 14,
              padding: 10,
            })}
          >
            <Feather name="search" size={18} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>

      {/* ── Center Map Button ── */}
      <Pressable
        onPress={handleCenterMap}
        style={({ pressed }) => ({
          position: 'absolute',
          bottom: 210,
          right: 16,
          backgroundColor: pressed ? 'rgba(255,235,235,0.95)' : 'rgba(255,255,255,0.95)',
          borderRadius: 999,
          padding: 12,
          elevation: 6,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 5,
        })}
      >
        <Ionicons name="locate" size={22} color="#FFB6A6" />
      </Pressable>

      {/* ── Bottom Hospital Info Card ── */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#FFFFFF',
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: 32,
          elevation: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
        }}
      >
        {/* Drag handle */}
        <View
          style={{
            width: 40,
            height: 4,
            backgroundColor: '#E0E0E0',
            borderRadius: 999,
            alignSelf: 'center',
            marginBottom: 16,
          }}
        />

        {/* Hospital type badge */}
        <View
          style={{
            backgroundColor: '#FFF0EC',
            alignSelf: 'flex-start',
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 8,
            marginBottom: 10,
          }}
        >
          <Text
            style={{
              fontFamily: 'FuzzyBubbles_700Bold',
              fontSize: 10,
              color: '#FFB6A6',
            }}
          >
            {HOSPITAL.type}
          </Text>
        </View>

        {/* Hospital name */}
        <Text
          style={{
            fontFamily: 'FuzzyBubbles_700Bold',
            fontSize: 22,
            color: '#3D3D3D',
            marginBottom: 6,
          }}
        >
          {HOSPITAL.name}
        </Text>

        {/* Address */}
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginBottom: 14 }}>
          <Ionicons name="location-outline" size={14} color="#FFB6A6" style={{ marginTop: 2 }} />
          <Text
            style={{
              fontFamily: 'FuzzyBubbles_400Regular',
              fontSize: 13,
              color: '#888',
              flex: 1,
              lineHeight: 19,
            }}
          >
            {HOSPITAL.fullAddress}
          </Text>
        </View>

        {/* Divider */}
        <View style={{ height: 1, backgroundColor: '#F5F5F5', marginBottom: 14 }} />

        {/* Info Row */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 18 }}>
          <View
            style={{
              flex: 1,
              backgroundColor: '#FFF8F6',
              borderRadius: 14,
              padding: 12,
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Feather name="phone" size={16} color="#FFB6A6" />
            <Text style={{ fontFamily: 'FuzzyBubbles_700Bold', fontSize: 11, color: '#555', textAlign: 'center' }}>
              {HOSPITAL.phone}
            </Text>
          </View>
          <View
            style={{
              flex: 1,
              backgroundColor: '#F0F8F6',
              borderRadius: 14,
              padding: 12,
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Feather name="clock" size={16} color="#6CA8C2" />
            <Text style={{ fontFamily: 'FuzzyBubbles_700Bold', fontSize: 11, color: '#555', textAlign: 'center' }}>
              24 Jam
            </Text>
          </View>
          <View
            style={{
              flex: 1,
              backgroundColor: '#FFF8F6',
              borderRadius: 14,
              padding: 12,
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Feather name="star" size={16} color="#FFB6A6" />
            <Text style={{ fontFamily: 'FuzzyBubbles_700Bold', fontSize: 11, color: '#555', textAlign: 'center' }}>
              4.5 / 5.0
            </Text>
          </View>
        </View>

        {/* Direction Button */}
        <Pressable
          onPress={handleNavigasi}
          style={({ pressed }) => ({
            backgroundColor: pressed ? '#F0A080' : '#FFB6A6',
            borderRadius: 999,
            paddingVertical: 14,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            elevation: 4,
            shadowColor: '#FFB6A6',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.4,
            shadowRadius: 8,
          })}
        >
          <Feather name="navigation" size={18} color="#FFFFFF" />
          <Text
            style={{
              fontFamily: 'FuzzyBubbles_700Bold',
              fontSize: 15,
              color: '#FFFFFF',
            }}
          >
            Mulai Navigasi
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
