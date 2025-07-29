import osmnx as ox
import geopandas as gpd

# Download the pedestrian network for NYC
print("Downloading NYC pedestrian network...")
G = ox.graph_from_place('New York City, New York, USA', network_type='walk')

# Get all nodes as a GeoDataFrame
nodes, _ = ox.graph_to_gdfs(G)

# Create a convex hull (or union of all nodes) as the walkable area
walkable_area = nodes.unary_union.convex_hull

# Convert to GeoDataFrame for export
walkable_gdf = gpd.GeoDataFrame(geometry=[walkable_area], crs=nodes.crs)

# Save as GeoJSON
output_path = "nyc_walkable_area.geojson"
walkable_gdf.to_file(output_path, driver="GeoJSON")
print(f"Saved walkable area to {output_path}")