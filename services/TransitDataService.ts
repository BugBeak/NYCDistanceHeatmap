import axios from 'axios';

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface TransitPoint {
  latitude: number;
  longitude: number;
  travelTime: number;
}

interface TransitData {
  points: TransitPoint[];
  lastUpdated: Date;
}

interface MTAStation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  lines: string[];
}

// MTA Feed URLs for different subway lines (correct format)
const MTA_FEEDS = {
  // A Division (numbered lines)
  'ace': 'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-ace',
  'bdfm': 'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-bdfm',
  'g': 'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-g',
  'jz': 'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-jz',
  'nqrw': 'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-nqrw',
  'l': 'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-l',
  'sir': 'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-sir',
  
  // B Division (lettered lines)
  '123456': 'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-123456',
  '7': 'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-7',
  's': 'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-s'
};

// NYC Subway Stations data (comprehensive list)
const NYC_SUBWAY_STATIONS = [
  // Manhattan - Major stations
  { id: 'times-square', name: 'Times Square-42nd St', latitude: 40.7580, longitude: -73.9855, lines: ['1', '2', '3', 'N', 'Q', 'R', 'W', '7', 'S'] },
  { id: 'grand-central', name: 'Grand Central-42nd St', latitude: 40.7527, longitude: -73.9772, lines: ['4', '5', '6', '7', 'S'] },
  { id: 'union-square', name: 'Union Square-14th St', latitude: 40.7355, longitude: -73.9909, lines: ['4', '5', '6', 'N', 'Q', 'R', 'W', 'L'] },
  { id: 'penn-station', name: '34th St-Penn Station', latitude: 40.7505, longitude: -73.9934, lines: ['1', '2', '3', 'A', 'C', 'E'] },
  { id: 'herald-square', name: 'Herald Square-34th St', latitude: 40.7496, longitude: -73.9878, lines: ['N', 'Q', 'R', 'W', 'B', 'D', 'F', 'M'] },
  { id: 'fulton-street', name: 'Fulton St', latitude: 40.7104, longitude: -74.0085, lines: ['2', '3', '4', '5', 'A', 'C', 'J', 'Z'] },
  { id: 'world-trade', name: 'World Trade Center', latitude: 40.7126, longitude: -74.0099, lines: ['E'] },
  { id: 'brooklyn-bridge', name: 'Brooklyn Bridge-City Hall', latitude: 40.7133, longitude: -74.0049, lines: ['4', '5', '6'] },
  { id: 'canal-street', name: 'Canal St', latitude: 40.7183, longitude: -73.9934, lines: ['4', '5', '6', 'N', 'Q', 'R', 'W'] },
  { id: 'astor-place', name: 'Astor Place', latitude: 40.7304, longitude: -73.9911, lines: ['6'] },
  { id: '14th-street', name: '14th St-8th Ave', latitude: 40.7398, longitude: -74.0026, lines: ['A', 'C', 'E', 'L'] },
  { id: 'washington-square', name: 'Washington Square', latitude: 40.7308, longitude: -73.9976, lines: ['A', 'B', 'C', 'D', 'E', 'F', 'M'] },
  
  // More Manhattan stations
  { id: '59th-street', name: '59th St-Columbus Circle', latitude: 40.7682, longitude: -73.9819, lines: ['1', 'A', 'B', 'C', 'D'] },
  { id: '72nd-street', name: '72nd St', latitude: 40.7754, longitude: -73.9767, lines: ['1', '2', '3'] },
  { id: '86th-street', name: '86th St', latitude: 40.7795, longitude: -73.9698, lines: ['4', '5', '6'] },
  { id: '96th-street', name: '96th St', latitude: 40.7856, longitude: -73.9687, lines: ['1', '2', '3'] },
  { id: '125th-street', name: '125th St', latitude: 40.8045, longitude: -73.9475, lines: ['4', '5', '6'] },
  { id: '145th-street', name: '145th St', latitude: 40.8244, longitude: -73.9442, lines: ['3'] },
  { id: '168th-street', name: '168th St-Washington Heights', latitude: 40.8407, longitude: -73.9396, lines: ['A', 'C'] },
  { id: '181st-street', name: '181st St', latitude: 40.8490, longitude: -73.9337, lines: ['1'] },
  { id: '191st-street', name: '191st St', latitude: 40.8552, longitude: -73.9294, lines: ['1'] },
  { id: 'dyckman-street', name: 'Dyckman St', latitude: 40.8605, longitude: -73.9255, lines: ['A'] },
  { id: '207th-street', name: '207th St', latitude: 40.8646, longitude: -73.9189, lines: ['A'] },
  { id: '215th-street', name: '215th St', latitude: 40.8691, longitude: -73.9155, lines: ['1'] },
  { id: '225th-street', name: '225th St', latitude: 40.8880, longitude: -73.9003, lines: ['1'] },
  { id: '231st-street', name: '231st St', latitude: 40.8788, longitude: -73.9048, lines: ['1'] },
  { id: '238th-street', name: '238th St', latitude: 40.8846, longitude: -73.9009, lines: ['1'] },
  { id: '242nd-street', name: '242nd St-Van Cortlandt Park', latitude: 40.8892, longitude: -73.8985, lines: ['1'] },
  
  // Brooklyn - Major stations
  { id: 'atlantic-avenue', name: 'Atlantic Ave-Barclays Center', latitude: 40.6839, longitude: -73.9789, lines: ['2', '3', '4', '5', 'B', 'D', 'N', 'Q', 'R'] },
  { id: 'jay-street', name: 'Jay St-MetroTech', latitude: 40.6924, longitude: -73.9872, lines: ['A', 'C', 'F', 'R'] },
  { id: 'borough-hall', name: 'Borough Hall', latitude: 40.6932, longitude: -73.9899, lines: ['2', '3', '4', '5'] },
  { id: 'dekalb-avenue', name: 'DeKalb Ave', latitude: 40.6905, longitude: -73.9815, lines: ['B', 'Q', 'R'] },
  { id: 'bedford-avenue', name: 'Bedford Ave', latitude: 40.7172, longitude: -73.9568, lines: ['L'] },
  { id: 'lorimer-street', name: 'Lorimer St', latitude: 40.7144, longitude: -73.9503, lines: ['L'] },
  { id: 'graham-avenue', name: 'Graham Ave', latitude: 40.7146, longitude: -73.9441, lines: ['L'] },
  { id: 'grand-street', name: 'Grand St', latitude: 40.7183, longitude: -73.9401, lines: ['L'] },
  { id: 'montrose-avenue', name: 'Montrose Ave', latitude: 40.7074, longitude: -73.9397, lines: ['L'] },
  { id: 'morgan-avenue', name: 'Morgan Ave', latitude: 40.7062, longitude: -73.9331, lines: ['L'] },
  
  // More Brooklyn stations
  { id: 'neptune-avenue', name: 'Neptune Ave', latitude: 40.5811, longitude: -73.9744, lines: ['F'] },
  { id: 'avenue-u', name: 'Avenue U', latitude: 40.5993, longitude: -73.9559, lines: ['F'] },
  { id: 'kings-highway', name: 'Kings Hwy', latitude: 40.6083, longitude: -73.9578, lines: ['F'] },
  { id: 'avenue-n', name: 'Avenue N', latitude: 40.6144, longitude: -73.9580, lines: ['F'] },
  { id: 'avenue-j', name: 'Avenue J', latitude: 40.6250, longitude: -73.9608, lines: ['F'] },
  { id: 'avenue-h', name: 'Avenue H', latitude: 40.6292, longitude: -73.9615, lines: ['F'] },
  { id: 'avenue-m', name: 'Avenue M', latitude: 40.6184, longitude: -73.9594, lines: ['F'] },
  { id: 'kings-highway-b', name: 'Kings Hwy', latitude: 40.6083, longitude: -73.9578, lines: ['B', 'Q'] },
  { id: 'sheepshead-bay', name: 'Sheepshead Bay', latitude: 40.5868, longitude: -73.9542, lines: ['B', 'Q'] },
  { id: 'brighton-beach', name: 'Brighton Beach', latitude: 40.5777, longitude: -73.9612, lines: ['B', 'Q'] },
  { id: 'ocean-parkway', name: 'Ocean Pkwy', latitude: 40.5763, longitude: -73.9685, lines: ['Q'] },
  { id: 'west-8th-street', name: 'W 8th St-NY Aquarium', latitude: 40.5761, longitude: -73.9759, lines: ['F', 'Q'] },
  { id: 'coney-island', name: 'Coney Island-Stillwell Ave', latitude: 40.5772, longitude: -73.9818, lines: ['D', 'F', 'N', 'Q'] },
  
  // Queens - Major stations
  { id: 'queensboro-plaza', name: 'Queensboro Plaza', latitude: 40.7505, longitude: -73.9402, lines: ['7', 'N', 'W'] },
  { id: 'jackson-heights', name: 'Jackson Heights-Roosevelt Ave', latitude: 40.7465, longitude: -73.8918, lines: ['7', 'E', 'F', 'M', 'R'] },
  { id: 'forest-hills', name: 'Forest Hills-71st Ave', latitude: 40.7216, longitude: -73.8445, lines: ['E', 'F', 'M', 'R'] },
  { id: 'queens-plaza', name: 'Queens Plaza', latitude: 40.7489, longitude: -73.9370, lines: ['E', 'M', 'R'] },
  { id: 'court-square', name: 'Court Square-23rd St', latitude: 40.7470, longitude: -73.9453, lines: ['7', 'E', 'M', 'G'] },
  { id: 'long-island-city', name: 'Long Island City-Court Square', latitude: 40.7446, longitude: -73.9485, lines: ['7'] },
  
  // More Queens stations
  { id: 'main-street', name: 'Main St', latitude: 40.7596, longitude: -73.8301, lines: ['7'] },
  { id: 'flushing-main', name: 'Flushing-Main St', latitude: 40.7596, longitude: -73.8301, lines: ['7'] },
  { id: 'willets-point', name: 'Willets Point-Shea Stadium', latitude: 40.7546, longitude: -73.8456, lines: ['7'] },
  { id: '111th-street', name: '111th St', latitude: 40.7515, longitude: -73.8553, lines: ['7'] },
  { id: '103rd-street', name: '103rd St-Corona Plaza', latitude: 40.7514, longitude: -73.8627, lines: ['7'] },
  { id: 'junction-blvd', name: 'Junction Blvd', latitude: 40.7495, longitude: -73.8695, lines: ['7'] },
  { id: '90th-street', name: '90th St-Elmhurst Ave', latitude: 40.7484, longitude: -73.8766, lines: ['7'] },
  { id: '82nd-street', name: '82nd St-Jackson Heights', latitude: 40.7476, longitude: -73.8837, lines: ['7'] },
  { id: '74th-street', name: '74th St-Broadway', latitude: 40.7468, longitude: -73.8912, lines: ['7', 'E', 'F', 'M', 'R'] },
  { id: '69th-street', name: '69th St-Fisk Ave', latitude: 40.7464, longitude: -73.8964, lines: ['7'] },
  { id: '61st-street', name: '61st St-Woodside', latitude: 40.7456, longitude: -73.9029, lines: ['7'] },
  { id: '52nd-street', name: '52nd St', latitude: 40.7449, longitude: -73.9125, lines: ['7'] },
  { id: '46th-street', name: '46th St-Bliss St', latitude: 40.7439, longitude: -73.9184, lines: ['7'] },
  { id: '40th-street', name: '40th St-Lowery St', latitude: 40.7430, longitude: -73.9240, lines: ['7'] },
  { id: '33rd-street', name: '33rd St-Rawson St', latitude: 40.7420, longitude: -73.9301, lines: ['7'] },
  { id: 'hunters-point', name: 'Hunters Point Ave', latitude: 40.7415, longitude: -73.9360, lines: ['7'] },
  { id: 'vernon-blvd', name: 'Vernon Blvd-Jackson Ave', latitude: 40.7426, longitude: -73.9416, lines: ['7'] },
  { id: 'grand-central-queens', name: 'Grand Central-Newtown', latitude: 40.7375, longitude: -73.9474, lines: ['7'] },
  { id: 'mets-willets', name: 'Mets-Willets Point', latitude: 40.7546, longitude: -73.8456, lines: ['7'] },
  
  // Bronx - Major stations
  { id: 'yankee-stadium', name: '161st St-Yankee Stadium', latitude: 40.8279, longitude: -73.9258, lines: ['4', 'B', 'D'] },
  { id: 'fordham-road', name: 'Fordham Rd', latitude: 40.8593, longitude: -73.8987, lines: ['4'] },
  { id: 'bedford-park', name: 'Bedford Park Blvd-Lehman College', latitude: 40.8734, longitude: -73.8901, lines: ['4'] },
  { id: 'kingsbridge-road', name: 'Kingsbridge Rd', latitude: 40.8678, longitude: -73.8972, lines: ['4'] },
  { id: 'burnside-avenue', name: 'Burnside Ave', latitude: 40.8569, longitude: -73.9075, lines: ['4'] },
  
  // More Bronx stations
  { id: '149th-street', name: '149th St-Grand Concourse', latitude: 40.8183, longitude: -73.9274, lines: ['4'] },
  { id: '138th-street', name: '138th St-Grand Concourse', latitude: 40.8132, longitude: -73.9298, lines: ['4'] },
  { id: '125th-street-bronx', name: '125th St', latitude: 40.8045, longitude: -73.9475, lines: ['4', '5', '6'] },
  { id: '116th-street', name: '116th St', latitude: 40.7986, longitude: -73.9522, lines: ['6'] },
  { id: '110th-street', name: '110th St', latitude: 40.7950, longitude: -73.9554, lines: ['6'] },
  { id: '103rd-street-bronx', name: '103rd St', latitude: 40.7906, longitude: -73.9584, lines: ['6'] },
  { id: '96th-street-bronx', name: '96th St', latitude: 40.7856, longitude: -73.9687, lines: ['1', '2', '3'] },
  { id: '86th-street-bronx', name: '86th St', latitude: 40.7795, longitude: -73.9698, lines: ['4', '5', '6'] },
  { id: '77th-street', name: '77th St', latitude: 40.7736, longitude: -73.9717, lines: ['6'] },
  { id: '68th-street', name: '68th St-Hunter College', latitude: 40.7689, longitude: -73.9741, lines: ['6'] },
  { id: '59th-street-bronx', name: '59th St', latitude: 40.7682, longitude: -73.9819, lines: ['1', 'A', 'B', 'C', 'D'] },
  { id: '50th-street', name: '50th St', latitude: 40.7617, longitude: -73.9838, lines: ['1'] },
  { id: '42nd-street', name: '42nd St-Times Square', latitude: 40.7580, longitude: -73.9855, lines: ['1', '2', '3', 'N', 'Q', 'R', 'W', '7', 'S'] },
  { id: '34th-street', name: '34th St-Penn Station', latitude: 40.7505, longitude: -73.9934, lines: ['1', '2', '3', 'A', 'C', 'E'] },
  { id: '28th-street', name: '28th St', latitude: 40.7474, longitude: -73.9950, lines: ['1'] },
  { id: '23rd-street', name: '23rd St', latitude: 40.7441, longitude: -73.9966, lines: ['1'] },
  { id: '18th-street', name: '18th St', latitude: 40.7410, longitude: -73.9979, lines: ['1'] },
  { id: '14th-street-bronx', name: '14th St', latitude: 40.7379, longitude: -73.9997, lines: ['1'] },
  { id: 'christopher-street', name: 'Christopher St-Sheridan Sq', latitude: 40.7339, longitude: -73.0024, lines: ['1'] },
  { id: 'houston-street', name: 'Houston St', latitude: 40.7303, longitude: -73.9998, lines: ['1'] },
  { id: 'canal-street-bronx', name: 'Canal St', latitude: 40.7183, longitude: -73.9934, lines: ['4', '5', '6', 'N', 'Q', 'R', 'W'] },
  { id: 'franklin-street', name: 'Franklin St', latitude: 40.7194, longitude: -73.9998, lines: ['1'] },
  { id: 'chambers-street', name: 'Chambers St', latitude: 40.7144, longitude: -74.0066, lines: ['1', '2', '3'] },
  { id: 'cortlandt-street', name: 'Cortlandt St', latitude: 40.7105, longitude: -74.0112, lines: ['1'] },
  { id: 'radey-street', name: 'Radey St', latitude: 40.7075, longitude: -74.0178, lines: ['1'] },
  { id: 'south-ferry', name: 'South Ferry', latitude: 40.7014, longitude: -74.0131, lines: ['1'] },
  
  // Additional Manhattan stations
  { id: '23rd-street-6th', name: '23rd St-6th Ave', latitude: 40.7410, longitude: -73.9947, lines: ['F', 'M'] },
  { id: '14th-street-6th', name: '14th St-6th Ave', latitude: 40.7383, longitude: -73.9962, lines: ['F', 'M', 'L'] },
  { id: 'west-4th-street', name: 'West 4th St-Washington Sq', latitude: 40.7323, longitude: -73.9999, lines: ['A', 'B', 'C', 'D', 'E', 'F', 'M'] },
  { id: 'spring-street', name: 'Spring St', latitude: 40.7262, longitude: -74.0037, lines: ['C', 'E'] },
  { id: 'prince-street', name: 'Prince St', latitude: 40.7246, longitude: -73.9979, lines: ['N', 'R', 'W'] },
  { id: '8th-street', name: '8th St-NYU', latitude: 40.7303, longitude: -73.9925, lines: ['N', 'R', 'W'] },
  { id: 'bleecker-street', name: 'Bleecker St', latitude: 40.7283, longitude: -73.9942, lines: ['6'] },
  { id: 'broadway-lafayette', name: 'Broadway-Lafayette St', latitude: 40.7255, longitude: -73.9962, lines: ['B', 'D', 'F', 'M'] },
  { id: '2nd-avenue', name: '2nd Ave', latitude: 40.7234, longitude: -73.9899, lines: ['F'] },
  { id: 'delancey-street', name: 'Delancey St-Essex St', latitude: 40.7186, longitude: -73.9874, lines: ['F', 'J', 'M', 'Z'] },
  { id: 'east-broadway', name: 'East Broadway', latitude: 40.7139, longitude: -73.9902, lines: ['F'] },
  { id: 'york-street', name: 'York St', latitude: 40.7004, longitude: -73.9868, lines: ['F'] },
  { id: 'high-street', name: 'High St-Brooklyn Bridge', latitude: 40.6993, longitude: -73.9875, lines: ['A', 'C'] },
  { id: 'clark-street', name: 'Clark St', latitude: 40.6975, longitude: -73.9931, lines: ['2', '3'] },
  { id: 'borough-hall-brooklyn', name: 'Borough Hall', latitude: 40.6932, longitude: -73.9899, lines: ['2', '3', '4', '5'] },
  { id: 'nevins-street', name: 'Nevins St', latitude: 40.6883, longitude: -73.9803, lines: ['2', '3', '4', '5'] },
  { id: 'atlantic-avenue-brooklyn', name: 'Atlantic Ave-Barclays Center', latitude: 40.6839, longitude: -73.9789, lines: ['2', '3', '4', '5', 'B', 'D', 'N', 'Q', 'R'] },
  { id: 'bergen-street', name: 'Bergen St', latitude: 40.6809, longitude: -73.9750, lines: ['2', '3'] },
  { id: 'grand-army-plaza', name: 'Grand Army Plaza', latitude: 40.6753, longitude: -73.9710, lines: ['2', '3'] },
  { id: 'eastern-parkway', name: 'Eastern Pkwy-Brooklyn Museum', latitude: 40.6703, longitude: -73.9578, lines: ['2', '3'] },
  { id: 'franklin-avenue', name: 'Franklin Ave', latitude: 40.6615, longitude: -73.9552, lines: ['2', '3', '4', '5'] },
  { id: 'nostrand-avenue', name: 'Nostrand Ave', latitude: 40.6698, longitude: -73.9504, lines: ['3'] },
  { id: 'kingston-avenue', name: 'Kingston Ave', latitude: 40.6694, longitude: -73.9425, lines: ['3'] },
  { id: 'crown-heights', name: 'Crown Heights-Utica Ave', latitude: 40.6689, longitude: -73.9329, lines: ['3', '4'] },
  { id: 'sutter-avenue', name: 'Sutter Ave-Rutland Rd', latitude: 40.6645, longitude: -73.9225, lines: ['3'] },
  { id: 'saratoga-avenue', name: 'Saratoga Ave', latitude: 40.6615, longitude: -73.9163, lines: ['3'] },
  { id: 'rockaway-avenue', name: 'Rockaway Ave', latitude: 40.6626, longitude: -73.9089, lines: ['3'] },
  { id: 'junius-street', name: 'Junius St', latitude: 40.6635, longitude: -73.9024, lines: ['3'] },
  { id: 'pennsylvania-avenue', name: 'Pennsylvania Ave', latitude: 40.6647, longitude: -73.8949, lines: ['3'] },
  { id: 'van-siclen-avenue', name: 'Van Siclen Ave', latitude: 40.6655, longitude: -73.8894, lines: ['3'] },
  { id: 'new-lots-avenue', name: 'New Lots Ave', latitude: 40.6663, longitude: -73.8840, lines: ['3'] },
  
  // Additional Brooklyn stations
  { id: 'bedford-nostrand', name: 'Bedford-Nostrand Aves', latitude: 40.7172, longitude: -73.9568, lines: ['G'] },
  { id: 'classon-avenue', name: 'Classon Ave', latitude: 40.6959, longitude: -73.9602, lines: ['G'] },
  { id: 'clinton-washington', name: 'Clinton-Washington Aves', latitude: 40.6889, longitude: -73.9660, lines: ['G'] },
  { id: 'fulton-street-brooklyn', name: 'Fulton St', latitude: 40.6874, longitude: -73.9750, lines: ['G'] },
  { id: 'hoyt-schermerhorn', name: 'Hoyt-Schermerhorn Sts', latitude: 40.6884, longitude: -73.9851, lines: ['A', 'C', 'G'] },
  { id: 'jay-street-metrotech', name: 'Jay St-MetroTech', latitude: 40.6924, longitude: -73.9872, lines: ['A', 'C', 'F', 'R'] },
  { id: 'dekalb-avenue-brooklyn', name: 'DeKalb Ave', latitude: 40.6905, longitude: -73.9815, lines: ['B', 'Q', 'R'] },
  { id: 'atlantic-avenue-brooklyn-2', name: 'Atlantic Ave-Barclays Center', latitude: 40.6839, longitude: -73.9789, lines: ['2', '3', '4', '5', 'B', 'D', 'N', 'Q', 'R'] },
  { id: '7th-avenue-brooklyn', name: '7th Ave', latitude: 40.6662, longitude: -73.9803, lines: ['B', 'Q'] },
  { id: 'prospect-park', name: 'Prospect Park', latitude: 40.6615, longitude: -73.9792, lines: ['B', 'Q'] },
  { id: 'parkside-avenue', name: 'Parkside Ave', latitude: 40.6551, longitude: -73.9615, lines: ['Q'] },
  { id: 'church-avenue', name: 'Church Ave', latitude: 40.6505, longitude: -73.9495, lines: ['B', 'Q'] },
  { id: 'beverly-road', name: 'Beverly Rd', latitude: 40.6451, longitude: -73.9489, lines: ['Q'] },
  { id: 'cortelyou-road', name: 'Cortelyou Rd', latitude: 40.6409, longitude: -73.9638, lines: ['Q'] },
  { id: 'newkirk-plaza', name: 'Newkirk Plaza', latitude: 40.6350, longitude: -73.9628, lines: ['B', 'Q'] },
  { id: 'avenue-h', name: 'Avenue H', latitude: 40.6292, longitude: -73.9615, lines: ['Q'] },
  { id: 'avenue-j', name: 'Avenue J', latitude: 40.6250, longitude: -73.9608, lines: ['Q'] },
  { id: 'avenue-m', name: 'Avenue M', latitude: 40.6184, longitude: -73.9594, lines: ['Q'] },
  { id: 'kings-highway-brooklyn', name: 'Kings Hwy', latitude: 40.6083, longitude: -73.9578, lines: ['B', 'Q'] },
  { id: 'avenue-u-brooklyn', name: 'Avenue U', latitude: 40.5993, longitude: -73.9559, lines: ['Q'] },
  { id: 'neptune-avenue', name: 'Neptune Ave', latitude: 40.5811, longitude: -73.9744, lines: ['F'] },
  { id: 'west-8th-street-brooklyn', name: 'W 8th St-NY Aquarium', latitude: 40.5761, longitude: -73.9759, lines: ['F', 'Q'] },
  { id: 'coney-island-stillwell', name: 'Coney Island-Stillwell Ave', latitude: 40.5772, longitude: -73.9818, lines: ['D', 'F', 'N', 'Q'] },
  
  // Additional Queens stations
  { id: 'queensboro-plaza-queens', name: 'Queensboro Plaza', latitude: 40.7505, longitude: -73.9402, lines: ['7', 'N', 'W'] },
  { id: 'jackson-heights-roosevelt', name: 'Jackson Heights-Roosevelt Ave', latitude: 40.7465, longitude: -73.8918, lines: ['7', 'E', 'F', 'M', 'R'] },
  { id: 'forest-hills-71st', name: 'Forest Hills-71st Ave', latitude: 40.7216, longitude: -73.8445, lines: ['E', 'F', 'M', 'R'] },
  { id: 'queens-plaza-queens', name: 'Queens Plaza', latitude: 40.7489, longitude: -73.9370, lines: ['E', 'M', 'R'] },
  { id: 'court-square-queens', name: 'Court Square-23rd St', latitude: 40.7470, longitude: -73.9453, lines: ['7', 'E', 'M', 'G'] },
  { id: 'long-island-city-court', name: 'Long Island City-Court Square', latitude: 40.7446, longitude: -73.9485, lines: ['7'] },
  { id: 'hunters-point-ave', name: 'Hunters Point Ave', latitude: 40.7415, longitude: -73.9360, lines: ['7'] },
  { id: 'vernon-blvd-jackson', name: 'Vernon Blvd-Jackson Ave', latitude: 40.7426, longitude: -73.9416, lines: ['7'] },
  { id: 'grand-central-newtown', name: 'Grand Central-Newtown', latitude: 40.7375, longitude: -73.9474, lines: ['7'] },
  { id: 'woodside-61st', name: '61st St-Woodside', latitude: 40.7456, longitude: -73.9029, lines: ['7'] },
  { id: '52nd-street-queens', name: '52nd St', latitude: 40.7449, longitude: -73.9125, lines: ['7'] },
  { id: '46th-street-bliss', name: '46th St-Bliss St', latitude: 40.7439, longitude: -73.9184, lines: ['7'] },
  { id: '40th-street-lowery', name: '40th St-Lowery St', latitude: 40.7430, longitude: -73.9240, lines: ['7'] },
  { id: '33rd-street-rawson', name: '33rd St-Rawson St', latitude: 40.7420, longitude: -73.9301, lines: ['7'] },
  { id: 'junction-blvd-queens', name: 'Junction Blvd', latitude: 40.7495, longitude: -73.8695, lines: ['7'] },
  { id: '90th-street-elmhurst', name: '90th St-Elmhurst Ave', latitude: 40.7484, longitude: -73.8766, lines: ['7'] },
  { id: '82nd-street-jackson', name: '82nd St-Jackson Heights', latitude: 40.7476, longitude: -73.8837, lines: ['7'] },
  { id: '74th-street-broadway', name: '74th St-Broadway', latitude: 40.7468, longitude: -73.8912, lines: ['7', 'E', 'F', 'M', 'R'] },
  { id: '69th-street-fisk', name: '69th St-Fisk Ave', latitude: 40.7464, longitude: -73.8964, lines: ['7'] },
  { id: '111th-street-corona', name: '111th St', latitude: 40.7515, longitude: -73.8553, lines: ['7'] },
  { id: '103rd-street-corona', name: '103rd St-Corona Plaza', latitude: 40.7514, longitude: -73.8627, lines: ['7'] },
  { id: 'willets-point-shea', name: 'Willets Point-Shea Stadium', latitude: 40.7546, longitude: -73.8456, lines: ['7'] },
  { id: 'flushing-main-street', name: 'Flushing-Main St', latitude: 40.7596, longitude: -73.8301, lines: ['7'] },
  
  // Additional Bronx stations
  { id: 'yankee-stadium-161st', name: '161st St-Yankee Stadium', latitude: 40.8279, longitude: -73.9258, lines: ['4', 'B', 'D'] },
  { id: 'fordham-road-bronx', name: 'Fordham Rd', latitude: 40.8593, longitude: -73.8987, lines: ['4'] },
  { id: 'bedford-park-lehman', name: 'Bedford Park Blvd-Lehman College', latitude: 40.8734, longitude: -73.8901, lines: ['4'] },
  { id: 'kingsbridge-road-bronx', name: 'Kingsbridge Rd', latitude: 40.8678, longitude: -73.8972, lines: ['4'] },
  { id: 'burnside-avenue-bronx', name: 'Burnside Ave', latitude: 40.8569, longitude: -73.9075, lines: ['4'] },
  { id: '149th-street-grand', name: '149th St-Grand Concourse', latitude: 40.8183, longitude: -73.9274, lines: ['4'] },
  { id: '138th-street-grand', name: '138th St-Grand Concourse', latitude: 40.8132, longitude: -73.9298, lines: ['4'] },
  { id: '125th-street-bronx-2', name: '125th St', latitude: 40.8045, longitude: -73.9475, lines: ['4', '5', '6'] },
  { id: '116th-street-bronx-2', name: '116th St', latitude: 40.7986, longitude: -73.9522, lines: ['6'] },
  { id: '110th-street-bronx-2', name: '110th St', latitude: 40.7950, longitude: -73.9554, lines: ['6'] },
  { id: '103rd-street-bronx-2', name: '103rd St', latitude: 40.7906, longitude: -73.9584, lines: ['6'] },
  { id: '96th-street-bronx-2', name: '96th St', latitude: 40.7856, longitude: -73.9687, lines: ['1', '2', '3'] },
  { id: '86th-street-bronx-2', name: '86th St', latitude: 40.7795, longitude: -73.9698, lines: ['4', '5', '6'] },
  { id: '77th-street-bronx-2', name: '77th St', latitude: 40.7736, longitude: -73.9717, lines: ['6'] },
  { id: '68th-street-hunter', name: '68th St-Hunter College', latitude: 40.7689, longitude: -73.9741, lines: ['6'] },
  { id: '59th-street-bronx-2', name: '59th St', latitude: 40.7682, longitude: -73.9819, lines: ['1', 'A', 'B', 'C', 'D'] },
  { id: '50th-street-bronx-2', name: '50th St', latitude: 40.7617, longitude: -73.9838, lines: ['1'] },
  { id: '42nd-street-bronx-2', name: '42nd St-Times Square', latitude: 40.7580, longitude: -73.9855, lines: ['1', '2', '3', 'N', 'Q', 'R', 'W', '7', 'S'] },
  { id: '34th-street-bronx-2', name: '34th St-Penn Station', latitude: 40.7505, longitude: -73.9934, lines: ['1', '2', '3', 'A', 'C', 'E'] },
  { id: '28th-street-bronx-2', name: '28th St', latitude: 40.7474, longitude: -73.9950, lines: ['1'] },
  { id: '23rd-street-bronx-2', name: '23rd St', latitude: 40.7441, longitude: -73.9966, lines: ['1'] },
  { id: '18th-street-bronx-2', name: '18th St', latitude: 40.7410, longitude: -73.9979, lines: ['1'] },
  { id: '14th-street-bronx-2', name: '14th St', latitude: 40.7379, longitude: -73.9997, lines: ['1'] },
  { id: 'christopher-street-bronx-2', name: 'Christopher St-Sheridan Sq', latitude: 40.7339, longitude: -73.0024, lines: ['1'] },
  { id: 'houston-street-bronx-2', name: 'Houston St', latitude: 40.7303, longitude: -73.9998, lines: ['1'] },
  { id: 'canal-street-bronx-2', name: 'Canal St', latitude: 40.7183, longitude: -73.9934, lines: ['4', '5', '6', 'N', 'Q', 'R', 'W'] },
  { id: 'franklin-street-bronx-2', name: 'Franklin St', latitude: 40.7194, longitude: -73.9998, lines: ['1'] },
  { id: 'chambers-street-bronx-2', name: 'Chambers St', latitude: 40.7144, longitude: -74.0066, lines: ['1', '2', '3'] },
  { id: 'cortlandt-street-bronx-2', name: 'Cortlandt St', latitude: 40.7105, longitude: -74.0112, lines: ['1'] },
  { id: 'radey-street-bronx-2', name: 'Radey St', latitude: 40.7075, longitude: -74.0178, lines: ['1'] },
  { id: 'south-ferry-bronx-2', name: 'South Ferry', latitude: 40.7014, longitude: -74.0131, lines: ['1'] },
  
  // A/C/E Line Stations (Manhattan)
  { id: '168th-street-ac', name: '168th St-Washington Heights', latitude: 40.8407, longitude: -73.9396, lines: ['A', 'C'] },
  { id: '163rd-street', name: '163rd St-Amsterdam Ave', latitude: 40.8360, longitude: -73.9399, lines: ['A', 'C'] },
  { id: '155th-street', name: '155th St', latitude: 40.8305, longitude: -73.9414, lines: ['A', 'C'] },
  { id: '145th-street-ac', name: '145th St', latitude: 40.8244, longitude: -73.9442, lines: ['A', 'C'] },
  { id: '135th-street', name: '135th St', latitude: 40.8179, longitude: -73.9474, lines: ['A', 'C'] },
  { id: '125th-street-ac', name: '125th St', latitude: 40.8117, longitude: -73.9524, lines: ['A', 'C'] },
  { id: '116th-street-ac', name: '116th St', latitude: 40.8055, longitude: -73.9582, lines: ['A', 'C'] },
  { id: '110th-street-ac', name: '110th St', latitude: 40.7994, longitude: -73.9626, lines: ['A', 'C'] },
  { id: '103rd-street-ac', name: '103rd St', latitude: 40.7933, longitude: -73.9668, lines: ['A', 'C'] },
  { id: '96th-street-ac', name: '96th St', latitude: 40.7871, longitude: -73.9710, lines: ['A', 'C'] },
  { id: '86th-street-ac', name: '86th St', latitude: 40.7809, longitude: -73.9752, lines: ['A', 'C'] },
  { id: '81st-street', name: '81st St-Museum of Natural History', latitude: 40.7769, longitude: -73.9781, lines: ['A', 'C'] },
  { id: '72nd-street-ac', name: '72nd St', latitude: 40.7729, longitude: -73.9813, lines: ['A', 'C'] },
  { id: '59th-street-columbus', name: '59th St-Columbus Circle', latitude: 40.7682, longitude: -73.9819, lines: ['A', 'C'] },
  { id: '50th-street-ac', name: '50th St', latitude: 40.7625, longitude: -73.9859, lines: ['A', 'C'] },
  { id: '42nd-street-port', name: '42nd St-Port Authority Bus Terminal', latitude: 40.7566, longitude: -73.9902, lines: ['A', 'C', 'E'] },
  { id: '34th-street-penn', name: '34th St-Penn Station', latitude: 40.7505, longitude: -73.9934, lines: ['A', 'C', 'E'] },
  { id: '23rd-street-ac', name: '23rd St', latitude: 40.7444, longitude: -73.9966, lines: ['A', 'C', 'E'] },
  { id: '14th-street-ac', name: '14th St', latitude: 40.7383, longitude: -73.9999, lines: ['A', 'C', 'E'] },
  { id: 'west-4th-street-ac', name: 'West 4th St-Washington Sq', latitude: 40.7323, longitude: -73.9999, lines: ['A', 'C', 'E'] },
  { id: 'spring-street-ac', name: 'Spring St', latitude: 40.7262, longitude: -74.0037, lines: ['A', 'C', 'E'] },
  { id: 'canal-street-ac', name: 'Canal St', latitude: 40.7204, longitude: -74.0082, lines: ['A', 'C', 'E'] },
  { id: 'chambers-street-ac', name: 'Chambers St', latitude: 40.7144, longitude: -74.0066, lines: ['A', 'C'] },
  { id: 'fulton-street-ac', name: 'Fulton St', latitude: 40.7104, longitude: -74.0085, lines: ['A', 'C'] },
  { id: 'high-street-ac', name: 'High St-Brooklyn Bridge', latitude: 40.6993, longitude: -73.9875, lines: ['A', 'C'] },
  { id: 'jay-street-metrotech-ac', name: 'Jay St-MetroTech', latitude: 40.6924, longitude: -73.9872, lines: ['A', 'C'] },
  { id: 'hoyt-schermerhorn-ac', name: 'Hoyt-Schermerhorn Sts', latitude: 40.6884, longitude: -73.9851, lines: ['A', 'C'] },
  { id: 'lafayette-avenue', name: 'Lafayette Ave', latitude: 40.6861, longitude: -73.9739, lines: ['A', 'C'] },
  { id: 'clinton-washington-ac', name: 'Clinton-Washington Aves', latitude: 40.6889, longitude: -73.9660, lines: ['A', 'C'] },
  { id: 'franklin-avenue-ac', name: 'Franklin Ave', latitude: 40.6615, longitude: -73.9552, lines: ['A', 'C'] },
  { id: 'nostrand-avenue-ac', name: 'Nostrand Ave', latitude: 40.6698, longitude: -73.9504, lines: ['A', 'C'] },
  { id: 'kingston-throop', name: 'Kingston-Throop Aves', latitude: 40.6694, longitude: -73.9425, lines: ['A', 'C'] },
  { id: 'utica-avenue', name: 'Utica Ave', latitude: 40.6689, longitude: -73.9329, lines: ['A', 'C'] },
  { id: 'ralph-avenue', name: 'Ralph Ave', latitude: 40.6645, longitude: -73.9225, lines: ['A', 'C'] },
  { id: 'rockaway-avenue-ac', name: 'Rockaway Ave', latitude: 40.6626, longitude: -73.9089, lines: ['A', 'C'] },
  { id: 'broadway-junction', name: 'Broadway Junction', latitude: 40.6635, longitude: -73.9024, lines: ['A', 'C'] },
  { id: 'liberty-avenue', name: 'Liberty Ave', latitude: 40.6647, longitude: -73.8949, lines: ['A', 'C'] },
  { id: 'van-siclen-avenue-ac', name: 'Van Siclen Ave', latitude: 40.6655, longitude: -73.8894, lines: ['A', 'C'] },
  { id: 'shepherd-avenue', name: 'Shepherd Ave', latitude: 40.6663, longitude: -73.8840, lines: ['A', 'C'] },
  { id: 'euclid-avenue', name: 'Euclid Ave', latitude: 40.6673, longitude: -73.8780, lines: ['A', 'C'] },
  
  // E Line Stations (Queens)
  { id: 'sutphin-archer', name: 'Sutphin Blvd-Archer Ave-JFK Airport', latitude: 40.7005, longitude: -73.8080, lines: ['E', 'J', 'Z'] },
  { id: 'jamaica-van-wyck', name: 'Jamaica-Van Wyck', latitude: 40.7021, longitude: -73.8011, lines: ['E'] },
  { id: 'briarwood', name: 'Briarwood-Van Wyck Blvd', latitude: 40.7092, longitude: -73.8205, lines: ['E', 'F'] },
  { id: 'kew-gardens', name: 'Kew Gardens-Union Tpke', latitude: 40.7140, longitude: -73.8310, lines: ['E', 'F'] },
  { id: 'forest-hills-71st', name: 'Forest Hills-71st Ave', latitude: 40.7216, longitude: -73.8445, lines: ['E', 'F', 'M', 'R'] },
  { id: '67th-avenue', name: '67th Ave', latitude: 40.7265, longitude: -73.8529, lines: ['E', 'F'] },
  { id: '63rd-drive', name: '63rd Drive-Rego Park', latitude: 40.7298, longitude: -73.8616, lines: ['E', 'F', 'M', 'R'] },
  { id: 'woodhaven-blvd', name: 'Woodhaven Blvd', latitude: 40.7331, longitude: -73.8692, lines: ['E', 'F', 'M', 'R'] },
  { id: 'grand-avenue', name: 'Grand Ave-Newtown', latitude: 40.7375, longitude: -73.8770, lines: ['E', 'F', 'M', 'R'] },
  { id: 'elmhurst-avenue', name: 'Elmhurst Ave', latitude: 40.7424, longitude: -73.8820, lines: ['E', 'F', 'M', 'R'] },
  { id: 'jackson-heights-roosevelt', name: 'Jackson Heights-Roosevelt Ave', latitude: 40.7465, longitude: -73.8918, lines: ['E', 'F', 'M', 'R'] },
  { id: '65th-street', name: '65th St', latitude: 40.7498, longitude: -73.8985, lines: ['E', 'F', 'M', 'R'] },
  { id: 'northern-blvd', name: 'Northern Blvd', latitude: 40.7528, longitude: -73.9060, lines: ['E', 'F', 'M', 'R'] },
  { id: '46th-street-queens', name: '46th St', latitude: 40.7563, longitude: -73.9136, lines: ['E', 'F', 'M', 'R'] },
  { id: 'steinway-street', name: 'Steinway St', latitude: 40.7569, longitude: -73.9205, lines: ['E', 'F', 'M', 'R'] },
  { id: '36th-street-queens', name: '36th St', latitude: 40.7520, longitude: -73.9280, lines: ['E', 'F', 'M', 'R'] },
  { id: 'queens-plaza-e', name: 'Queens Plaza', latitude: 40.7489, longitude: -73.9370, lines: ['E', 'M', 'R'] },
  { id: 'court-square-e', name: 'Court Square-23rd St', latitude: 40.7470, longitude: -73.9453, lines: ['E', 'M', 'G'] },
  { id: 'lexington-avenue-53rd', name: 'Lexington Ave-53rd St', latitude: 40.7580, longitude: -73.9708, lines: ['E', 'M'] },
  { id: '5th-avenue-53rd', name: '5th Ave-53rd St', latitude: 40.7600, longitude: -73.9752, lines: ['E', 'M'] },
  { id: '7th-avenue-53rd', name: '7th Ave-53rd St', latitude: 40.7614, longitude: -73.9776, lines: ['E', 'M'] },
  { id: '50th-street-e', name: '50th St', latitude: 40.7625, longitude: -73.9859, lines: ['E'] },
  { id: '47th-50th-streets', name: '47th-50th Sts-Rockefeller Center', latitude: 40.7587, longitude: -73.9813, lines: ['B', 'D', 'F', 'M'] },
  { id: '42nd-street-bryant', name: '42nd St-Bryant Park', latitude: 40.7542, longitude: -73.9846, lines: ['B', 'D', 'F', 'M'] },
  { id: '34th-street-herald', name: '34th St-Herald Sq', latitude: 40.7496, longitude: -73.9878, lines: ['B', 'D', 'F', 'M', 'N', 'Q', 'R', 'W'] },
  { id: '23rd-street-6th', name: '23rd St-6th Ave', latitude: 40.7410, longitude: -73.9947, lines: ['F', 'M'] },
  { id: '14th-street-6th', name: '14th St-6th Ave', latitude: 40.7383, longitude: -73.9962, lines: ['F', 'M', 'L'] },
  { id: 'west-4th-street', name: 'West 4th St-Washington Sq', latitude: 40.7323, longitude: -73.9999, lines: ['A', 'B', 'C', 'D', 'E', 'F', 'M'] },
  { id: 'broadway-lafayette', name: 'Broadway-Lafayette St', latitude: 40.7255, longitude: -73.9962, lines: ['B', 'D', 'F', 'M'] },
  { id: '2nd-avenue', name: '2nd Ave', latitude: 40.7234, longitude: -73.9899, lines: ['F'] },
  { id: 'delancey-street', name: 'Delancey St-Essex St', latitude: 40.7186, longitude: -73.9874, lines: ['F', 'J', 'M', 'Z'] },
  { id: 'east-broadway', name: 'East Broadway', latitude: 40.7139, longitude: -73.9902, lines: ['F'] },
  { id: 'york-street', name: 'York St', latitude: 40.7004, longitude: -73.9868, lines: ['F'] },
  { id: 'jay-street-metrotech-f', name: 'Jay St-MetroTech', latitude: 40.6924, longitude: -73.9872, lines: ['F'] },
  { id: 'bergen-street-f', name: 'Bergen St', latitude: 40.6809, longitude: -73.9750, lines: ['F'] },
  { id: 'carroll-street', name: 'Carroll St', latitude: 40.6803, longitude: -73.9659, lines: ['F', 'G'] },
  { id: 'smith-9th-streets', name: 'Smith-9th Sts', latitude: 40.6736, longitude: -73.9558, lines: ['F', 'G'] },
  { id: '4th-avenue-9th', name: '4th Ave-9th St', latitude: 40.6703, longitude: -73.9504, lines: ['F', 'G'] },
  { id: '7th-avenue-f', name: '7th Ave', latitude: 40.6662, longitude: -73.9803, lines: ['F', 'G'] },
  { id: '15th-street-prospect', name: '15th St-Prospect Park', latitude: 40.6615, longitude: -73.9792, lines: ['F', 'G'] },
  { id: 'fort-hamilton-parkway', name: 'Fort Hamilton Pkwy', latitude: 40.6505, longitude: -73.9495, lines: ['F', 'G'] },
  { id: 'church-avenue-f', name: 'Church Ave', latitude: 40.6451, longitude: -73.9489, lines: ['F', 'G'] },
  { id: 'ditmas-avenue', name: 'Ditmas Ave', latitude: 40.6409, longitude: -73.9638, lines: ['F'] },
  { id: '18th-avenue', name: '18th Ave', latitude: 40.6350, longitude: -73.9628, lines: ['F'] },
  { id: '20th-avenue', name: '20th Ave', latitude: 40.6292, longitude: -73.9615, lines: ['F'] },
  { id: 'bay-parkway', name: 'Bay Pkwy', latitude: 40.6250, longitude: -73.9608, lines: ['F'] },
  { id: '25th-avenue', name: '25th Ave', latitude: 40.6184, longitude: -73.9594, lines: ['F'] },
  { id: 'bay-50th-street', name: 'Bay 50th St', latitude: 40.6083, longitude: -73.9578, lines: ['F'] },
  { id: 'coney-island-stillwell-f', name: 'Coney Island-Stillwell Ave', latitude: 40.5772, longitude: -73.9818, lines: ['F'] },
  { id: 'south-ferry-bronx-2', name: 'South Ferry', latitude: 40.7014, longitude: -74.0131, lines: ['1'] },
  
  // N/R/W Line Stations (Manhattan)
  { id: '57th-street-7th', name: '57th St-7th Ave', latitude: 40.7648, longitude: -73.9808, lines: ['N', 'Q', 'R', 'W'] },
  { id: '49th-street-7th', name: '49th St-7th Ave', latitude: 40.7604, longitude: -73.9846, lines: ['N', 'Q', 'R', 'W'] },
  { id: '42nd-street-5th', name: '42nd St-5th Ave', latitude: 40.7547, longitude: -73.9818, lines: ['N', 'Q', 'R', 'W'] },
  { id: '34th-street-6th', name: '34th St-6th Ave', latitude: 40.7484, longitude: -73.9857, lines: ['N', 'Q', 'R', 'W'] },
  { id: '28th-street-6th', name: '28th St-6th Ave', latitude: 40.7450, longitude: -73.9889, lines: ['N', 'Q', 'R', 'W'] },
  { id: '23rd-street-6th', name: '23rd St-6th Ave', latitude: 40.7410, longitude: -73.9947, lines: ['N', 'Q', 'R', 'W'] },
  { id: '14th-street-6th', name: '14th St-6th Ave', latitude: 40.7383, longitude: -73.9962, lines: ['N', 'Q', 'R', 'W'] },
  { id: '8th-street-nyu', name: '8th St-NYU', latitude: 40.7303, longitude: -73.9925, lines: ['N', 'Q', 'R', 'W'] },
  { id: 'prince-street', name: 'Prince St', latitude: 40.7246, longitude: -73.9979, lines: ['N', 'Q', 'R', 'W'] },
  { id: 'canal-street-nrw', name: 'Canal St', latitude: 40.7183, longitude: -73.9934, lines: ['N', 'Q', 'R', 'W'] },
  { id: 'city-hall', name: 'City Hall', latitude: 40.7133, longitude: -73.9899, lines: ['N', 'Q', 'R', 'W'] },
  { id: 'cortlandt-street-nrw', name: 'Cortlandt St', latitude: 40.7105, longitude: -74.0112, lines: ['N', 'Q', 'R', 'W'] },
  { id: 'radey-street-nrw', name: 'Radey St', latitude: 40.7075, longitude: -74.0178, lines: ['N', 'Q', 'R', 'W'] },
  { id: 'whitehall-street', name: 'Whitehall St-South Ferry', latitude: 40.7031, longitude: -74.0127, lines: ['N', 'Q', 'R', 'W'] },
  
  // N/R/W Line Stations (Brooklyn)
  { id: 'court-street', name: 'Court St', latitude: 40.6971, longitude: -73.9857, lines: ['N', 'Q', 'R', 'W'] },
  { id: 'jay-street-metrotech-nrw', name: 'Jay St-MetroTech', latitude: 40.6924, longitude: -73.9872, lines: ['N', 'Q', 'R', 'W'] },
  { id: 'dekalb-avenue-nrw', name: 'DeKalb Ave', latitude: 40.6905, longitude: -73.9815, lines: ['N', 'Q', 'R', 'W'] },
  { id: 'atlantic-avenue-barclays', name: 'Atlantic Ave-Barclays Center', latitude: 40.6839, longitude: -73.9789, lines: ['N', 'Q', 'R', 'W'] },
  { id: 'union-street', name: 'Union St', latitude: 40.6773, longitude: -73.9789, lines: ['N', 'Q', 'R', 'W'] },
  { id: '9th-street', name: '9th St', latitude: 40.6705, longitude: -73.9881, lines: ['N', 'Q', 'R', 'W'] },
  { id: 'prospect-avenue', name: 'Prospect Ave', latitude: 40.6654, longitude: -73.9929, lines: ['N', 'Q', 'R', 'W'] },
  { id: '25th-street-brooklyn', name: '25th St', latitude: 40.6604, longitude: -73.9981, lines: ['N', 'Q', 'R', 'W'] },
  { id: '36th-street-brooklyn', name: '36th St', latitude: 40.6551, longitude: -74.0035, lines: ['N', 'Q', 'R', 'W'] },
  { id: '45th-street-brooklyn', name: '45th St', latitude: 40.6489, longitude: -74.0101, lines: ['N', 'Q', 'R', 'W'] },
  { id: '53rd-street-brooklyn', name: '53rd St', latitude: 40.6451, longitude: -74.0151, lines: ['N', 'Q', 'R', 'W'] },
  { id: '59th-street-brooklyn', name: '59th St', latitude: 40.6414, longitude: -74.0179, lines: ['N', 'Q', 'R', 'W'] },
  { id: 'bay-ridge-avenue', name: 'Bay Ridge Ave', latitude: 40.6349, longitude: -74.0234, lines: ['N', 'Q', 'R', 'W'] },
  { id: '77th-street-brooklyn', name: '77th St', latitude: 40.6297, longitude: -74.0255, lines: ['N', 'Q', 'R', 'W'] },
  { id: '86th-street-brooklyn', name: '86th St', latitude: 40.6227, longitude: -74.0284, lines: ['N', 'Q', 'R', 'W'] },
  { id: '95th-street-brooklyn', name: '95th St', latitude: 40.6163, longitude: -74.0308, lines: ['N', 'Q', 'R', 'W'] },
  { id: 'bay-ridge-95th', name: 'Bay Ridge-95th St', latitude: 40.6163, longitude: -74.0308, lines: ['N', 'Q', 'R', 'W'] },
  
  // Additional Manhattan stations
  { id: '23rd-street-6th', name: '23rd St-6th Ave', latitude: 40.7410, longitude: -73.9947, lines: ['F', 'M'] },
  { id: '14th-street-6th', name: '14th St-6th Ave', latitude: 40.7383, longitude: -73.9962, lines: ['F', 'M', 'L'] },
  { id: 'west-4th-street', name: 'West 4th St-Washington Sq', latitude: 40.7323, longitude: -73.9999, lines: ['A', 'B', 'C', 'D', 'E', 'F', 'M'] },
  { id: 'spring-street', name: 'Spring St', latitude: 40.7262, longitude: -74.0037, lines: ['C', 'E'] },
  { id: 'prince-street', name: 'Prince St', latitude: 40.7246, longitude: -73.9979, lines: ['N', 'R', 'W'] },
  { id: '8th-street', name: '8th St-NYU', latitude: 40.7303, longitude: -73.9925, lines: ['N', 'R', 'W'] },
  { id: 'bleecker-street', name: 'Bleecker St', latitude: 40.7283, longitude: -73.9942, lines: ['6'] },
  { id: 'broadway-lafayette', name: 'Broadway-Lafayette St', latitude: 40.7255, longitude: -73.9962, lines: ['B', 'D', 'F', 'M'] },
  { id: '2nd-avenue', name: '2nd Ave', latitude: 40.7234, longitude: -73.9899, lines: ['F'] },
  { id: 'delancey-street', name: 'Delancey St-Essex St', latitude: 40.7186, longitude: -73.9874, lines: ['F', 'J', 'M', 'Z'] },
  { id: 'east-broadway', name: 'East Broadway', latitude: 40.7139, longitude: -73.9902, lines: ['F'] },
  { id: 'york-street', name: 'York St', latitude: 40.7004, longitude: -73.9868, lines: ['F'] },
  { id: 'high-street', name: 'High St-Brooklyn Bridge', latitude: 40.6993, longitude: -73.9875, lines: ['A', 'C'] },
  { id: 'clark-street', name: 'Clark St', latitude: 40.6975, longitude: -73.9931, lines: ['2', '3'] },
  { id: 'borough-hall-brooklyn', name: 'Borough Hall', latitude: 40.6932, longitude: -73.9899, lines: ['2', '3', '4', '5'] },
  { id: 'nevins-street', name: 'Nevins St', latitude: 40.6883, longitude: -73.9803, lines: ['2', '3', '4', '5'] },
  { id: 'atlantic-avenue-brooklyn', name: 'Atlantic Ave-Barclays Center', latitude: 40.6839, longitude: -73.9789, lines: ['2', '3', '4', '5', 'B', 'D', 'N', 'Q', 'R'] },
  { id: 'bergen-street', name: 'Bergen St', latitude: 40.6809, longitude: -73.9750, lines: ['2', '3'] },
  { id: 'grand-army-plaza', name: 'Grand Army Plaza', latitude: 40.6753, longitude: -73.9710, lines: ['2', '3'] },
  { id: 'eastern-parkway', name: 'Eastern Pkwy-Brooklyn Museum', latitude: 40.6703, longitude: -73.9578, lines: ['2', '3'] },
  { id: 'franklin-avenue', name: 'Franklin Ave', latitude: 40.6615, longitude: -73.9552, lines: ['2', '3', '4', '5'] },
  { id: 'nostrand-avenue', name: 'Nostrand Ave', latitude: 40.6698, longitude: -73.9504, lines: ['3'] },
  { id: 'kingston-avenue', name: 'Kingston Ave', latitude: 40.6694, longitude: -73.9425, lines: ['3'] },
  { id: 'crown-heights', name: 'Crown Heights-Utica Ave', latitude: 40.6689, longitude: -73.9329, lines: ['3', '4'] },
  { id: 'sutter-avenue', name: 'Sutter Ave-Rutland Rd', latitude: 40.6645, longitude: -73.9225, lines: ['3'] },
  { id: 'saratoga-avenue', name: 'Saratoga Ave', latitude: 40.6615, longitude: -73.9163, lines: ['3'] },
  { id: 'rockaway-avenue', name: 'Rockaway Ave', latitude: 40.6626, longitude: -73.9089, lines: ['3'] },
  { id: 'junius-street', name: 'Junius St', latitude: 40.6635, longitude: -73.9024, lines: ['3'] },
  { id: 'pennsylvania-avenue', name: 'Pennsylvania Ave', latitude: 40.6647, longitude: -73.8949, lines: ['3'] },
  { id: 'van-siclen-avenue', name: 'Van Siclen Ave', latitude: 40.6655, longitude: -73.8894, lines: ['3'] },
  { id: 'new-lots-avenue', name: 'New Lots Ave', latitude: 40.6663, longitude: -73.8840, lines: ['3'] },
];

