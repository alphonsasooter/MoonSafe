
import rasterio
import numpy as np
from pathlib import Path

# Locate the NASA LOLA data folder
DATA_DIR = (
    Path(__file__).resolve().parents[1]
    / "data"
    / "lola"
)

files = [
    "Site04_final_adj_5mpp_surf.tif",
    "Site04_final_adj_5mpp_slp.tif",
    "Site23_final_adj_5mpp_surf.tif",
    "Site23_final_adj_5mpp_slp.tif"
]

print("\n========== MOONSAFE LOLA INSPECTION ==========\n")

for filename in files:

    filepath = DATA_DIR / filename

    print("\nFile:", filename)

    with rasterio.open(filepath) as src:

        data = src.read(1, masked=True)

        valid = data.compressed()
        valid = valid[np.isfinite(valid)]

        print("CRS:", src.crs)
        print("Dimensions:", src.width, "x", src.height)
        print("Resolution:", src.res)
        print("Bounds:", src.bounds)
        print("Data type:", src.dtypes[0])
        print("NoData value:", src.nodata)

        print("Valid pixels:", len(valid))
        print("Total pixels:", src.width * src.height)

        if len(valid) > 0:

            print("Minimum:", np.min(valid))
            print("Maximum:", np.max(valid))
            print("Mean:", np.mean(valid))
            print("Standard deviation:", np.std(valid))

print("\n========== INSPECTION COMPLETE ==========\n")
