import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { COLOR_SCHEMES, ColorScheme } from '../utils/ColorSchemes';

interface ColorSchemeSelectorProps {
  selectedScheme: number;
  onSchemeChange: (index: number) => void;
}

const ColorSchemeSelector: React.FC<ColorSchemeSelectorProps> = ({
  selectedScheme,
  onSchemeChange,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  // Debug: Log the schemes on component mount
  React.useEffect(() => {
    console.log('ColorSchemeSelector mounted with', COLOR_SCHEMES.length, 'schemes');
    console.log('Available schemes:', COLOR_SCHEMES.map(s => s.name));
  }, []);

  const renderColorPreview = (scheme: ColorScheme) => {
    return (
      <View style={styles.colorPreview}>
        {scheme.colors.slice(0, 8).map((color, index) => (
          <View
            key={index}
            style={[
              styles.colorSwatch,
              { backgroundColor: color },
            ]}
          />
        ))}
      </View>
    );
  };

  return (
    <>
      <TouchableOpacity
        style={styles.selectorButton}
        onPress={() => {
          console.log('Opening color scheme selector with', COLOR_SCHEMES.length, 'schemes');
          console.log('Current selected scheme:', selectedScheme, COLOR_SCHEMES[selectedScheme]?.name);
          setModalVisible(true);
        }}
      >
        <Text style={styles.selectorButtonText}>
          🎨 {COLOR_SCHEMES[selectedScheme]?.name || 'Unknown'}
        </Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
        onShow={() => console.log('Modal shown with', COLOR_SCHEMES.length, 'schemes')}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose Color Scheme ({COLOR_SCHEMES.length} available)</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.schemeList} 
              showsVerticalScrollIndicator={true}
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              {COLOR_SCHEMES && COLOR_SCHEMES.length > 0 ? (
                COLOR_SCHEMES.map((scheme, index) => {
                  console.log('Rendering scheme', index, scheme.name);
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.schemeItem,
                        selectedScheme === index && styles.selectedScheme,
                      ]}
                      onPress={() => {
                        console.log('Selected scheme', index, scheme.name);
                        onSchemeChange(index);
                        setModalVisible(false);
                      }}
                    >
                      <View style={styles.schemeInfo}>
                        <Text style={styles.schemeName}>{scheme.name}</Text>
                        <Text style={styles.schemeDescription}>
                          {scheme.description}
                        </Text>
                      </View>
                      {renderColorPreview(scheme)}
                    </TouchableOpacity>
                  );
                })
              ) : (
                <View style={styles.schemeItem}>
                  <Text style={styles.schemeName}>No color schemes available</Text>
                  <Text style={styles.schemeDescription}>
                    Error loading color schemes
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  selectorButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    zIndex: 1000,
  },
  selectorButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: Dimensions.get('window').width * 0.9,
    maxHeight: Dimensions.get('window').height * 0.8,
    minHeight: 300, // Ensure minimum height
    elevation: 5, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#666',
  },
  schemeList: {
    flex: 1,
    minHeight: 200, // Ensure minimum height for content
  },
  schemeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    minHeight: 60, // Ensure minimum height for each item
  },
  selectedScheme: {
    backgroundColor: '#f0f8ff',
    borderRadius: 10,
  },
  schemeInfo: {
    flex: 1,
    marginRight: 15,
  },
  schemeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  schemeDescription: {
    fontSize: 12,
    color: '#666',
  },
  colorPreview: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorSwatch: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginHorizontal: 2,
  },
});

export default ColorSchemeSelector; 