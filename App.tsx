import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Alert, Platform } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { TransitDataService } from './services/TransitDataService';
import ColorSchemeSelector from './components/ColorSchemeSelector';
import ColorLegend from './components/ColorLegend';
import LiveDataToggle from './components/LiveDataToggle';
import ViewModeToggle from './components/ViewModeToggle';
import { getColorForTravelTime } from './utils/ColorSchemes';
import { Polygon } from 'react-native-maps';

interface TransitPoint {
  latitude: number;
  longitude: number;
  travelTime: number;
}

interface TransitData {
  points: TransitPoint[];
  lastUpdated: Date;
}

export default function App() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [transitData, setTransitData] = useState<TransitData | null>(null);
  const [selectedColorScheme, setSelectedColorScheme] = useState<number>(0);
  const [isLiveDataEnabled, setIsLiveDataEnabled] = useState<boolean>(true);
  const [zoomLevel, setZoomLevel] = useState<number>(12);
  const [isHeatmapMode, setIsHeatmapMode] = useState<boolean>(false);
  const [currentMapRegion, setCurrentMapRegion] = useState<any>(null);
  const [isochronePolygons, setIsochronePolygons] = useState<any[]>([]);
  const transitService = useRef(new TransitDataService());
  const [subwayInfluencePolygons, setSubwayInfluencePolygons] = useState<any[]>([]);
  const [isSubwayInfluenceMode, setIsSubwayInfluenceMode] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);

  useEffect(() => {
    if (location) {
      fetchTransitData();
    }
  }, [location, isLiveDataEnabled, isHeatmapMode]); // Added isHeatmapMode dependency

  // Recalculate heatmap when map region changes significantly (for heatmap mode only)
  useEffect(() => {
    if (isHeatmapMode && location && currentMapRegion) {
      // Debounce the region change to avoid too many recalculations
      const timeoutId = setTimeout(() => {
        fetchTransitData();
      }, 1000); // Wait 1 second after region change

      return () => clearTimeout(timeoutId);
    }
  }, [currentMapRegion, isHeatmapMode]);

  useEffect(() => {
    if (isSubwayInfluenceMode && location) {
      fetchSubwayInfluencePolygons(location.coords);
      setTransitData({ points: [], lastUpdated: new Date() }); // <-- Add this line
    }
  }, [isSubwayInfluenceMode, location]);

  const fetchSubwayInfluencePolygons = async (center) => {
    // For each subway station, create a buffer polygon for its area of influence
    const stations = TransitDataService.NYC_SUBWAY_STATIONS || [];
    const polygons = [];
    const walkingSpeedKmPerMin = 0.083;
    const maxWalkMinutes = 30; // or any cutoff
    const maxDistanceKm = walkingSpeedKmPerMin * maxWalkMinutes;

    for (const station of stations) {
      // Buffer in meters
      const stationPoint = [station.longitude, station.latitude];
      // Use turf.buffer and turf.intersect with NYC boundary
      // Assume you have a helper in your service:
      const poly = await TransitDataService.getStationInfluencePolygon(station, maxDistanceKm);
      if (poly) {
        polygons.push({
          polygon: poly,
          color: '#3399ff', // or color by station/line
          stationName: station.name,
        });
      }
    }
    setSubwayInfluencePolygons(polygons);
  };
  const fetchTransitData = async () => {
    if (!location) return;
    setIsLoading(true); // Start loading
    try {
      // Update the service's live data setting
      transitService.current.setLiveDataEnabled(isLiveDataEnabled);
      
      let data: TransitData;
      
      if (isHeatmapMode) {
        // Get accessibility heatmap data
        // Adjust grid density based on zoom level for better performance and coverage
        let gridDensity: number;
        if (zoomLevel <= 10) {
          gridDensity = 30; // Lower density for far zoom (covers more area)
        } else if (zoomLevel <= 12) {
          gridDensity = 40; // Medium density for medium zoom
        } else if (zoomLevel <= 14) {
          gridDensity = 50; // Higher density for close zoom
        } else {
          gridDensity = 60; // Highest density for very close zoom
        }
        
        // Use map center for heatmap if available, otherwise use user location
        const heatmapCenter = currentMapRegion ? {
          latitude: currentMapRegion.latitude,
          longitude: currentMapRegion.longitude
        } : {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        };
        
        // data = await transitService.current.getAccessibilityHeatmapData(
        //   heatmapCenter,
        //   gridDensity
        // );
        const polygons = await transitService.current.getIsochronePolygons(
          heatmapCenter,
          gridDensity
        );
        data = { points: [], lastUpdated: new Date() }; 
        setTransitData({ points: [], lastUpdated: new Date() }); // You can keep this for legend/timestamp
        setIsochronePolygons(polygons); 
        
      } else {
        // Use subway stations data
        data = await transitService.current.getSubwayStationsData(
          { latitude: location.coords.latitude, longitude: location.coords.longitude }
        );
      }
      
      setTransitData(data);
    } catch (error) {
      console.error('Error fetching transit data:', error);
      Alert.alert('Error', 'Failed to fetch transit data');
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  const handleRegionChange = (region: any) => {
    // Calculate zoom level from region
    const zoom = Math.round(Math.log(360 / region.longitudeDelta) / Math.LN2);
    if (zoom !== zoomLevel) {
      console.log(`Zoom level changed from ${zoomLevel} to ${zoom}`);
      setZoomLevel(zoom);
    }
    
    // Store current map region for heatmap calculations
    setCurrentMapRegion(region);
  };

  if (errorMsg) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{errorMsg}</Text>
      </View>
    );
  }

  if (!location) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Getting your location...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Loading banner */}
      {isLoading && (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          backgroundColor: '#fff',
          padding: 10,
          zIndex: 10,
          borderBottomWidth: 1,
          borderBottomColor: '#3399ff'
        }}>
          <Text style={{ textAlign: 'center', fontWeight: 'bold', color: '#3399ff' }}>
            Loading heatmap...
          </Text>
        </View>
      )}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        onRegionChangeComplete={handleRegionChange}
      >
        {/* Subway area of influence polygons */}
        {isSubwayInfluenceMode && subwayInfluencePolygons.map((poly, idx) => (
          <Polygon
            key={idx}
            coordinates={poly.polygon.geometry.coordinates[0].map(([lng, lat]) => ({
              latitude: lat,
              longitude: lng,
            }))}
            fillColor={poly.color}
            strokeColor={poly.color}
            strokeWidth={1}
          />
        ))}
        {/* User location marker */}
        <Marker
          coordinate={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          }}
          title="You are here"
          description="Your current location"
          pinColor="blue"
        />

        {/* Transit data points */}
        {transitData?.points.map((point, index) => (
          <Marker
            key={index}
            coordinate={{
              latitude: point.latitude,
              longitude: point.longitude,
            }}
            title={`${point.travelTime.toFixed(0)} min`}
            description={isHeatmapMode ? "Accessibility time" : "Subway station travel time"}
          >
            <View
              style={[
                styles.transitPoint,
                {
                  backgroundColor: getColorForTravelTime(point.travelTime, selectedColorScheme),
                  opacity: isHeatmapMode ? 0.6 : 0.8,
                  width: isHeatmapMode ? 8 : 12,
                  height: isHeatmapMode ? 8 : 12,
                  borderRadius: isHeatmapMode ? 4 : 6,
                },
              ]}
            />
          </Marker>
        ))}
      </MapView>

      {/* UI Controls */}
      <ColorSchemeSelector
        selectedScheme={selectedColorScheme}
        onSchemeChange={(index) => {
          console.log('Color scheme changed to index:', index);
          setSelectedColorScheme(index);
        }}
      />
      
      <LiveDataToggle
        isLiveDataEnabled={isLiveDataEnabled}
        onToggle={setIsLiveDataEnabled}
      />

      <ViewModeToggle
        isHeatmapMode={isHeatmapMode}
        isSubwayInfluenceMode={isSubwayInfluenceMode}
        onToggleHeatmap={(isHeatmap) => setIsHeatmapMode(isHeatmap)}
        onToggleSubwayInfluence={(isInfluence) => setIsSubwayInfluenceMode(isInfluence)}
      />

      <ColorLegend 
        selectedScheme={selectedColorScheme}
        lastUpdated={transitData?.lastUpdated}
        isLiveDataEnabled={isLiveDataEnabled}
        isHeatmapMode={isHeatmapMode}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  transitPoint: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'white',
  },
  loadingText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
    color: 'red',
  },
}); 