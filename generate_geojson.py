import geopandas as gpd

# Path to the shapefile (.shp) inside your nybb_25b folder
shapefile_path = 'nybb_25b/nybb.shp'  # Change this if your path is different

# Load the borough boundaries shapefile
gdf = gpd.read_file(shapefile_path)
print("Original CRS:", gdf.crs)
print("Boroughs loaded:", len(gdf))

# Merge all borough polygons into one (unary_union)
nyc_boundary = gdf.unary_union

# Create GeoDataFrame from merged polygon
nyc_gdf = gpd.GeoDataFrame(geometry=[nyc_boundary], crs=gdf.crs)

# Reproject to WGS84 lat/lng (EPSG:4326)
nyc_gdf = nyc_gdf.to_crs(epsg=4326)
print("Reprojected CRS:", nyc_gdf.crs)

# Save merged polygon as GeoJSON
output_path = 'nyc_boundary.geojson'
nyc_gdf.to_file(output_path, driver='GeoJSON')
print(f"Saved merged NYC boundary GeoJSON to {output_path}")
