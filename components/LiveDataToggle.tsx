import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';

interface LiveDataToggleProps {
  isLiveDataEnabled: boolean;
  onToggle: (enabled: boolean) => void;
}

const LiveDataToggle: React.FC<LiveDataToggleProps> = ({ 
  isLiveDataEnabled, 
  onToggle 
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.toggleContainer}>
        <Text style={styles.label}>Live Data</Text>
        <Switch
          value={isLiveDataEnabled}
          onValueChange={onToggle}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={isLiveDataEnabled ? '#007AFF' : '#f4f3f4'}
        />
      </View>
      <Text style={styles.description}>
        {isLiveDataEnabled 
          ? 'Data refreshes every 5 minutes' 
          : 'Data stays frozen from when app opened'
        }
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 100,
    left: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    padding: 15,
    maxWidth: 200,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  description: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
});

export default LiveDataToggle; 