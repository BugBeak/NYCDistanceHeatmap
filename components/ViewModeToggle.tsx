import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface ViewModeToggleProps {
  isHeatmapMode: boolean;
  onToggle: (isHeatmap: boolean) => void;
}

const ViewModeToggle: React.FC<ViewModeToggleProps> = ({ 
  isHeatmapMode, 
  onToggle 
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            !isHeatmapMode && styles.activeButton
          ]}
          onPress={() => onToggle(false)}
        >
          <Text style={[
            styles.toggleText,
            !isHeatmapMode && styles.activeText
          ]}>
            🚇 Stations
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.toggleButton,
            isHeatmapMode && styles.activeButton
          ]}
          onPress={() => onToggle(true)}
        >
          <Text style={[
            styles.toggleText,
            isHeatmapMode && styles.activeText
          ]}>
            🗺️ Heatmap
          </Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.description}>
        {isHeatmapMode 
          ? 'Shows accessibility heatmap with walking + transit times' 
          : 'Shows individual subway stations'
        }
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 150,
    left: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    padding: 15,
    maxWidth: 250,
  },
  toggleContainer: {
    flexDirection: 'row',
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    padding: 2,
    marginBottom: 8,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: '#007AFF',
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  activeText: {
    color: 'white',
  },
  description: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
});

export default ViewModeToggle; 