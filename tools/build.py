"""Generate the self-contained atlas and a split-asset hosted edition."""
from pathlib import Path
import base64
import shutil

ROOT = Path(__file__).resolve().parents[1]
MAPS = {'__COLOR__': 'color.jpg', '__LAND__': 'topography.jpg', '__SEA__': 'bathymetry.jpg'}

def build():
    html = (ROOT / 'src/viewer.html').read_text(encoding='utf-8')
    hosted = html
    static = ROOT / 'dist'
    (static / 'assets').mkdir(parents=True, exist_ok=True)
    for placeholder, name in MAPS.items():
        if html.count(placeholder) != 1:
            raise ValueError(f'Expected one {placeholder}')
        data = (ROOT / 'assets' / name).read_bytes()
        if not data.startswith(b'\xff\xd8'):
            raise ValueError(f'Invalid JPEG: {name}')
        html = html.replace(placeholder, 'data:image/jpeg;base64,' + base64.b64encode(data).decode('ascii'))
        hosted = hosted.replace(placeholder, 'assets/' + name)
        if len(data) >= 25 * 1024**2:
            raise ValueError(f'Hosted asset exceeds 25 MiB: {name}')
        shutil.copyfile(ROOT / 'assets' / name, static / 'assets' / name)
    out = ROOT / 'terra-offline.html'
    out.write_text(html, encoding='utf-8')
    if out.stat().st_size >= 100 * 1024**2:
        raise ValueError('Standalone exceeds GitHub 100 MiB file limit')
    (static / 'index.html').write_text(hosted, encoding='utf-8')
    (ROOT / 'index.html').write_text(hosted, encoding='utf-8')
    print(f'{out.name}: {out.stat().st_size / 1024**2:.2f} MiB')

if __name__ == '__main__':
    build()
