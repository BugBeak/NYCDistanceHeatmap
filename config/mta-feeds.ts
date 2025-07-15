// MTA Feed Configuration
// These are the direct URLs for different subway line groups
// No API key required - they're free and open!

export const MTA_FEEDS = {
  // A Division (numbered lines)
  'ace': 'https://api.mta.info/feeds/json/nyct/ace',
  'bdfm': 'https://api.mta.info/feeds/json/nyct/bdfm', 
  'g': 'https://api.mta.info/feeds/json/nyct/g',
  'jz': 'https://api.mta.info/feeds/json/nyct/jz',
  'nqrw': 'https://api.mta.info/feeds/json/nyct/nqrw',
  'l': 'https://api.mta.info/feeds/json/nyct/l',
  'sir': 'https://api.mta.info/feeds/json/nyct/sir',
  
  // B Division (lettered lines)
  '123456': 'https://api.mta.info/feeds/json/nyct/123456',
  '7': 'https://api.mta.info/feeds/json/nyct/7',
  's': 'https://api.mta.info/feeds/json/nyct/s'
};

// Subway line groupings for reference:
// - ace: A, C, E trains
// - bdfm: B, D, F, M trains  
// - g: G train
// - jz: J, Z trains
// - nqrw: N, Q, R, W trains
// - l: L train
// - sir: Staten Island Railway
// - 123456: 1, 2, 3, 4, 5, 6 trains
// - 7: 7 train
// - s: S train (shuttles)

export const SUBWAY_LINE_GROUPS = {
  'Manhattan': ['ace', 'bdfm', '123456', 'nqrw', '7'],
  'Brooklyn': ['ace', 'bdfm', 'g', 'jz', 'l', 'nqrw', '123456'],
  'Queens': ['ace', 'bdfm', 'g', 'jz', 'nqrw', '7'],
  'Bronx': ['bdfm', '123456', '7'],
  'Staten Island': ['sir']
}; 