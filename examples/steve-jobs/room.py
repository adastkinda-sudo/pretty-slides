#!/usr/bin/env python3
"""The room of direction C (空房间): renders the parts of the room that are light, not shapes.

    python3 room.py                  # the sun of every page in rooms/*.json (room.jpg only if it is missing)
    python3 room.py S10 S11          # only these pages — safe to run while other sessions work on other pages
    python3 room.py --room           # also re-render assets/room.jpg (shared by every page: do it rarely, alone)
    python3 room.py S20 --preview /tmp/x   # also write quick composites (room + sun + object boxes) to /tmp/x
    python3 room.py --times          # print the sun-at-time table (what `"time": t` resolves to)

A board leaning on the wall (objects/apple1.js) is registered with "lean": 10 — room.py turns it into a staircase of
boxes itself (lean_boxes). Profiles that are not a lean (S08's Apple II: low front, sloping keyboard, high lid) are
still written by hand as shadow-only boxes; see making-a-page.md §5.

Inputs
- room.json            the shared room: camera, planks, baseboard, the window wall.
- rooms/<ID>.json      one page: the sun (a time of day + where the patch should land) and the objects standing in
                       the room ({"use": "mac", "cx", "baseY", "h"}). See making-a-page.md.
- objects/<use>.js     each object's real size in mm (`real: { w, h, d }`), read through node, so the drawn object and
                       its shadow come from the same numbers.

Outputs
- assets/room.jpg      the room itself: warm plaster wall, painted baseboard, wide plain-sawn oak planks seen from a
                       low camera (seams, butt joints and grain all follow the camera's perspective).
- assets/sun/<ID>.png  the sun through the window, ray traced: a soft-edged patch on the wall and the floor, window
                       bars, the shadows of the objects and their contact shadows. Overcast pages get a flat shade.
- assets/sun/<ID>.json where the png goes on the slide (inches) + the resolved sun (direction, colour), and how much
                       of each object's front is in the sun (objects use it to shade their insides).
"""
import json
import os
import subprocess
import sys

import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

HERE = os.path.dirname(os.path.abspath(__file__))
ROOM = json.load(open(os.path.join(HERE, 'room.json')))
CAM = ROOM['camera']
W_IN, H_IN = 13.333, 7.5
FY, YH, ZC, VX = CAM['floorY'], CAM['horizonY'], CAM['camZ'], CAM['vx']
HC = FY - YH  # camera height above the floor (wall-plane inches)
XL = ROOM['window']['XL']
COL = ROOM['colors']

# ── The sun at a time of day ────────────────────────────────────────────────────────────────────────────────────
# The light travels along d = (1, -s, -r): rightwards from the window in the left wall, down by s, and towards the
# back wall by r (per unit to the right).
#   r  small = raking light, long shadows thrown far to the right (early morning, late afternoon);
#      large = the light heads almost straight for the back wall, short shadows (noon).
#   s  how steeply it falls: the slant of the patch on the wall, how much of it lands on the floor.
# color/strength: the light itself; soft: the penumbra (in) — a low sun travels further, so its edges are softer.
# ambient: how much the rest of the room dims (0 = noon). A saturated warm patch can't be brighter than a warm white
#   wall, so evening light reads as light only because the room around it goes darker — as in a photograph.
SUN_KEYS = [
    (6.5, dict(r=0.75, s=0.14, color='FFE9C9', strength=0.90, soft=0.060, ambient=0.03)),
    (7.0, dict(r=0.90, s=0.22, color='FFF0D6', strength=1.00, soft=0.050, ambient=0.02)),
    (9.0, dict(r=1.40, s=0.25, color='FFF6E8', strength=0.95, soft=0.042, ambient=0.01)),
    (12.0, dict(r=2.60, s=0.28, color='FFFCF5', strength=1.00, soft=0.032, ambient=0.00)),
    (14.5, dict(r=1.60, s=0.25, color='FFF7E9', strength=0.80, soft=0.040, ambient=0.02)),
    (16.5, dict(r=1.00, s=0.20, color='FFEDD0', strength=0.92, soft=0.050, ambient=0.05)),
    (17.3, dict(r=0.80, s=0.16, color='FFE2B4', strength=1.00, soft=0.055, ambient=0.10)),
    (18.2, dict(r=0.65, s=0.11, color='FFD09C', strength=0.80, soft=0.070, ambient=0.13)),
    (19.0, dict(r=0.55, s=0.08, color='FBBE88', strength=0.65, soft=0.090, ambient=0.15)),
]


