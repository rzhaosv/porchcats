"""Compose 1290x2796 App Store screenshots: caption band on paper, device capture below with rounded corners.
Run after store/shots.js: python3 store/compose.py"""
import json, os
from PIL import Image, ImageDraw, ImageFont, ImageFilter
HERE = os.path.dirname(__file__)
RAW = os.path.join(HERE, 'raw'); OUT = os.path.join(HERE, 'screenshots'); os.makedirs(OUT, exist_ok=True)
W, H = 1290, 2796
BG = (255, 246, 233); INK = (28, 26, 23); ACCENT = (229, 138, 60)
def font(size, bold=False):
    for p in ['/System/Library/Fonts/Supplemental/Georgia Bold.ttf' if bold else '/System/Library/Fonts/Supplemental/Georgia.ttf', '/System/Library/Fonts/Georgia.ttf']:
        if os.path.exists(p): return ImageFont.truetype(p, size)
    return ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', size)
def rounded(im, r):
    m = Image.new('L', im.size, 0); ImageDraw.Draw(m).rounded_rectangle([0, 0, im.size[0]-1, im.size[1]-1], r, fill=255)
    out = im.copy(); out.putalpha(m); return out
for n, cap in json.load(open(os.path.join(HERE, 'captions.json'))):
    src = Image.open(os.path.join(RAW, f'{n}.png')).convert('RGB')
    canvas = Image.new('RGB', (W, H), BG); d = ImageDraw.Draw(canvas)
    f = font(74, bold=True); y = 150
    for line in cap.split('\n'):
        w = d.textlength(line, font=f); d.text(((W - w) / 2, y), line, font=f, fill=INK); y += 92
    d.rounded_rectangle([W/2-60, y+24, W/2+60, y+36], 6, fill=ACCENT)
    # device capture: scale to 1130 wide, place below band
    tw = 1130; th = int(src.size[1] * tw / src.size[0]); dev = src.resize((tw, th), Image.LANCZOS)
    top = y + 90
    shadow = Image.new('RGBA', (W, H), (0, 0, 0, 0)); sd = ImageDraw.Draw(shadow)
    sd.rounded_rectangle([(W-tw)/2+10, top+30, (W+tw)/2+10, top+th+30], 70, fill=(28, 26, 23, 70)); shadow = shadow.filter(ImageFilter.GaussianBlur(40))
    canvas.paste(shadow, (0, 0), shadow)
    canvas.paste(rounded(dev, 70), (int((W-tw)/2), top), rounded(dev, 70))
    canvas.save(os.path.join(OUT, f'{n}.png')); print('composed', n)
