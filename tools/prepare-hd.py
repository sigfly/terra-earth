"""Reproduce the 16K textures from NASA's 21,600 × 10,800 JPEGs.

Requires Pillow. Original downloads are cached, not committed.
"""
from pathlib import Path
from urllib.request import urlretrieve
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
BASE = 'https://assets.science.nasa.gov/content/dam/science/esd/eo/images/bmng/'
SOURCES = {
    'color': ('color-hi.jpg', 'bmng-topography/july/world.topo.200407.3x21600x10800.jpg'),
    'topography': ('topo-hi.jpg', 'topography/gebco_08_rev_elev_21600x10800.jpg'),
    'bathymetry': ('bathy-hi.jpg', 'bathymetry/gebco_08_rev_bath_21600x10800.jpg'),
}
Image.MAX_IMAGE_PIXELS = 250_000_000
for name, (cached, url) in SOURCES.items():
    cache = ROOT / '.cache' / cached
    cache.parent.mkdir(exist_ok=True)
    if not cache.exists():
        temp = cache.with_suffix('.part')
        urlretrieve(BASE + url, temp)
        temp.replace(cache)
    with Image.open(cache) as source:
        if source.size != (21600, 10800):
            raise ValueError(f'Unexpected source dimensions: {source.size}')
        mode = 'RGB' if name == 'color' else 'L'
        output = ROOT / 'assets' / (name + '.jpg')
        image = source.convert(mode).resize((16384, 8192), Image.Resampling.LANCZOS)
        image.save(output, quality=85 if name == 'color' else 91, optimize=True, subsampling=0 if mode == 'RGB' else -1)
        print(f'{output.name}: {image.size}, {output.stat().st_size / 1024**2:.1f} MiB')