def rgb(h):
    return np.array([int(h[i:i + 2], 16) for i in (0, 2, 4)], dtype=float)


def hexc(v):
    return ''.join(f'{int(round(c)):02X}' for c in v)


def sun_at(t):
    """Interpolate the keyframes above. Numbers linearly, colours in RGB."""
    ks = SUN_KEYS
    if t <= ks[0][0]:
        return dict(ks[0][1])
    if t >= ks[-1][0]:
        return dict(ks[-1][1])
    for (t0, a), (t1, b) in zip(ks, ks[1:]):
        if t0 <= t <= t1:
            u = (t - t0) / (t1 - t0)
            out = {k: a[k] + (b[k] - a[k]) * u for k in ('r', 's', 'strength', 'soft', 'ambient')}
            out['color'] = hexc(rgb(a['color']) + (rgb(b['color']) - rgb(a['color'])) * u)
            return out


def floor_y(z):
    return YH + HC * ZC / (ZC - z)


def floor_z(y):
    return ZC - HC * ZC / (y - YH)


def resolve(spec):
    """rooms/<ID>.json "sun" → the concrete sun: direction, window opening in the left wall, light."""
    if spec is None or spec.get('sky') == 'overcast':
        return {'sky': 'overcast', 'shade': (spec or {}).get('shade', 0.07), 'color': (spec or {}).get('color', COL['overcast'])}
    p = sun_at(spec['time']) if 'time' in spec else {}
    for k in ('r', 's', 'color', 'strength', 'soft', 'ambient'):
        if k in spec:
            p[k] = spec[k]
    if 'dir' in spec:  # raw direction, as in the direction-C probe
        d = spec['dir']
        p['r'], p['s'] = -d[2] / d[0], -d[1] / d[0]
    r, s = p['r'], p['s']
    if 'window' in spec:  # raw window (world units), as in the probe
        win = dict(spec['window'])
        win.setdefault('mullions', [])
        win.setdefault('transoms', [])
    else:
        # Aim the patch: centre (x, y) and size (w, h) on the wall, in slide inches. A wall point x is lit through
        # window depth z = r·(x − XL); its height there is h_wall + s·(x − XL).
        a = spec['aim']
        x0, x1 = a['x'] - a['w'] / 2, a['x'] + a['w'] / 2
        lift = s * (a['x'] - XL)
        hb, ht = FY - (a['y'] + a['h'] / 2), FY - (a['y'] - a['h'] / 2)
        z0, z1 = r * (x0 - XL), r * (x1 - XL)
        h0, h1 = hb + lift, ht + lift
        bar = spec.get('bar', ROOM['window']['bar'])
        win = {
            'z': [round(z0, 4), round(z1, 4)], 'h': [round(h0, 4), round(h1, 4)],
            'mullions': [[round(z0 + f * (z1 - z0) - bar / 2, 4), round(z0 + f * (z1 - z0) + bar / 2, 4)] for f in spec.get('mullions', [])],
            'transoms': [[round(h0 + f * (h1 - h0) - bar / 2, 4), round(h0 + f * (h1 - h0) + bar / 2, 4)] for f in spec.get('transoms', [])],
        }
    p.update(dir=[1.0, -s, -r], window=win, XL=spec.get('XL', XL))
    if 'time' in spec:
        p['time'] = spec['time']
    return p


# ── Objects: real sizes from objects/<use>.js ───────────────────────────────────────────────────────────────────
_REAL = {}


def real_size(use):
    if use not in _REAL:
        path = os.path.join(HERE, 'objects', f'{use}.js')
        code = 'process.stdout.write(JSON.stringify(require(process.argv[1]).real))'
        out = subprocess.run(['node', '-e', code, path], capture_output=True, text=True)
        if out.returncode:
            sys.exit(f'✗ objects/{use}.js: {out.stderr.strip()}')
        _REAL[use] = json.loads(out.stdout)
    return _REAL[use]


