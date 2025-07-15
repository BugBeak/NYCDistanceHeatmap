export interface ColorScheme {
  name: string;
  colors: string[];
  description: string;
}

export const COLOR_SCHEMES: ColorScheme[] = [
  {
    name: 'Green to Red',
    colors: [
      '#00FF00', // 0-5 min - Bright Green
      '#32CD32', // 5-10 min - Lime Green
      '#9ACD32', // 10-15 min - Yellow Green
      '#FFFF00', // 15-20 min - Yellow
      '#FFA500', // 20-25 min - Orange
      '#FF8C00', // 25-30 min - Dark Orange
      '#FF4500', // 30-35 min - Orange Red
      '#FF0000', // 35-40 min - Red
      '#DC143C', // 40-45 min - Crimson
      '#8B0000', // 45-50 min - Dark Red
      '#800080', // 50-55 min - Purple
      '#4B0082', // 55-60 min - Indigo
      '#000080', // 60-65 min - Navy
      '#000000', // 65+ min - Black
    ],
    description: 'Classic green to red progression'
  },
  {
    name: 'Blue to Red',
    colors: [
      '#0000FF', // 0-5 min - Blue
      '#0066FF', // 5-10 min - Light Blue
      '#00CCFF', // 10-15 min - Sky Blue
      '#00FFFF', // 15-20 min - Cyan
      '#66FF66', // 20-25 min - Light Green
      '#FFFF00', // 25-30 min - Yellow
      '#FFCC00', // 30-35 min - Gold
      '#FF9900', // 35-40 min - Orange
      '#FF6600', // 40-45 min - Dark Orange
      '#FF3300', // 45-50 min - Red Orange
      '#FF0000', // 50-55 min - Red
      '#CC0000', // 55-60 min - Dark Red
      '#990000', // 60-65 min - Maroon
      '#660000', // 65+ min - Dark Maroon
    ],
    description: 'Cool blue to hot red'
  },
  {
    name: 'Purple to Yellow',
    colors: [
      '#800080', // 0-5 min - Purple
      '#9933CC', // 5-10 min - Light Purple
      '#CC66FF', // 10-15 min - Lavender
      '#FF99FF', // 15-20 min - Pink
      '#FFCCFF', // 20-25 min - Light Pink
      '#FFFFCC', // 25-30 min - Light Yellow
      '#FFFF99', // 30-35 min - Pale Yellow
      '#FFFF66', // 35-40 min - Light Yellow
      '#FFFF33', // 40-45 min - Yellow
      '#FFFF00', // 45-50 min - Bright Yellow
      '#FFFF00', // 50-55 min - Bright Yellow
      '#FFFF00', // 55-60 min - Bright Yellow
      '#FFFF00', // 60-65 min - Bright Yellow
      '#FFFF00', // 65+ min - Bright Yellow
    ],
    description: 'Purple to bright yellow'
  },
  {
    name: 'Orange to Blue',
    colors: [
      '#FF6600', // 0-5 min - Orange
      '#FF8800', // 5-10 min - Light Orange
      '#FFAA00', // 10-15 min - Golden
      '#FFCC00', // 15-20 min - Yellow
      '#FFEE00', // 20-25 min - Light Yellow
      '#FFFF00', // 25-30 min - Bright Yellow
      '#CCFF00', // 30-35 min - Lime
      '#99FF00', // 35-40 min - Light Green
      '#66FF00', // 40-45 min - Green
      '#33FF00', // 45-50 min - Bright Green
      '#00FF00', // 50-55 min - Green
      '#00CCFF', // 55-60 min - Sky Blue
      '#0099FF', // 60-65 min - Blue
      '#0066FF', // 65+ min - Dark Blue
    ],
    description: 'Warm orange to cool blue'
  },
  {
    name: 'Red to Green',
    colors: [
      '#FF0000', // 0-5 min - Red
      '#FF3300', // 5-10 min - Red Orange
      '#FF6600', // 10-15 min - Orange
      '#FF9900', // 15-20 min - Light Orange
      '#FFCC00', // 20-25 min - Gold
      '#FFFF00', // 25-30 min - Yellow
      '#CCFF00', // 30-35 min - Lime
      '#99FF00', // 35-40 min - Light Green
      '#66FF00', // 40-45 min - Green
      '#33FF00', // 45-50 min - Bright Green
      '#00FF00', // 50-55 min - Green
      '#00CC00', // 55-60 min - Dark Green
      '#009900', // 60-65 min - Forest Green
      '#006600', // 65+ min - Dark Forest Green
    ],
    description: 'Hot red to cool green'
  }
];

export const getColorForTravelTime = (travelTime: number, schemeIndex: number = 0): string => {
  const scheme = COLOR_SCHEMES[schemeIndex];
  const timeIndex = Math.min(
    Math.floor(travelTime / 5),
    scheme.colors.length - 1
  );
  
  return scheme.colors[timeIndex];
};

export const getColorWithOpacity = (travelTime: number, schemeIndex: number = 0, opacity: number = 0.3): string => {
  const baseColor = getColorForTravelTime(travelTime, schemeIndex);
  
  // Convert hex to rgba
  const hex = baseColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}; 