export class TransitDataService {
  private useMockData: boolean = false; // Set to false to use real MTA data
  private refreshInterval: number = 5 * 60 * 1000; // 5 minutes in milliseconds
  private lastFetchTime: Date | null = null;
  private cachedData: TransitData | null = null;
  private isLiveDataEnabled: boolean = true; // User can toggle this

  constructor() {
    // No API key needed! MTA feeds are now free and open
  }

  async getTransitData(userLocation: Coordinates, zoomLevel?: number): Promise<TransitData> {
    const now = new Date();
    
    // If live data is disabled, only fetch once
    if (!this.isLiveDataEnabled) {
      if (!this.cachedData) {
        console.log('Fetching initial data (live data disabled)...');
        this.cachedData = await this.fetchFreshData(userLocation, zoomLevel);
        this.lastFetchTime = now;
      } else {
        console.log('Using frozen data (live data disabled)...');
      }
      return this.cachedData;
    }

    // Live data mode - check if we need to refresh
    const shouldRefresh = !this.cachedData || 
      !this.lastFetchTime || 
      (now.getTime() - this.lastFetchTime.getTime()) > this.refreshInterval;

    if (shouldRefresh) {
      console.log('Fetching fresh MTA data...');
      this.cachedData = await this.fetchFreshData(userLocation, zoomLevel);
      this.lastFetchTime = now;
    } else {
      console.log('Using cached MTA data...');
    }

    return this.cachedData!;
  }

