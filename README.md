# Terra — Interactive 3D Earth Atlas

A dependency-free WebGL 2 atlas of Earth inspired by [Luna Moon](https://github.com/sigfly/luna-moon). Open `index.html` alongside the included `assets/` directory, or run the build to generate `terra-offline.html`, a standalone file containing all imagery and code. No API key is required. For educational exploration, not scientific or navigation use.

**[Download the repository ZIP](https://github.com/sigfly/terra-earth/archive/refs/heads/main.zip)** and extract it before opening `index.html`. The [Actions builds](https://github.com/sigfly/terra-earth/actions) also provide a generated standalone HTML artifact when CI completes.

## Features

- Rotate, zoom (up to 64×), pinch, auto-rotate, and navigate to geographic coordinates or 22 landmarks.
- Four map layers: natural color, elevation, ocean bathymetry, and shaded relief.
- Adjustable relief shading, grid, labels, atmospheric glow, and night-side fill.
- Studio lighting or approximate geographic sunlight at a chosen UTC date and time, with subsolar coordinates.
- Fullscreen, PNG image export, keyboard controls, and responsive touch layout.
- Click the globe for reference-sphere coordinates. Landmark descriptions work offline.

## Map data

| Map | Embedded size | Source |
| --- | --- | --- |
| Natural color | 16384 × 8192 | NASA Blue Marble Next Generation, July 2004 |
| Land elevation | 16384 × 8192 | NASA Earth Observatory / GEBCO, 0–6400 m visualization |
| Ocean bathymetry | 16384 × 8192 | NASA Earth Observatory / GEBCO, −8000–0 m visualization |

All maps are downsampled from genuine 21,600 × 10,800 NASA source imagery, not upscaled from the previous edition. The 16K maps have about 2.45 km equatorial sampling, four times the original color pixel count and over nine times the original terrain pixel count. The base globe is an orthographic sphere (mean radius 6371 km); terrain is relief-lit in the fragment shader, not geometrically displaced. The NASA terrain JPEGs are 8-bit scaled visualizations, with compression and clipping; elevations above 6.4 km and ocean depths below 8 km cannot be distinguished. Surface heights are approximate and should not be used for measurement. Shoreline alignment and polar coverage vary across datasets. Blue Marble is a historical satellite composite, not a live image. Automatic quality selects 16K on capable desktops and 4K on low-memory/touch devices, subject to the GPU's texture limit. Choose 4K, 8K or 16K manually in the sidebar. 16K requires substantial GPU memory; terrain uses single-channel textures to reduce memory use. Actual loaded dimensions and sampling appear in the UI. Zoom beyond the underlying sampling does not reveal street-level detail.

## Development

```sh
python tools/build.py
```

`src/viewer.html` is the editable source. `assets/` contains the three processed 16K JPEG maps. The builder embeds them in `terra-offline.html` for offline use and creates a split-asset version in `index.html` and `dist/` for hosting, keeping individual hosted files below 25 MiB. Python 3.9+ standard library only. Do not edit generated files by hand. To regenerate the maps from NASA originals: `python -m pip install Pillow` then `python tools/prepare-hd.py` and `python tools/build.py`.

Optional browser smoke test:

```sh
npm install --no-save playwright
npx playwright install chromium
node tools/smoke-test.cjs
```

Set `CHROMIUM_PATH` to use an existing Chromium binary. The smoke test blocks HTTP/HTTPS requests and verifies rendering and controls, PNG export and narrow layouts. CI verifies the committed generated file matches the source and runs the offline browser test.

## Controls

| Action | Control |
| --- | --- |
| Rotate | Drag, or arrow keys when globe is focused |
| Zoom | Scroll, pinch, plus/minus buttons, or keyboard +/- |
| Inspect | Click a point or pick a landmark from the selector |
| Navigate | Preset regions, coordinate inputs, or landmark buttons |
| Lighting | Studio sun angle or UTC sunlight |

## Credits and provenance

- **NASA Blue Marble Next Generation:** [NASA Earth Observatory, topography edition](https://science.nasa.gov/earth/earth-observatory/blue-marble-next-generation/base-topography/), July 2004; Reto Stöckli and MODIS teams. [Original JPEG](https://assets.science.nasa.gov/content/dam/science/esd/eo/images/bmng/bmng-topography/july/world.topo.200407.3x21600x10800.jpg).
- **Elevation and bathymetry:** Jesse Allen, NASA Earth Observatory, using General Bathymetric Chart of the Oceans (GEBCO), British Oceanographic Data Centre. [Source and encoding documentation](https://science.nasa.gov/earth/earth-observatory/blue-marble-next-generation/topography-bathymetry-maps/). Original JPEGs: [elevation](https://assets.science.nasa.gov/content/dam/science/esd/eo/images/bmng/topography/gebco_08_rev_elev_21600x10800.jpg), [bathymetry](https://assets.science.nasa.gov/content/dam/science/esd/eo/images/bmng/bathymetry/gebco_08_rev_bath_21600x10800.jpg).
- **Design inspiration:** [sigfly/luna-moon](https://github.com/sigfly/luna-moon). Terra is an independently implemented Earth-specific viewer, not a fork or copy of Luna's source.
- NASA imagery and third-party data remain subject to their applicable usage terms; no NASA endorsement is implied.