def lean_boxes(o):
    """A flat thing leaning on the wall ("lean": n in rooms/<ID>.json; objects/apple1.js): its bottom edge on the floor
    at screen y = baseY, its top edge touching the wall h above that. room.py only knows upright boxes, so the wedge
    between the board and the wall becomes a staircase of n boxes (box i: up to i/n of the top, out to where the board
    is at (i−1)/n) — the shadow comes out narrow at the top and wide at the floor, as a leaning board's does.
    Returns the boxes and the board's corners in world units (to measure how much of its face is in the sun)."""
    real = real_size(o['use'])
    n = int(o['lean'])
    w_mm, h_mm = o.get('w_mm', real['w']), o.get('h_mm', real['h'])
    zf = ZC - HC * ZC / (o['baseY'] - YH)                 # depth of the bottom edge
    Ht = HC - (o['baseY'] - o['h'] - YH)                  # height of the top edge, at the wall
    W = w_mm * np.hypot(Ht, zf) / h_mm
    x0, x1 = o['cx'] - W / 2, o['cx'] + W / 2
    boxes = [(np.array([x0, 0.0, 0.0]), np.array([x1, Ht * i / n, zf * (1 - (i - 1) / n)])) for i in range(1, n + 1)]
    return boxes, (x0, x1, Ht, zf)


def object_box(o):
    """World box of an object standing on the floor: its front face is drawn at (cx, baseY, h) on the slide."""
    real = real_size(o['use'])
    w_mm, h_mm, d_mm = o.get('w_mm', real['w']), o.get('h_mm', real['h']), o.get('d_mm', real['d'])
    s = (o['baseY'] - YH) / HC
    zf = ZC * (1 - 1 / s)
    H = o['h'] / s
    Wd = H * w_mm / h_mm
    D = H * d_mm / h_mm
    xc = VX + (o['cx'] - VX) / s
    zb = zf - D
    if zb < 0:
        sys.exit(f"✗ {o['use']}: its back is {-zb:.2f} behind the wall — move it forward (baseY larger) or make it smaller")
    return np.array([xc - Wd / 2, 0.0, zb]), np.array([xc + Wd / 2, H, zf])


# ── Rendering helpers ───────────────────────────────────────────────────────────────────────────────────────────
def grid(dpi, y0=0.0, y1=H_IN, ss=1):
    w = round(W_IN * dpi) * ss
    n = round((y1 - y0) * dpi) * ss
    xs = (np.arange(w) + 0.5) / (dpi * ss)
    ys = y0 + (np.arange(n) + 0.5) / (dpi * ss)
    return np.meshgrid(xs, ys)


def world(X, Y):
    """Screen → world. Wall (z = 0) above the floor line, floor (h = 0) below it."""
    wall = Y < FY
    yy = np.where(wall, FY + 1e-3, Y)
    z = np.where(wall, 0.0, floor_z(yy))
    xw = VX + (X - VX) * (ZC - z) / ZC
    hw = np.where(wall, FY - Y, 0.0)
    return wall, xw, hw, z