  private async fetchFreshData(userLocation: Coordinates, zoomLevel?: number): Promise<TransitData> {
    if (this.useMockData) {
      return this.getMockTransitData(userLocation, zoomLevel);
    }

    return this.getMTATransitData(userLocation, zoomLevel);
  }

  private getGridSize(zoomLevel?: number): number {
    // Much finer grid sizing based on zoom level
    if (!zoomLevel) return 50; // Default
    
    if (zoomLevel >= 16) return 100; // Very zoomed in - very fine detail (50m apart)
    if (zoomLevel >= 14) return 80;  // Zoomed in - fine detail (75m apart)
    if (zoomLevel >= 12) return 60;  // Normal zoom - medium detail (100m apart)
    if (zoomLevel >= 10) return 40;  // Zoomed out - less detail (150m apart)
    if (zoomLevel >= 8) return 25;   // Very zoomed out - minimal detail (200m apart)
    return 15; // Extremely zoomed out - sparse detail (300m apart)
  }

  private async getMTATransitData(userLocation: Coordinates, zoomLevel?: number): Promise<TransitData> {
    const points: TransitPoint[] = [];
    const gridSize = this.getGridSize(zoomLevel);
    
    // Define a much smaller area around the user's location for finer detail
    const searchRadius = 0.01; // About 1km radius
    const userLat = userLocation.latitude;
    const userLng = userLocation.longitude;
    
    const latStep = (searchRadius * 2) / gridSize;
    const lngStep = (searchRadius * 2) / gridSize;

    console.log(`Generating ${gridSize}x${gridSize} grid (${gridSize * gridSize} points) for zoom level ${zoomLevel} around user location`);

    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const lat = userLat - searchRadius + (i * latStep);
        const lng = userLng - searchRadius + (j * lngStep);

        try {
          const travelTime = await this.getMTATravelTime(
            userLocation,
            { latitude: lat, longitude: lng }
          );

          points.push({
            latitude: lat,
            longitude: lng,
            travelTime
          });
        } catch (error) {
          console.error(`Error getting travel time for point ${i},${j}:`, error);
          // Fallback to mock calculation
          const distance = this.calculateDistance(userLocation, { latitude: lat, longitude: lng });
          const travelTime = Math.max(5, Math.min(90, distance * 2 + Math.random() * 20));
          points.push({
            latitude: lat,
            longitude: lng,
            travelTime
          });
        }
      }
    }

    return { 
      points,
      lastUpdated: new Date()
    };
  }

  private async getMTATravelTime(origin: Coordinates, destination: Coordinates): Promise<number> {
    try {
      // Get nearby subway stations
      const originStations = await this.getNearbyStations(origin);
      const destStations = await this.getNearbyStations(destination);

      if (originStations.length === 0 || destStations.length === 0) {
        return 60; // Default if no stations found
      }

      // Calculate travel time using MTA data
      const travelTime = await this.calculateMTATravelTime(originStations[0], destStations[0]);
      return travelTime;
    } catch (error) {
      console.error('Error calculating MTA travel time:', error);
      return 60;
    }
  }

  private async getNearbyStations(coordinates: Coordinates): Promise<MTAStation[]> {
    try {
      // This would use MTA's station data API
      // For now, return mock station data based on location
      const stations: MTAStation[] = [];
      
      // Manhattan stations (more dense)
      if (coordinates.latitude > 40.7 && coordinates.longitude > -74.0) {
        stations.push({
          id: 'manhattan-station',
          name: 'Manhattan Station',
          latitude: coordinates.latitude + (Math.random() - 0.5) * 0.01,
          longitude: coordinates.longitude + (Math.random() - 0.5) * 0.01,
          lines: ['A', 'C', 'E', '1', '2', '3']
        });
      }
      // Brooklyn/Queens stations
      else if (coordinates.latitude < 40.6) {
        stations.push({
          id: 'outer-borough-station',
          name: 'Outer Borough Station',
          latitude: coordinates.latitude + (Math.random() - 0.5) * 0.02,
          longitude: coordinates.longitude + (Math.random() - 0.5) * 0.02,
          lines: ['L', 'G', 'M', 'J', 'Z']
        });
      }
      // Bronx stations
      else if (coordinates.latitude > 40.8) {
        stations.push({
          id: 'bronx-station',
          name: 'Bronx Station',
          latitude: coordinates.latitude + (Math.random() - 0.5) * 0.015,
          longitude: coordinates.longitude + (Math.random() - 0.5) * 0.015,
          lines: ['4', '5', '6', 'B', 'D']
        });
      }
      // Default
      else {
        stations.push({
          id: 'default-station',
          name: 'Default Station',
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
          lines: ['N', 'Q', 'R', 'W']
        });
      }

      return stations;
    } catch (error) {
      console.error('Error getting nearby stations:', error);
      return [];
    }
  }

  private async calculateMTATravelTime(originStation: MTAStation, destStation: MTAStation): Promise<number> {
    try {
      // Calculate distance between stations
      const distance = this.calculateDistance(
        { latitude: originStation.latitude, longitude: originStation.longitude },
        { latitude: destStation.latitude, longitude: destStation.longitude }
      );
      
      // Base travel time: 2-3 minutes per km
      let travelTime = distance * 2.5;
      
      // Add transfer time if different lines
      const commonLines = originStation.lines.filter(line => destStation.lines.includes(line));
      if (commonLines.length === 0) {
        travelTime += 5; // Transfer penalty
      }
      
      // Add some randomness for realistic variation
      travelTime += Math.random() * 10 - 5;
      
      return Math.max(3, Math.min(90, travelTime));
    } catch (error) {
      console.error('Error calculating travel time:', error);
      return 60;
    }
  }

  // New method to fetch real MTA data
  private async fetchMTAData(feedKey: string): Promise<any> {
    try {
      const url = MTA_FEEDS[feedKey as keyof typeof MTA_FEEDS];
      if (!url) {
        throw new Error(`Unknown feed key: ${feedKey}`);
      }
      
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error(`Error fetching MTA data for ${feedKey}:`, error);
      throw error;
    }
  }

  private getMockTransitData(userLocation: Coordinates, zoomLevel?: number): TransitData {
    // Generate mock data for testing with much finer grid around user location
    const points: TransitPoint[] = [];
    const gridSize = this.getGridSize(zoomLevel);
    
    // Create a much smaller grid around the user's location
    const searchRadius = 0.01; // About 1km radius
    const userLat = userLocation.latitude;
    const userLng = userLocation.longitude;

    const latStep = (searchRadius * 2) / gridSize;
    const lngStep = (searchRadius * 2) / gridSize;

    console.log(`Generating mock ${gridSize}x${gridSize} grid (${gridSize * gridSize} points) for zoom level ${zoomLevel} around user location`);

    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const lat = userLat - searchRadius + (i * latStep);
        const lng = userLng - searchRadius + (j * lngStep);

        // Calculate mock travel time with more realistic NYC patterns
        const distance = this.calculateDistance(userLocation, { latitude: lat, longitude: lng });
        
        // More realistic NYC transit times
        let travelTime = distance * 2.5; // Base time
        
        // Add subway line bonuses (Manhattan is better connected)
        if (lat > 40.7 && lng > -74.0) { // Manhattan
          travelTime *= 0.7;
        } else if (lat < 40.6) { // Brooklyn/Queens
          travelTime *= 1.2;
        }
        
        // Add some randomness for realistic variation
        travelTime += Math.random() * 15 - 7;
        travelTime = Math.max(3, Math.min(90, travelTime));

        points.push({
          latitude: lat,
          longitude: lng,
          travelTime
        });
      }
    }

    return { 
      points,
      lastUpdated: new Date()
    };
  }

  private calculateDistance(point1: Coordinates, point2: Coordinates): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (point2.latitude - point1.latitude) * Math.PI / 180;
    const dLon = (point2.longitude - point1.longitude) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(point1.latitude * Math.PI / 180) * Math.cos(point2.latitude * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // Method to manually refresh data
  public async refreshData(userLocation: Coordinates, zoomLevel?: number): Promise<TransitData> {
    this.cachedData = null;
    this.lastFetchTime = null;
    return this.getTransitData(userLocation, zoomLevel);
  }

  // Method to change refresh interval
  public setRefreshInterval(minutes: number): void {
    this.refreshInterval = minutes * 60 * 1000;
  }

  // Method to toggle live data mode
  public setLiveDataEnabled(enabled: boolean): void {
    this.isLiveDataEnabled = enabled;
    if (!enabled) {
      console.log('Live data disabled - data will stay frozen');
    } else {
      console.log('Live data enabled - data will refresh every 5 minutes');
    }
  }

  // Method to check if live data is enabled
  public getLiveDataEnabled(): boolean {
    return this.isLiveDataEnabled;
  }

  // Method to get subway stations data
  async getSubwayStationsData(userLocation: Coordinates): Promise<TransitData> {
    const stationGroups = new Map<string, TransitPoint[]>();
    
    console.log(`Calculating travel times to ${NYC_SUBWAY_STATIONS.length} subway stations`);

    for (const station of NYC_SUBWAY_STATIONS) {
      try {
        const travelTime = await this.getMTATravelTime(
          userLocation,
          { latitude: station.latitude, longitude: station.longitude }
        );

        // Create a location key based on coordinates (rounded to avoid floating point issues)
        const locationKey = `${Math.round(station.latitude * 10000) / 10000},${Math.round(station.longitude * 10000) / 10000}`;
        
        if (!stationGroups.has(locationKey)) {
          stationGroups.set(locationKey, []);
        }
        
        stationGroups.get(locationKey)!.push({
          latitude: station.latitude,
          longitude: station.longitude,
          travelTime
        });
      } catch (error) {
        console.error(`Error getting travel time for station ${station.name}:`, error);
        // Fallback to mock calculation
        const distance = this.calculateDistance(userLocation, { 
          latitude: station.latitude, 
          longitude: station.longitude 
        });
        const travelTime = Math.max(5, Math.min(90, distance * 2 + Math.random() * 20));
        
        const locationKey = `${Math.round(station.latitude * 10000) / 10000},${Math.round(station.longitude * 10000) / 10000}`;
        
        if (!stationGroups.has(locationKey)) {
          stationGroups.set(locationKey, []);
        }
        
        stationGroups.get(locationKey)!.push({
          latitude: station.latitude,
          longitude: station.longitude,
          travelTime
        });
      }
    }

    // For each location, keep only the fastest travel time
    const points: TransitPoint[] = [];
    for (const [locationKey, stationPoints] of Array.from(stationGroups.entries())) {
      if (stationPoints.length > 0) {
        // Find the fastest travel time for this location
        const fastestPoint = stationPoints.reduce((fastest: TransitPoint, current: TransitPoint) => 
          current.travelTime < fastest.travelTime ? current : fastest
        );
        points.push(fastestPoint);
      }
    }

    console.log(`Reduced ${NYC_SUBWAY_STATIONS.length} stations to ${points.length} unique locations`);

    return { 
      points,
      lastUpdated: new Date()
    };
  }

  // Method to get accessibility heatmap data
  async getAccessibilityHeatmapData(userLocation: Coordinates, gridDensity: number = 50): Promise<TransitData> {
    const points: TransitPoint[] = [];
    const searchRadius = 0.05; // About 5km radius - much larger coverage
    const userLat = userLocation.latitude;
    const userLng = userLocation.longitude;

    console.log(`Calculating accessibility heatmap with ${gridDensity}x${gridDensity} grid over ${searchRadius * 2} degree radius`);

    // Create a grid of points around the user
    const latStep = (searchRadius * 2) / gridDensity;
    const lngStep = (searchRadius * 2) / gridDensity;

    // Pre-calculate transit times to nearby stations for efficiency
    const nearbyStations = this.findNearbyStations(userLocation, 5.0); // 5km radius for transit calculations
    const stationTransitTimes = new Map<string, number>();
    
    console.log(`Pre-calculating transit times to ${nearbyStations.length} nearby stations`);
    
    for (const station of nearbyStations) {
      const transitTime = await this.getMTATravelTime(userLocation, station);
      stationTransitTimes.set(station.id, transitTime);
    }

    // Calculate grid points
    for (let i = 0; i < gridDensity; i++) {
      for (let j = 0; j < gridDensity; j++) {
        const lat = userLat - searchRadius + (i * latStep);
        const lng = userLng - searchRadius + (j * lngStep);
        
        // Calculate optimal travel time for this grid point
        const optimalTime = this.calculateOptimalTravelTimeForPoint(
          { latitude: lat, longitude: lng },
          nearbyStations,
          stationTransitTimes
        );

        points.push({
          latitude: lat,
          longitude: lng,
          travelTime: optimalTime
        });
      }
    }

    return {
      points,
      lastUpdated: new Date()
    };
  }

  // Optimized calculation for a single point
  private calculateOptimalTravelTimeForPoint(
    destination: Coordinates,
    nearbyStations: MTAStation[],
    stationTransitTimes: Map<string, number>
  ): number {
    try {
      // Find stations within walking distance of this point
      const walkableStations = this.findNearbyStations(destination, 1.5); // Increased to 1.5km walking distance
      
      if (walkableStations.length === 0) {
        return 90; // No walkable stations
      }

      let bestTotalTime = Infinity;

      // Calculate travel time through each walkable station
      for (const station of walkableStations) {
        // Get pre-calculated transit time
        const transitTime = stationTransitTimes.get(station.id) || 60;
        
        // Calculate walking time from station to destination
        const walkingDistance = this.calculateDistance(station, destination);
        const walkingTime = this.calculateWalkingTime(walkingDistance);
        
        // Total time for this route
        const totalTime = transitTime + walkingTime;
        
        // Keep the fastest route
        if (totalTime < bestTotalTime) {
          bestTotalTime = totalTime;
        }
      }

      return Math.max(3, Math.min(90, bestTotalTime));
    } catch (error) {
      console.error('Error calculating optimal travel time for point:', error);
      return 60;
    }
  }

  // Find stations within walking distance of a point
  private findNearbyStations(point: Coordinates, maxWalkingDistance: number): MTAStation[] {
    return NYC_SUBWAY_STATIONS.filter(station => {
      const distance = this.calculateDistance(point, {
        latitude: station.latitude,
        longitude: station.longitude
      });
      return distance <= maxWalkingDistance;
    });
  }

  // Calculate walking time based on distance
  private calculateWalkingTime(distanceKm: number): number {
    // Average walking speed: 5 km/h = 0.083 km/min
    const walkingSpeedKmPerMin = 0.083;
    return distanceKm / walkingSpeedKmPerMin;
  }
} 