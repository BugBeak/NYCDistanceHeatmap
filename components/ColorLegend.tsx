import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { COLOR_SCHEMES, getColorWithOpacity } from '../utils/ColorSchemes';

interface ColorLegendProps {
  selectedScheme: number;
  lastUpdated?: Date;
  isLiveDataEnabled?: boolean;
  isHeatmapMode?: boolean;
}

const ColorLegend: React.FC<ColorLegendProps> = ({ 
  selectedScheme, 
  lastUpdated, 
  isLiveDataEnabled = true,
  isHeatmapMode = false
}) => {
  const scheme = COLOR_SCHEMES[selectedScheme];
  
  const timeIntervals = [
    '0-5 min',
    '5-10 min',
    '10-15 min',
    '15-20 min',
    '20-25 min',
    '25-30 min',
    '30-35 min',
    '35-40 min',
    '40-45 min',
    '45-50 min',
    '50-55 min',
    '55-60 min',
    '60-65 min',
    '65+ min',
  ];

  return (
    <View style={styles.legendContainer}>
      <Text style={styles.legendTitle}>
        {isHeatmapMode ? 'Area Accessibility Time' : 'Subway Station Travel Time'}
      </Text>
      
      {/* Live data status */}
      <View style={styles.statusContainer}>
        <View style={[styles.statusIndicator, { backgroundColor: isLiveDataEnabled ? '#4CAF50' : '#FF9800' }]} />
        <Text style={styles.statusText}>
          {isLiveDataEnabled ? 'Live Data' : 'Frozen Data'}
        </Text>
      </View>
      
      {/* Last updated time */}
      {lastUpdated && (
        <Text style={styles.lastUpdatedText}>
          Updated: {lastUpdated.toLocaleTimeString()}
        </Text>
      )}
      
      <View style={styles.legendContent}>
        {scheme.colors.map((color, index) => (
          <View key={index} style={styles.legendItem}>
            <View
              style={[
                styles.colorSwatch,
                { backgroundColor: color },
              ]}
            />
            <Text style={styles.timeText}>{timeIntervals[index]}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  legendContainer: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    padding: 15,
    maxWidth: Dimensions.get('window').width * 0.4,
    maxHeight: Dimensions.get('window').height * 0.6,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    justifyContent: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 5,
  },
  statusText: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
  },
  lastUpdatedText: {
    fontSize: 10,
    color: '#999',
    textAlign: 'center',
    marginBottom: 8,
  },
  legendContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
    width: '48%',
  },
  colorSwatch: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 5,
  },
  timeText: {
    fontSize: 10,
    color: '#666',
  },
});

export default ColorLegend; 