def soft_noise(shape, cell, rng):
    """Smooth value noise with features about `cell` pixels wide, unit std."""
    small = rng.normal(size=(shape[0] // cell + 3, shape[1] // cell + 3))
    big = ndimage.zoom(small, cell, order=3)[:shape[0], :shape[1]]
    return (big - big.mean()) / big.std()


def oak(dpi, ss=3):
    """Wide plain-sawn oak planks, parallel to the wall, seen from the room's low camera.

    Each board has its own tone and its own growth-ring figure: the cut plane meets the tree's rings at a slant,
    which draws the nested arches ("cathedrals") of plain-sawn oak; open pores add fine streaks along the grain.
    Rows have butt joints at random places. Everything is computed in floor coordinates and supersampled, and the
    ring figure fades out where it would be finer than a pixel (it averages into the board's tone, as in a photo).
    """
    y0 = np.floor(FY * dpi) / dpi
    X, Y = grid(dpi, y0, H_IN, ss)
    Y = np.maximum(Y, FY + 1e-4)
    z = floor_z(Y)
    xw = VX + (X - VX) * (ZC - z) / ZC
    P = ROOM['floor']['plank']
    rng = np.random.default_rng(1955)

    row = np.floor(z / P).astype(int)
    v = z - row * P                                         # across the board, 0..P
    NR = 8
    L = rng.uniform(13, 22, NR)                             # board length per row (≈1.2–2 m)
    off = rng.uniform(0, 22, NR)
    seg = np.floor((xw + off[row]) / L[row]).astype(int)
    bid = row * 40 + np.clip(seg + 10, 0, 39)
    NB = NR * 40
    tone = 1 + 0.032 * rng.standard_normal(NB)
    warm = 0.014 * rng.standard_normal(NB)
    vc = rng.uniform(-0.4, P + 0.4, NB)                     # where the pith runs, across the board
    tilt = rng.choice([-1, 1], NB) * rng.uniform(0.015, 0.055, NB)  # the tree's taper: closes the rings into arches
    d0 = 0.35 + 14 * np.abs(tilt) + rng.uniform(0, 0.6, NB)  # distance of the cut from the pith (never through it)
    u0 = rng.uniform(0, 14, NB)
    sp = rng.uniform(0.16, 0.28, NB)                        # visible figure spacing (world units; 1 unit ≈ 90 mm)
    fig = rng.uniform(0.5, 1.2, NB)
    rift = rng.uniform(0, 1, NB) < 0.3                      # some boards are rift-sawn: straight, even grain

    # slow waviness of the rings, sampled in board coordinates
    nz = ndimage.gaussian_filter(rng.standard_normal((256, 1024)), (6, 30), mode='wrap')
    nz /= nz.std()
    wv = ndimage.map_coordinates(nz, [((v * 20 + bid * 31) % 256).ravel(), ((xw * 14 + bid * 97) % 1024).ravel()], order=1, mode='wrap').reshape(X.shape)
    d = d0[bid] + tilt[bid] * (xw - u0[bid])
    R = np.where(rift[bid], np.abs(v - vc[bid]) + 2.0, np.sqrt((v - vc[bid]) ** 2 + d ** 2))
    wv2 = ndimage.map_coordinates(nz, [((v * 45 + bid * 19) % 256).ravel(), ((xw * 60 + bid * 41) % 1024).ravel()], order=1, mode='wrap').reshape(X.shape)
    phase = (R + 0.16 * wv + 0.035 * wv2) / sp[bid]
    # level of detail: figure lines per final pixel; fade before they alias
    gy, gx = np.gradient(phase)
    freq = np.hypot(gx, gy) * ss
    fade = np.clip((0.55 - freq) / 0.25, 0, 1)
    ring = phase - np.floor(phase)
    prof = np.exp(-((ring - 0.8) / 0.09) ** 2) - 0.225     # a thin darker line in each band, soft on both sides
    # a finer ring set between them, only where the camera is close enough to see it
    ph2 = phase * 3.1 + 0.6 * wv2
    g2 = np.clip((0.5 - freq * 3.1) / 0.25, 0, 1)
    r2 = ph2 - np.floor(ph2)
    prof2 = (r2 ** 3 - 0.25) * g2
    figure = -fig[bid] * (0.10 * prof * fade + 0.012 * prof2)

    # pores: fine streaks along the grain that come and go along the board
    pt = ndimage.gaussian_filter(rng.standard_normal((512, 4096)), (0.7, 10), mode='wrap')
    pt /= pt.std()
    pores = ndimage.map_coordinates(pt, [((v * 150 + bid * 53) % 512).ravel(), ((xw * 160 + bid * 211) % 4096).ravel()], order=1, mode='wrap').reshape(X.shape)
    come = np.clip(0.6 + 0.6 * ndimage.map_coordinates(nz, [((v * 9 + bid * 17) % 256).ravel(), ((xw * 40 + bid * 3) % 1024).ravel()], order=1, mode='wrap').reshape(X.shape), 0, 1.4)
    pfade = np.clip((0.9 - np.abs(np.gradient(v * 150, axis=0)) * ss) / 0.5, 0.2, 1)
    pores = pores * come * pfade
    # mineral streaks / colour drift along a board
    drift = ndimage.map_coordinates(nz, [((v * 3 + bid * 7) % 256).ravel(), ((xw * 2 + bid * 13) % 1024).ravel()], order=1, mode='wrap').reshape(X.shape)

    lum = tone[bid] * (1 + figure + 0.008 * pores + 0.014 * drift)
    base = rgb(COL['floor'])
    img = base * lum[..., None]
    # late wood is warmer as it darkens; each board leans a little warm or cool
    # (figure < 0 in the dark bands: red drops less, blue more)
    img[..., 0] *= 1 + warm[bid] - 0.3 * figure
    img[..., 2] *= 1 - warm[bid] + 0.4 * figure

    # butt joints: a hairline gap where two boards meet in a row
    left = seg * L[row] - off[row]
    dist = np.minimum(xw - left, left + L[row] - xw)
    dpx = dist * ZC / (ZC - z) * dpi * ss
    img *= np.where(dpx < 0.9 * ss, 0.80, 1.0)[..., None]
    img *= np.where((dpx >= 0.9 * ss) & (dpx < 2.2 * ss) & (xw - left < left + L[row] - xw), 1.02, 1.0)[..., None]

    # gentle depth: the far boards catch the wall's light, the near ones fall off; side walls darken the corners
    t = np.clip((Y - FY) / (H_IN - FY), 0, 1)
    img *= (1.012 - 0.05 * t ** 1.4)[..., None]
    img *= (1 - 0.06 * ((X - W_IN / 2) / (W_IN / 2)) ** 2 * t)[..., None]
    img *= (1 - 0.13 * np.exp(-np.clip(Y - FY, 0, None) / 0.06))[..., None]  # contact with the baseboard

    n, w = X.shape[0] // ss, X.shape[1] // ss
    img = img.reshape(n, ss, w, ss, 3).mean((1, 3))
    return int(round(y0 * dpi)), img


def background(dpi=200):
    X, Y = grid(dpi)
    shape = X.shape
    rng = np.random.default_rng(1982)
    fine = ndimage.gaussian_filter(rng.normal(size=shape), 0.6)
    fine /= fine.std()

    # Wall: hand-trowelled plaster (two scales of soft unevenness), a little darker towards the ceiling,
    # ambient occlusion into the floor corner, gentle darkening towards the side walls.
    plaster = 0.65 * soft_noise(shape, 90, rng) + 0.35 * soft_noise(shape, 22, rng)
    w = (1 + 0.005 * fine + 0.007 * plaster)
    w *= 1 - 0.045 * np.clip(1 - Y / FY, 0, 1) ** 1.6
    w *= 1 - 0.06 * np.exp(-np.clip(FY - Y, 0, None) / 0.12)
    w *= 1 - 0.035 * ((X - W_IN / 2) / (W_IN / 2)) ** 2
    img = rgb(COL['wall']) * w[..., None]

    r0, fl = oak(dpi)
    floor = Y >= FY
    full = img.copy()
    full[r0:r0 + fl.shape[0]] = fl[:shape[0] - r0]
    img = np.where(floor[..., None], full, img)

    # Plank seams: a fine dark gap, the lip below it catching a little light.
    px = 1.0 / dpi
    plank = ROOM['floor']['plank']
    for n in range(1, 6):
        ys = floor_y(n * plank)
        if ys > H_IN:
            break
        d = np.abs(Y - ys)
        img *= np.where((d < 0.7 * px)[..., None], 0.86, 1.0)
        img *= np.where(((Y - ys > 0.7 * px) & (Y - ys < 1.7 * px))[..., None], 1.025, 1.0)
    # Baseboard: painted trim, top edge catching the light.
    top = FY - ROOM['baseboard']
    trim = (Y >= top) & (Y < FY)
    img = np.where(trim[..., None], rgb(COL['trim']) * (1 + 0.004 * fine)[..., None] * (1 - 0.03 * ((X - W_IN / 2) / (W_IN / 2)) ** 2)[..., None], img)
    img = np.where(((Y >= top) & (Y < top + 1.5 * px))[..., None], rgb('FCFAF5'), img)
    img = np.where(((Y >= top - 1.2 * px) & (Y < top))[..., None], img * 0.965, img)

    out = os.path.join(HERE, 'assets', 'room.jpg')
    Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)).save(out, quality=93)
    return out


