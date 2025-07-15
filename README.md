# NYC Transit Visualizer

An iPhone app that visualizes NYC with colors based on public transport distance from your current location, using MTA API data.

## Features

- 📍 Real-time location tracking
- 🚇 MTA transit data integration
- 🎨 **6 different color schemes** with fine-grained 5-minute intervals
- 📱 Native iOS experience with React Native
- 🎛️ **Color scheme selector** - switch themes on the fly
- 📊 **Interactive legend** showing time intervals

## Color Schemes Available

1. **Traffic Light** - Classic green to red progression
2. **Ocean** - Cool blues to deep navy
3. **Sunset** - Warm pinks to oranges
4. **Rainbow** - Full spectrum colors
5. **Heat Map** - Scientific blue-to-red heat mapping
6. **Monochrome** - Grayscale progression

## Setup Instructions

### Prerequisites

1. **Node.js** (v16 or higher)
2. **Expo CLI**: `npm install -g @expo/cli`
3. **Xcode** (for iOS development)
4. **iOS Simulator** or physical iPhone

### Installation

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm start
   ```

3. **Run on iOS:**
   ```bash
   npm run ios
   ```

## MTA API Configuration

### Getting MTA API Access

1. **Register for MTA API:**
   - Go to [MTA API Portal](https://api.mta.info/)
   - Create a free account
   - Get your API key

2. **Configure the app:**
   - Open `services/TransitDataService.ts`
   - Set `useMockData` to `false`
   - Add your MTA API credentials

### Current Status

The app currently uses **enhanced mock data** that simulates realistic NYC transit patterns:
- Manhattan areas are faster (better subway coverage)
- Brooklyn/Queens areas are slower
- Realistic travel time variations

## Color System

### Fine-Grained Intervals

The app now uses **5-minute intervals** for much more precise visualization:

- **0-5 min**: Very accessible
- **5-10 min**: Easily accessible  
- **10-15 min**: Moderately accessible
- **15-20 min**: Accessible
- **20-25 min**: Somewhat accessible
- **25-30 min**: Less accessible
- **30-35 min**: Difficult
- **35-40 min**: Very difficult
- **40-45 min**: Extremely difficult
- **45-50 min**: Nearly impossible
- **50-55 min**: Almost impossible
- **55-60 min**: Impossible
- **60-65 min**: Extremely impossible
- **65+ min**: Completely inaccessible

### Color Scheme Selection

- Tap the **🎨 Color Scheme** button in the top-right
- Choose from 6 different themes
- Changes apply immediately to the map

## Project Structure

```
├── App.tsx                      # Main app component
├── components/
│   ├── TransitVisualizer.tsx    # Map overlay component
│   ├── ColorSchemeSelector.tsx  # Color theme picker
│   └── ColorLegend.tsx         # Time interval legend
├── services/
│   └── TransitDataService.ts    # MTA API service layer
├── utils/
│   └── ColorSchemes.ts         # Color scheme definitions
├── package.json                 # Dependencies
└── app.json                    # Expo configuration
```

## Development Notes

- **NYC Focus**: Covers 40.4774° to 40.9176° N, 74.2591° to 73.7004° W
- **Grid Density**: 20x20 grid for detailed coverage
- **Realistic Patterns**: Mock data simulates actual NYC transit patterns
- **Performance**: Optimized for smooth rendering on iOS

## Troubleshooting

### Common Issues

1. **Location permission denied:**
   - Go to iOS Settings > Privacy > Location Services
   - Enable for this app

2. **MTA API limits:**
   - Free tier has rate limits
   - App falls back to mock data if API fails

3. **Build errors:**
   - Run `npm install` to ensure all dependencies are installed
   - Clear Expo cache: `expo start -c`

## Future Enhancements

- [ ] Real MTA API integration
- [ ] Custom color scheme creation
- [ ] Time-based filtering (rush hour vs off-peak)
- [ ] Route visualization
- [ ] Station markers
- [ ] Accessibility features

## License

This project is for personal use. Please respect MTA API terms of service when using their data. 