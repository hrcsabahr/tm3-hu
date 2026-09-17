# -*- coding: utf-8 -*-
"""Generate assets/img/og-image.png (1200x630) mirroring og-image.svg."""
from PIL import Image, ImageDraw, ImageFont

W, H = 1200, 630

# Light gradient background #FAFAF7 -> #F4F3EF
img = Image.new("RGB", (W, H))
px = img.load()
top = (250, 250, 247)   # FAFAF7
bot = (244, 243, 239)   # F4F3EF
for y in range(H):
    t = y / (H - 1)
    r = round(top[0] + (bot[0] - top[0]) * t)
    g = round(top[1] + (bot[1] - top[1]) * t)
    b = round(top[2] + (bot[2] - top[2]) * t)
    for x in range(W):
        px[x, y] = (r, g, b)

d = ImageDraw.Draw(img)

# Blue accent gradient #0075DE -> #22D3EE (horizontal)
A0 = (0, 117, 222)      # 0075DE
A1 = (34, 211, 238)     # 22D3EE

def hgradient(x, x0, x1):
    t = (x - x0) / max(1, (x1 - x0))
    t = max(0.0, min(1.0, t))
    return tuple(round(A0[i] + (A1[i] - A0[i]) * t) for i in range(3))

def rounded_rect(draw, box, radius, fill):
    draw.rounded_rectangle(box, radius=radius, fill=fill)

def gradient_rounded_rect(draw, box, radius):
    x0, y0, x1, y1 = box
    # draw column by column with rounded corners using a mask approach:
    # simpler: draw gradient rect then round corners via rounded_rectangle mask
    from PIL import Image as _I
    grad = _I.new("RGB", (x1 - x0, y1 - y0))
    gp = grad.load()
    for xx in range(x1 - x0):
        c = hgradient(xx + x0, x0, x1)
        for yy in range(y1 - y0):
            gp[xx, yy] = c
    mask = _I.new("L", (x1 - x0, y1 - y0), 0)
    md = ImageDraw.Draw(mask)
    md.rounded_rectangle([0, 0, x1 - x0 - 1, y1 - y0 - 1], radius=radius, fill=255)
    draw._image.paste(grad, (x0, y0), mask)

# Fonts
F = "C:/Windows/Fonts/"
sans = ImageFont.truetype(F + "segoeui.ttf", 40)
sans_semibold = ImageFont.truetype(F + "segoeuib.ttf", 40)
serif = ImageFont.truetype(F + "georgia.ttf", 80)
serif_italic = ImageFont.truetype(F + "georgiai.ttf", 80)
sub = ImageFont.truetype(F + "segoeui.ttf", 22)

# Logo mark: rounded rect 80x80 at (80,80) with blue gradient + "M3"
gradient_rounded_rect(d, [80, 80, 160, 160], 18)
m3 = ImageFont.truetype(F + "segoeuib.ttf", 44)
d.text((120, 118), "M3", font=m3, fill=(255, 255, 255), anchor="mm")

# Brand "tm3.hu"
d.text((180, 120), "tm3.hu", font=sans_semibold, fill=(26, 26, 26), anchor="lm")

# Accent bar 120x6 at (80,240)
gradient_rounded_rect(d, [80, 237, 200, 243], 3)

# Headline
d.text((80, 300), "Tesla Model 3", font=serif, fill=(26, 26, 26), anchor="la")
d.text((80, 392), "minden, amit tudni", font=serif, fill=(26, 26, 26), anchor="la")
d.text((80, 484), "érdemes.", font=serif_italic, fill=(0, 117, 222), anchor="la")

# Subtitle
d.text((80, 565), "Magyar tudásbázis · Kalkulátorok · Szervizek · Töltők",
       font=sub, fill=(82, 82, 82), anchor="ls")

out = "assets/img/og-image.png"
img.save(out, "PNG", optimize=True)
print("wrote", out)
