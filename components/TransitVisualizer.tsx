import React from 'react';
import { Circle } from 'react-native-maps';
import { getColorWithOpacity } from '../utils/ColorSchemes';

interface TransitVisualizerProps {
  userLocation: {
    latitude: number;
    longitude: number;
  };
  transitData: {
    points: Array<{
      latitude: number;
      longitude: number;
      travelTime: number; // in minutes
    }>;
  };
  selectedColorScheme: number;
}

const TransitVisualizer: React.FC<TransitVisualizerProps> = ({ 
  userLocation, 
  transitData, 
  selectedColorScheme 
}) => {
  const getRadiusForTravelTime = (travelTime: number): number => {
    // More granular radius based on travel time
    if (travelTime <= 10) return 150; // Very close
    if (travelTime <= 20) return 200; // Close
    if (travelTime <= 30) return 250; // Moderate
    if (travelTime <= 45) return 300; // Far
    if (travelTime <= 60) return 350; // Very far
    return 400; // Extremely far
  };

  return (
    <>
      {transitData.points.map((point, index) => (
        <Circle
          key={index}
          center={{
            latitude: point.latitude,
            longitude: point.longitude,
          }}
          radius={getRadiusForTravelTime(point.travelTime)}
          fillColor={getColorWithOpacity(point.travelTime, selectedColorScheme, 0.4)}
          strokeColor={getColorWithOpacity(point.travelTime, selectedColorScheme, 0.8)}
          strokeWidth={1}
        />
      ))}
    </>
  );
};

export default TransitVisualizer; 