def window_lit(P, d, sun):
    """For world points P (3 arrays), whether the ray towards the sun leaves through the window's glass."""
    x, h, z = P
    dx, dh, dz = d
    t = (x - sun['XL']) / dx
    zw, hw = z - dz * t, h - dh * t
    win = sun['window']
    ok = (t > 0) & (zw >= win['z'][0]) & (zw <= win['z'][1]) & (hw >= win['h'][0]) & (hw <= win['h'][1])
    for a, b in win.get('mullions', []):
        ok &= ~((zw >= a) & (zw <= b))
    for a, b in win.get('transoms', []):
        ok &= ~((hw >= a) & (hw <= b))
    return ok, t


def blocked_by(P, d, tmax, lo, hi):
    tn = np.full(P[0].shape, -np.inf)
    tx = np.full(P[0].shape, np.inf)
    for a in range(3):
        da = -d[a]
        if abs(da) < 1e-12:
            inside = (P[a] >= lo[a]) & (P[a] <= hi[a])
            tn = np.where(inside, tn, np.inf)
            continue
        t1 = (lo[a] - P[a]) / da
        t2 = (hi[a] - P[a]) / da
        tn = np.maximum(tn, np.minimum(t1, t2))
        tx = np.minimum(tx, np.maximum(t1, t2))
    return (tx >= np.maximum(tn, 1e-6)) & (tn < tmax)


