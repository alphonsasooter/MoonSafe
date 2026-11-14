
from terrain.analysis import analyze_site
import json

for site in ["shackleton", "malapert"]:

    print("\nAnalyzing:", site)

    result = analyze_site(site)

    print(json.dumps(result, indent=4))