def contact(boxes, wall, xw, z, strength=1.0):
    """Ambient occlusion around each object's footprint on the floor."""
    ao = np.zeros_like(xw)
    for lo, hi in boxes:
        dxo = np.maximum(np.maximum(lo[0] - xw, xw - hi[0]), 0)
        dzo = np.maximum(np.maximum(lo[2] - z, z - hi[2]), 0)
        dist = np.hypot(dxo, dzo)
        ao = np.maximum(ao, np.where(wall, 0, strength * (0.42 * np.exp(-dist / 0.10) + 0.10 * np.exp(-dist / 0.6))))
    return ao


def load_page(pid):
    path = os.path.join(HERE, 'rooms', f'{pid}.json')
    if not os.path.exists(path):
        sys.exit(f'✗ rooms/{pid}.json not found')
    return json.load(open(path))


def sunlight(pid, dpi=150):
    page = load_page(pid)
    sun = resolve(page.get('sun'))
    objs, boxes = [], []   # one entry per box; a leaning board ("lean": n) contributes n boxes, all pointing at it
    for o in page.get('objects', []):
        if not o.get('shadow', True):
            continue
        for b in (lean_boxes(o)[0] if o.get('lean') else [object_box(o)]):
            objs.append(o); boxes.append(b)
    X, Y = grid(dpi)
    wall, xw, hw, z = world(X, Y)
    lit_share = {}

    if sun.get('sky') == 'overcast':
        # No sun: the whole room in one flat, slightly cool shade; contact shadows are broader and softer.
        ao = ndimage.gaussian_filter(contact(boxes, wall, xw, z, 0.8), 0.03 * dpi)
        net = -(sun['shade'] + ao)
        tint = np.where((net <= 0)[..., None], rgb(sun['color']), rgb(sun['color']))
        alpha = np.clip(-net, 0, 1)
        rgba = np.dstack([tint, alpha[..., None] * 255]).astype(np.uint8)
        place = {'x': 0.0, 'y': 0.0, 'w': W_IN, 'h': H_IN}
    else:
        d = np.array(sun['dir'], dtype=float)
        d /= np.linalg.norm(d)
        lit, t = window_lit((xw, hw, z), d, sun)
        for lo, hi in boxes:
            lit &= ~blocked_by((xw, hw, z), d, t, lo, hi)
        done = set()
        for i, (o, (lo, hi)) in enumerate(zip(objs, boxes)):
            key = o.get('id', o.get('name', o['use']))
            if key in done:
                continue
            done.add(key)
            # how much of the object's front face is in the sun (a front in shade must be drawn darker);
            # a leaning board: its sloping face, lifted a hair off its own staircase
            if o.get('lean'):
                x0, x1, Ht, zf = lean_boxes(o)[1]
                u, v = np.meshgrid(np.linspace(x0, x1, 40), np.linspace(0.03, 0.97, 40))
                P = (u, Ht * (1 - v), zf * v + 0.03)
            else:
                fx, fh = np.meshgrid(np.linspace(lo[0], hi[0], 40), np.linspace(0.02, hi[1], 40))
                P = (fx, fh, np.full(fx.shape, hi[2]))
            face, _ = window_lit(P, d, sun)
            for j, (lo2, hi2) in enumerate(boxes):
                if objs[j] is not o:
                    face &= ~blocked_by(P, d, np.full(P[0].shape, 1e9), lo2, hi2)
            lit_share[key] = round(float(face.mean()), 3)

        # Penumbra: the sun is a disc (0.53°), so edges soften with distance; one blur per page is close enough.
        m = ndimage.gaussian_filter(lit.astype(float), sun['soft'] * dpi)
        # Lambert: a low sun lights the wall far more than the floor.
        cw, cf = abs(d[2]), abs(d[1])
        k = np.where(wall, 1.0, (cf / cw) ** 0.55)
        a_sun = sun['strength'] * m * k * (1 + 0.05 * soft_noise(X.shape, 30, np.random.default_rng(5)))  # raking light shows the plaster
        ao = ndimage.gaussian_filter(contact(boxes, wall, xw, z), 0.01 * dpi)
        # light where the sun falls; elsewhere the room's dimming (ambient) plus the contact shadows
        a_dim = sun.get('ambient', 0) * (1 - m) + ao
        net = a_sun - a_dim
        alpha = np.clip(np.abs(net), 0, 1)
        color = np.where((net >= 0)[..., None], rgb(sun['color']), rgb(COL['shade']))
        rgba = np.dstack([color, alpha[..., None] * 255]).astype(np.uint8)
        if sun.get('ambient', 0) > 0:   # the dimming covers the whole room: keep the full canvas
            y0 = x0 = 0
        else:
            nz = np.argwhere(rgba[..., 3] > 0)
            (y0, x0), (y1, x1) = nz.min(0), nz.max(0) + 1
            rgba = rgba[y0:y1, x0:x1]
        y1, x1 = y0 + rgba.shape[0], x0 + rgba.shape[1]
        place = {'x': round(float(x0) / dpi, 4), 'y': round(float(y0) / dpi, 4), 'w': round(float(x1 - x0) / dpi, 4), 'h': round(float(y1 - y0) / dpi, 4)}

    os.makedirs(os.path.join(HERE, 'assets', 'sun'), exist_ok=True)
    png = os.path.join(HERE, 'assets', 'sun', f'{pid}.png')
    Image.fromarray(rgba, 'RGBA').save(png, optimize=True)
    info = {**place, 'sun': {k: v for k, v in sun.items() if k != 'XL'}, 'lit': lit_share}
    json.dump(info, open(os.path.join(HERE, 'assets', 'sun', f'{pid}.json'), 'w'), indent=2)
    for name, share in lit_share.items():
        if share < 0.98:
            print(f'  · {pid}: {name} front face {share:.0%} in the sun')
    return png, place, rgba, page, boxes


def preview(out_dir, pid, place, rgba, page, boxes, dpi=150):
    os.makedirs(out_dir, exist_ok=True)
    base = Image.open(os.path.join(HERE, 'assets', 'room.jpg')).convert('RGBA').resize((round(W_IN * dpi), round(H_IN * dpi)))
    layer = Image.new('RGBA', base.size, (0, 0, 0, 0))
    layer.paste(Image.fromarray(rgba, 'RGBA'), (round(place['x'] * dpi), round(place['y'] * dpi)))
    comp = Image.alpha_composite(base, layer)
    dr = ImageDraw.Draw(comp)
    for o in page.get('objects', []):
        real = real_size(o['use'])
        w = o['h'] * real['w'] / real['h']
        dr.rectangle([(o['cx'] - w / 2) * dpi, (o['baseY'] - o['h']) * dpi, (o['cx'] + w / 2) * dpi, o['baseY'] * dpi], outline=(60, 50, 40, 255), width=2)
    comp.convert('RGB').save(os.path.join(out_dir, f'preview-{pid}.png'))


def main():
    args = [a for a in sys.argv[1:]]
    if '--times' in args:
        for t in [6.5, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 16.5, 17, 17.3, 18, 18.2, 18.6, 19]:
            p = sun_at(t)
            print(f"{t:5.1f}  r={p['r']:.2f}  s={p['s']:.2f}  strength={p['strength']:.2f}  soft={p['soft']:.3f}  ambient={p['ambient']:.2f}  color={p['color']}")
        return
    prev = None
    if '--preview' in args:
        i = args.index('--preview')
        prev = args[i + 1]
        del args[i:i + 2]
    force_room = '--room' in args
    pids = [a for a in args if not a.startswith('--')]
    if not pids:
        pids = sorted(f[:-5] for f in os.listdir(os.path.join(HERE, 'rooms')) if f.endswith('.json'))
    os.makedirs(os.path.join(HERE, 'assets'), exist_ok=True)
    if force_room or not os.path.exists(os.path.join(HERE, 'assets', 'room.jpg')):
        print('✓', os.path.relpath(background(), HERE))
    for pid in pids:
        png, place, rgba, page, boxes = sunlight(pid)
        print('✓', os.path.relpath(png, HERE), place)
        if prev:
            preview(prev, pid, place, rgba, page, boxes)


if __name__ == '__main__':
    main()
