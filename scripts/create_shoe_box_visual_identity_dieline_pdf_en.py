from collections import deque
from pathlib import Path

from PIL import Image
from PIL import ImageDraw, ImageFont
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor, Color, white, black
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.utils import ImageReader
import qrcode

import arabic_reshaper
from bidi.algorithm import get_display


ROOT = Path(__file__).resolve().parents[1]
ASSET = ROOT / "output" / "branch_identity"
OUT = ROOT / "output" / "pdf" / "IN_OUT_Laundry_Shoe_Box_Visual_Identity_Dieline_V2_EN.pdf"

PRIMARY_LOGO = ASSET / "00-primary-logo-royal-purple.png"
LOGO_TRANSPARENT = ASSET / "00-primary-logo-royal-purple-transparent.png"
LOGO_LIGHT = ASSET / "00-primary-logo-royal-light-transparent.png"
CONTACT_QR = ASSET / "shoe-box-contact-link-qr.png"
BRAND_TEXT_DARK = ASSET / "shoe-box-brand-name-purple.png"
BRAND_TEXT_LIGHT = ASSET / "shoe-box-brand-name-white.png"

PAGE_W = 545.51 * mm
PAGE_H = 387.72 * mm

PURPLE = HexColor("#8F00FF")
PLUM = HexColor("#21002F")
VIOLET = HexColor("#C026D3")
SILVER = HexColor("#B9BDC7")
PALE = HexColor("#FBF7FF")
WARM_WHITE = HexColor("#FCFAFF")
OFF_WHITE = HexColor("#F5F2F8")
PAPER_SIDE = HexColor("#ECE8F0")
INK = HexColor("#211827")
MUTED = HexColor("#6E6474")
CUT = HexColor("#E11D48")
FOLD = HexColor("#2563EB")
SAFE = HexColor("#22A06B")

BRAND_EN = "IN & OUT LAUNDRY"
BRAND_AR = "مصبغة ان اند اوت"
BRAND_COMBINED = "مصبغة ان اند اوت  In & Out Laundry"
SOCIAL = "@inandoutuae"
WEBSITE = "inandoutuae.com"
PHONE_1 = "025864164"
PHONE_2 = "025555929"
MOBILE = "0541555502"
TOP_CONTACT_LINE = f"{SOCIAL} - {PHONE_2} - {MOBILE}"
SIDE_CONTACT_LINE = f"{SOCIAL}  |  {WEBSITE}  |  {PHONE_1}  |  {PHONE_2}  |  {MOBILE}"
QR_LINK = "https://l.instagram.com/?u=https%3A%2F%2Freach.link%2Finandout%3Futm_source%3Dig%26utm_medium%3Dsocial%26utm_content%3Dlink_in_bio%26fbclid%3DPAZXh0bgNhZW0CMTEAc3J0YwZhcHBfaWQPOTM2NjE5NzQzMzkyNDU5AAGnhITHi5J_DoXw0OJTKvos8ayDnpI5KU5Glf0wwdHSPZdl22--cLo5TdAVa8I_aem_JSgX9VZpR7R2JqXMr_SpOw&e=AUBUKLs4Gm53Z8Pk4QX8KsEvPgrHZAUpBD9itHTgS7ptuVYmZwT4QlI6wRe3oDS3POigVYoSW-wHVYsKsJEyGj0yi0nYZyi0_7PfNGKs4YiI8d68my6EJVfW4WwFq8TRIBkjMnA"


def register_fonts():
    fonts = [
        ("Cairo", r"C:\Windows\Fonts\Cairo-Regular.ttf"),
        ("CairoSemi", r"C:\Windows\Fonts\Cairo-SemiBold.ttf"),
        ("CairoBold", r"C:\Windows\Fonts\Cairo-Bold.ttf"),
    ]
    for name, path in fonts:
        try:
            pdfmetrics.registerFont(TTFont(name, path))
        except Exception:
            pass


def flood_transparent_logo():
    """Create transparent logo assets from the visual-identity logo.

    The source logo is preserved for the white option. The dark option keeps
    the circular mark but converts dark lettering to white for contrast.
    """
    ASSET.mkdir(parents=True, exist_ok=True)
    source = Image.open(PRIMARY_LOGO).convert("RGBA")
    w, h = source.size

    def make_transparent(im):
        px = im.load()
        visited = set()
        q = deque()

        def is_white(p):
            r, g, b, a = p
            return a > 0 and r > 238 and g > 238 and b > 238

        for x in range(w):
            for y in (0, h - 1):
                if is_white(px[x, y]):
                    q.append((x, y))
                    visited.add((x, y))
        for y in range(h):
            for x in (0, w - 1):
                if is_white(px[x, y]) and (x, y) not in visited:
                    q.append((x, y))
                    visited.add((x, y))
        while q:
            x, y = q.popleft()
            for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                if 0 <= nx < w and 0 <= ny < h and (nx, ny) not in visited and is_white(px[nx, ny]):
                    visited.add((nx, ny))
                    q.append((nx, ny))
        for x, y in visited:
            px[x, y] = (255, 255, 255, 0)
        return im

    transparent = make_transparent(source.copy())
    transparent.save(LOGO_TRANSPARENT)

    light = transparent.copy()
    px = light.load()
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a == 0:
                continue
            # Purple accent remains purple. Dark plum and grey become white/silver.
            if b > 130 and r > 90 and g < 100:
                px[x, y] = (143, 0, 255, a)
            elif r > 145 and g > 145 and b > 145:
                px[x, y] = (220, 223, 232, a)
            else:
                px[x, y] = (255, 255, 255, a)
    light.save(LOGO_LIGHT)


def generate_contact_qr():
    ASSET.mkdir(parents=True, exist_ok=True)
    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=3,
    )
    qr.add_data(QR_LINK)
    qr.make(fit=True)
    im = qr.make_image(fill_color="#21002F", back_color="white").convert("RGBA")
    im.save(CONTACT_QR)


def generate_brand_text_assets():
    ASSET.mkdir(parents=True, exist_ok=True)
    ar_font = ImageFont.truetype(r"C:\Windows\Fonts\arialbd.ttf", 96)
    en_font = ImageFont.truetype(r"C:\Windows\Fonts\Cairo-Bold.ttf", 70)

    def make(path, main, sub):
        im = Image.new("RGBA", (1400, 360), (255, 255, 255, 0))
        d = ImageDraw.Draw(im)
        ar = rtl(BRAND_AR)
        en = "In & Out Laundry"
        ar_box = d.textbbox((0, 0), ar, font=ar_font)
        en_box = d.textbbox((0, 0), en, font=en_font)
        ar_w = ar_box[2] - ar_box[0]
        en_w = en_box[2] - en_box[0]
        d.text(((1400 - ar_w) / 2, 44), ar, font=ar_font, fill=main)
        d.text(((1400 - en_w) / 2, 150), en, font=en_font, fill=sub)
        im.save(path)

    make(BRAND_TEXT_DARK, (33, 0, 47, 255), (33, 0, 47, 255))
    make(BRAND_TEXT_LIGHT, (255, 255, 255, 255), (238, 232, 247, 255))


def text(c, s, x, y, size=8, color=INK, font="Cairo"):
    c.setFont(font, size)
    c.setFillColor(color)
    c.drawString(x, y, s)


def rtl(s):
    return get_display(arabic_reshaper.reshape(s))


def centered(c, s, x, y, size=8, color=INK, font="Cairo"):
    c.setFont(font, size)
    c.setFillColor(color)
    c.drawCentredString(x, y, s)


def centered_ar(c, s, x, y, size=8, color=INK, font="Cairo"):
    centered(c, rtl(s), x, y, size, color, font)


def draw_logo(c, path, x, y, w, h):
    im = Image.open(path)
    c.drawImage(ImageReader(im), x, y, w, h, preserveAspectRatio=True, anchor="c", mask="auto")


def brand_under_logo(c, cx, y, max_w, royal=False, scale=1.0):
    color_main = white if royal else PLUM
    color_sub = HexColor("#DDE1EA") if royal else MUTED
    centered(c, BRAND_EN, cx, y, 6.4 * scale, color_main, "CairoBold")
    centered_ar(c, BRAND_AR, cx, y - 5.2 * mm * scale, 5.7 * scale, color_sub, "CairoSemi")


def brand_combined_line(c, cx, y, royal=False, size=8.2):
    asset = BRAND_TEXT_LIGHT if royal else BRAND_TEXT_DARK
    w = 98 * mm * (size / 13.0)
    h = 25 * mm * (size / 13.0)
    draw_logo(c, asset, cx - w / 2, y - h / 2, w, h)


def contact_strip(c, x, y, w, h, royal=False, line=None):
    line = line or TOP_CONTACT_LINE
    c.saveState()
    if royal:
        c.setFillColor(Color(255 / 255, 255 / 255, 255 / 255, 0.10))
        stroke = Color(255 / 255, 255 / 255, 255 / 255, 0.22)
        txt = white
    else:
        c.setFillColor(Color(143 / 255, 0, 255 / 255, 0.08))
        stroke = Color(143 / 255, 0, 255 / 255, 0.20)
        txt = PLUM
    c.roundRect(x, y, w, h, h / 2, fill=1, stroke=0)
    c.setStrokeColor(stroke)
    c.roundRect(x, y, w, h, h / 2, fill=0, stroke=1)
    size = 4.55
    while pdfmetrics.stringWidth(line, "CairoSemi", size) > w - 6 * mm and size > 2.6:
        size -= 0.15
    centered(c, line, x + w / 2, y + h / 2 - 1.25 * mm, size, txt, "CairoSemi")
    c.restoreState()


def draw_right_side_contact_card(c, x, y, w, h, logo_path, royal=False):
    card_bg = Color(1, 1, 1, 0.94) if royal else white
    border = Color(143 / 255, 0, 255 / 255, 0.25)
    c.saveState()
    c.setFillColor(card_bg)
    c.roundRect(x, y, w, h, 3 * mm, fill=1, stroke=0)
    c.setStrokeColor(border)
    c.roundRect(x, y, w, h, 3 * mm, fill=0, stroke=1)
    draw_logo(c, logo_path, x + w * 0.22, y + h - 25 * mm, w * 0.56, 22 * mm)
    centered_ar(c, BRAND_AR, x + w / 2, y + h - 29 * mm, 4.8, PLUM, "CairoBold")
    centered(c, "In & Out Laundry", x + w / 2, y + h - 35 * mm, 4.8, PLUM, "CairoBold")
    contact_rows = [SOCIAL, WEBSITE, PHONE_1, PHONE_2, MOBILE]
    yy = y + h - 43 * mm
    for row in contact_rows:
        centered(c, row, x + w / 2, yy, 4.25, INK, "CairoSemi")
        yy -= 4.9 * mm
    qr_size = min(w * 0.55, 23 * mm, h * 0.30)
    draw_logo(c, CONTACT_QR, x + (w - qr_size) / 2, y + 4.5 * mm, qr_size, qr_size)
    centered(c, "SCAN", x + w / 2, y + qr_size + 6 * mm, 4.2, PLUM, "CairoBold")
    c.restoreState()


def panel(c, x, y, w, h, fill, radius=0, cut=True):
    c.setFillColor(fill)
    c.setStrokeColor(Color(0, 0, 0, 0.20))
    c.setLineWidth(0.6)
    if radius:
        c.roundRect(x, y, w, h, radius, fill=1, stroke=1)
    else:
        c.rect(x, y, w, h, fill=1, stroke=1)
    if cut:
        c.setStrokeColor(CUT)
        c.setLineWidth(0.55)
        c.rect(x, y, w, h, fill=0, stroke=1)


def fold_line(c, x1, y1, x2, y2):
    c.saveState()
    c.setStrokeColor(FOLD)
    c.setLineWidth(0.55)
    c.setDash(4, 3)
    c.line(x1, y1, x2, y2)
    c.restoreState()


def draw_wave_lines(c, x, y, w, h, color=PURPLE, alpha=0.34):
    c.saveState()
    c.setStrokeColor(Color(color.red, color.green, color.blue, alpha))
    c.setLineWidth(0.55)
    for i in range(16):
        yy = y + h * (0.10 + i * 0.045)
        p = c.beginPath()
        p.moveTo(x, yy)
        p.curveTo(x + w * 0.24, yy + h * 0.23, x + w * 0.55, yy - h * 0.18, x + w, yy + h * 0.10)
        c.drawPath(p, stroke=1, fill=0)
    c.restoreState()


def draw_wave_band(c, x, y, w, h, royal=False):
    c.saveState()
    c.setFillColor(Color(PURPLE.red, PURPLE.green, PURPLE.blue, 0.15 if not royal else 0.28))
    p = c.beginPath()
    p.moveTo(x, y + h * 0.18)
    p.curveTo(x + w * 0.25, y + h * 0.48, x + w * 0.55, y - h * 0.02, x + w, y + h * 0.28)
    p.lineTo(x + w, y)
    p.lineTo(x, y)
    p.close()
    c.drawPath(p, fill=1, stroke=0)
    draw_wave_lines(c, x, y + h * 0.08, w, h * 0.62, PURPLE if not royal else VIOLET, 0.32 if not royal else 0.44)
    c.restoreState()


def draw_barcode(c, x, y, w, h):
    c.setFillColor(white)
    c.rect(x, y, w, h, fill=1, stroke=0)
    c.setFillColor(black)
    pattern = [1, 2, 1, 3, 2, 1, 4, 1, 2, 3, 1, 1, 2, 4, 1, 2, 2, 1, 3, 1, 4, 2]
    pos = x + 1.2 * mm
    i = 0
    while pos < x + w - 1.8 * mm:
        bw = pattern[i % len(pattern)] * 0.32 * mm
        c.rect(pos, y + 1 * mm, bw, h - 2 * mm, fill=1, stroke=0)
        pos += bw + (0.42 if i % 3 else 0.75) * mm
        i += 1


def draw_qr(c, x, y, s):
    c.setStrokeColor(black)
    c.setFillColor(black)
    cell = s / 7
    pattern = [
        "1110111",
        "1010101",
        "1111101",
        "0010000",
        "1110111",
        "1000101",
        "1110111",
    ]
    c.setFillColor(white)
    c.rect(x, y, s, s, fill=1, stroke=0)
    c.setFillColor(black)
    for row, line in enumerate(pattern):
        for col, bit in enumerate(line):
            if bit == "1":
                c.rect(x + col * cell, y + (6 - row) * cell, cell * 0.82, cell * 0.82, fill=1, stroke=0)


def draw_label(c, x, y, w, h):
    c.setFillColor(white)
    c.roundRect(x, y, w, h, 2.4 * mm, fill=1, stroke=0)
    c.setStrokeColor(Color(0, 0, 0, 0.18))
    c.roundRect(x, y, w, h, 2.4 * mm, fill=0, stroke=1)
    rows = [
        ("ORDER", "100568"),
        ("CUSTOMER", "John Smith"),
        ("SHOES QTY", "1 PAIR"),
        ("SERVICE", "Shoe Cleaning"),
        ("SHELF", "A-03"),
        ("DATE", "18 MAY 2025"),
    ]
    yy = y + h - 8 * mm
    for k, v in rows:
        text(c, k, x + 5 * mm, yy, 4.9, INK, "CairoBold")
        text(c, ":", x + 22 * mm, yy, 4.9, INK, "CairoSemi")
        text(c, v, x + 26 * mm, yy, 5.2 if k == "SHOES QTY" else 4.9, PLUM if k == "SHOES QTY" else INK, "CairoBold" if k == "SHOES QTY" else "Cairo")
        yy -= 6.1 * mm
    c.setStrokeColor(PURPLE)
    c.line(x + 5 * mm, y + 18 * mm, x + w - 5 * mm, y + 18 * mm)
    draw_barcode(c, x + 5 * mm, y + 4 * mm, w - 24 * mm, 11 * mm)
    draw_qr(c, x + w - 17 * mm, y + 4.5 * mm, 12 * mm)


def draw_dimensions(c, x1, y1, x2, y2, label, offset=0):
    c.setStrokeColor(MUTED)
    c.setLineWidth(0.45)
    if abs(y1 - y2) < 1:
        y = y1 + offset
        c.line(x1, y, x2, y)
        c.line(x1, y - 2 * mm, x1, y + 2 * mm)
        c.line(x2, y - 2 * mm, x2, y + 2 * mm)
        centered(c, label, (x1 + x2) / 2, y + 2.3 * mm, 6.1, MUTED, "CairoSemi")
    else:
        x = x1 + offset
        c.line(x, y1, x, y2)
        c.line(x - 2 * mm, y1, x + 2 * mm, y1)
        c.line(x - 2 * mm, y2, x + 2 * mm, y2)
        c.saveState()
        c.translate(x - 2.4 * mm, (y1 + y2) / 2)
        c.rotate(90)
        centered(c, label, 0, 0, 6.1, MUTED, "CairoSemi")
        c.restoreState()


def draw_header(c, title, subtitle, logo_path):
    c.setFillColor(white)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    text(c, "IN & OUT LAUNDRY", 35 * mm, PAGE_H - 28 * mm, 11, PLUM, "CairoBold")
    text(c, title, 35 * mm, PAGE_H - 44 * mm, 20, black, "CairoBold")
    text(c, subtitle, 35 * mm, PAGE_H - 55 * mm, 8.2, MUTED, "CairoSemi")
    draw_logo(c, logo_path, PAGE_W - 98 * mm, PAGE_H - 51 * mm, 56 * mm, 34 * mm)


def dieline(c, variant="white"):
    royal = variant == "royal"
    logo = LOGO_LIGHT if royal else LOGO_TRANSPARENT
    x0 = 38 * mm
    y0 = 34 * mm
    scale = 0.39

    side, flap, length, width, tuck, back = 130, 55, 340, 220, 35, 130
    s = mm * scale
    fw, sw, lw, ww, th, bh = flap * s, side * s, length * s, width * s, tuck * s, back * s

    cx = x0 + fw + sw
    base_y = y0 + th + side * s
    front_y = y0 + th
    lid_y = base_y + ww + bh
    hinge_y = base_y + ww

    body = PLUM if royal else WARM_WHITE
    side_fill = HexColor("#2B063D") if royal else PAPER_SIDE
    base_fill = HexColor("#2A043A") if royal else OFF_WHITE
    front_text = white if royal else PLUM

    # Panels.
    panel(c, cx, y0, lw, th, side_fill, radius=4 * mm)
    panel(c, cx, front_y, lw, sw, body)
    panel(c, cx, base_y, lw, ww, base_fill)
    panel(c, cx - sw, base_y, sw, ww, side_fill)
    panel(c, cx + lw, base_y, sw, ww, side_fill)
    panel(c, cx - sw - fw, base_y + ww * 0.22, fw, ww * 0.56, side_fill, radius=2 * mm)
    panel(c, cx + lw + sw, base_y + ww * 0.22, fw, ww * 0.56, side_fill, radius=2 * mm)
    panel(c, cx, hinge_y, lw, bh, side_fill)
    panel(c, cx - sw, hinge_y, sw, bh, side_fill)
    panel(c, cx + lw, hinge_y, sw, bh, side_fill)
    panel(c, cx, lid_y, lw, ww, body)
    panel(c, cx - sw, lid_y, sw, ww, side_fill)
    panel(c, cx + lw, lid_y, sw, ww, side_fill)
    panel(c, cx - sw - fw, lid_y + ww * 0.20, fw, ww * 0.60, side_fill, radius=2 * mm)
    panel(c, cx + lw + sw, lid_y + ww * 0.20, fw, ww * 0.60, side_fill, radius=2 * mm)

    # Artwork.
    draw_wave_band(c, cx, lid_y, lw, ww * 0.62, royal)
    draw_logo(c, logo, cx + lw * 0.285, lid_y + ww * 0.43, lw * 0.43, ww * 0.47)
    brand_combined_line(c, cx + lw / 2, lid_y + ww * 0.335, royal, 13.0)
    contact_strip(c, cx + lw * 0.12, lid_y + ww * 0.215, lw * 0.76, 10.4 * mm, royal, TOP_CONTACT_LINE)
    centered(c, "LID TOP ARTWORK 340 x 220", cx + lw / 2, lid_y + ww - 8 * mm, 5.8, front_text, "CairoBold")

    draw_wave_band(c, cx, front_y, lw, sw * 0.72, royal)
    draw_logo(c, logo, cx + lw * 0.39, front_y + sw * 0.35, lw * 0.22, sw * 0.42)
    brand_combined_line(c, cx + lw / 2, front_y + sw * 0.31, royal, 8.4)
    contact_strip(c, cx + lw * 0.11, front_y + 8 * mm, lw * 0.78, 8.6 * mm, royal, TOP_CONTACT_LINE)
    centered(c, "FRONT WALL 340 x 130", cx + lw / 2, front_y + sw - 8 * mm, 5.7, front_text, "CairoSemi")

    # Repeated small branding on side and hinge panels.
    draw_logo(c, logo, cx + lw * 0.44, hinge_y + bh * 0.28, lw * 0.12, bh * 0.28)
    brand_under_logo(c, cx + lw / 2, hinge_y + bh * 0.30, lw * 0.32, royal, 0.50)
    draw_right_side_contact_card(c, cx + lw + sw * 0.08, base_y + 8 * mm, sw * 0.84, ww * 0.82, LOGO_TRANSPARENT, royal)

    # Fold lines.
    for xx in [cx, cx + lw, cx - sw, cx + lw + sw]:
        fold_line(c, xx, base_y, xx, base_y + ww)
        fold_line(c, xx, lid_y, xx, lid_y + ww)
    for yy in [front_y, base_y, hinge_y, lid_y, lid_y + ww]:
        fold_line(c, cx, yy, cx + lw, yy)

    # Labels.
    small = white if royal else INK
    centered(c, "BASE PANEL 340 x 220", cx + lw / 2, base_y + ww / 2, 6.3, small, "CairoBold")
    centered(c, "BACK / HINGE WALL 340 x 130", cx + lw / 2, hinge_y + bh / 2, 5.7, small, "CairoSemi")
    centered(c, "LEFT SIDE WALL 130 x 220", cx - sw / 2, base_y + ww / 2, 5.2, small, "CairoSemi")
    centered(c, "FRONT TUCK FLAP 340 x 35", cx + lw / 2, y0 + th / 2 - 1.6 * mm, 5.2, small, "CairoSemi")
    centered(c, f"{SOCIAL} - {PHONE_2} - {MOBILE}", cx + lw / 2, y0 + th / 2 + 3.2 * mm, 5.2, small, "CairoSemi")

    # Dimensions and legend.
    draw_dimensions(c, cx, lid_y + ww, cx + lw, lid_y + ww, "340 mm", 8 * mm)
    draw_dimensions(c, cx + lw + sw, base_y, cx + lw + sw, base_y + ww, "220 mm", 10 * mm)
    draw_dimensions(c, cx + lw + sw + fw, base_y, cx + lw + sw + fw, base_y + sw, "130 mm", 8 * mm)

    lx, ly = 35 * mm, 29 * mm
    for color, label, dashed in [
        (CUT, "CUT LINE", False),
        (FOLD, "FOLD / CREASE LINE", True),
        (SAFE, "5 mm SAFE AREA", False),
        (PURPLE, "3 mm BLEED ON PRINTED FACES", False),
    ]:
        c.setStrokeColor(color)
        c.setLineWidth(1.2)
        if dashed:
            c.setDash(4, 3)
        c.line(lx, ly, lx + 13 * mm, ly)
        c.setDash()
        text(c, label, lx + 16 * mm, ly - 2.1 * mm, 6.4, INK, "CairoSemi")
        lx += 76 * mm

    return cx, y0, lw, ww, sw


def mockup(c, variant="white"):
    royal = variant == "royal"
    logo = LOGO_LIGHT if royal else LOGO_TRANSPARENT
    ox, oy = 354 * mm, 98 * mm

    def poly(points, fill, stroke=Color(0, 0, 0, 0.50)):
        p = c.beginPath()
        p.moveTo(points[0][0], points[0][1])
        for pt in points[1:]:
            p.lineTo(pt[0], pt[1])
        p.close()
        c.setFillColor(fill)
        c.setStrokeColor(stroke)
        c.setLineWidth(0.75)
        c.drawPath(p, fill=1, stroke=1)

    front = PLUM if royal else HexColor("#EFEFF3")
    side = HexColor("#2D0A40") if royal else HexColor("#E1DEE6")
    inside = HexColor("#2A043A") if royal else HexColor("#F8F5FB")
    lid_fill = PLUM if royal else WARM_WHITE

    base_front = [(ox, oy + 35 * mm), (ox + 102 * mm, oy), (ox + 102 * mm, oy + 34 * mm), (ox, oy + 68 * mm)]
    base_side = [(ox + 102 * mm, oy), (ox + 146 * mm, oy + 34 * mm), (ox + 146 * mm, oy + 67 * mm), (ox + 102 * mm, oy + 34 * mm)]
    base_inside = [(ox, oy + 68 * mm), (ox + 102 * mm, oy + 34 * mm), (ox + 146 * mm, oy + 67 * mm), (ox + 42 * mm, oy + 103 * mm)]
    back_wall = [(ox + 42 * mm, oy + 103 * mm), (ox + 146 * mm, oy + 67 * mm), (ox + 147 * mm, oy + 104 * mm), (ox + 43 * mm, oy + 140 * mm)]
    lid = [(ox + 43 * mm, oy + 140 * mm), (ox + 147 * mm, oy + 104 * mm), (ox + 177 * mm, oy + 160 * mm), (ox + 72 * mm, oy + 198 * mm)]
    lid_side = [(ox + 147 * mm, oy + 104 * mm), (ox + 177 * mm, oy + 160 * mm), (ox + 184 * mm, oy + 147 * mm), (ox + 153 * mm, oy + 92 * mm)]
    lid_back = [(ox + 43 * mm, oy + 140 * mm), (ox + 72 * mm, oy + 198 * mm), (ox + 56 * mm, oy + 192 * mm), (ox + 28 * mm, oy + 136 * mm)]

    poly(base_front, front)
    poly(base_side, side)
    poly(base_inside, inside)
    poly(back_wall, side)
    poly(lid, lid_fill)
    poly(lid_side, side)
    poly(lid_back, side)

    c.saveState()
    c.setFillColor(Color(PURPLE.red, PURPLE.green, PURPLE.blue, 0.18 if not royal else 0.28))
    p = c.beginPath()
    p.moveTo(ox + 62 * mm, oy + 149 * mm)
    p.lineTo(ox + 158 * mm, oy + 116 * mm)
    p.lineTo(ox + 170 * mm, oy + 140 * mm)
    p.lineTo(ox + 75 * mm, oy + 176 * mm)
    p.close()
    c.drawPath(p, fill=1, stroke=0)
    c.restoreState()
    draw_logo(c, logo, ox + 72 * mm, oy + 138 * mm, 70 * mm, 46 * mm)
    brand_combined_line(c, ox + 107 * mm, oy + 136 * mm, royal, 7.2)
    contact_strip(c, ox + 14 * mm, oy + 39 * mm, 92 * mm, 7 * mm, royal, TOP_CONTACT_LINE)
    text(c, "result / visual identity box", ox + 26 * mm, oy + 212 * mm, 17, black, "CairoBold")
    text(c, "Finished box: 340 L x 220 W x 130 H mm", ox + 14 * mm, oy - 12 * mm, 8.2, MUTED, "CairoSemi")


def measurement_page(c):
    c.setPageSize((PAGE_W, PAGE_H))
    c.setFillColor(PALE)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    text(c, "IN & OUT LAUNDRY", 35 * mm, PAGE_H - 28 * mm, 11, PLUM, "CairoBold")
    text(c, "Visual Identity Dieline - Measurements", 35 * mm, PAGE_H - 44 * mm, 21, black, "CairoBold")
    text(c, "Same shoe-box style from the visual identity: wave pattern, circular logo, barcode label.", 35 * mm, PAGE_H - 55 * mm, 8.2, MUTED, "CairoSemi")

    x, y = 35 * mm, PAGE_H - 82 * mm
    rows = [
        ("Finished external size", "340 L x 220 W x 130 H mm"),
        ("Top lid / base", "340 x 220 mm"),
        ("Front wall", "340 x 130 mm"),
        ("Back / hinge wall", "340 x 130 mm"),
        ("Left & right side walls", "130 x 220 mm"),
        ("Side dust flaps", "55 x 120 mm, rounded corners"),
        ("Front tuck flap", "340 x 35 mm"),
        ("Barcode label", "100 x 70 mm on long side"),
        ("Bleed", "3 mm outside printed faces"),
        ("Safe area", "5 mm inside trim"),
        ("Recommended finish", "Matte lamination; optional spot UV on logo"),
        ("Supplier note", "Convert to CMYK and provide physical sample before bulk production"),
        ("Website", WEBSITE),
        ("Social media", SOCIAL),
        ("Contact numbers", f"{PHONE_1} / {PHONE_2} / {MOBILE}"),
    ]
    c.setFillColor(white)
    c.roundRect(x - 4 * mm, y - 162 * mm, 240 * mm, 172 * mm, 4 * mm, fill=1, stroke=0)
    for i, (k, v) in enumerate(rows):
        yy = y - i * 10 * mm
        text(c, k, x, yy, 7.5, PLUM, "CairoBold")
        text(c, v, x + 86 * mm, yy, 7.5, INK, "CairoSemi")
        c.setStrokeColor(Color(0, 0, 0, 0.06))
        c.line(x, yy - 3 * mm, x + 224 * mm, yy - 3 * mm)

    x2 = 318 * mm
    c.setFillColor(white)
    c.roundRect(x2 - 4 * mm, y - 132 * mm, 175 * mm, 142 * mm, 4 * mm, fill=1, stroke=0)
    text(c, "Supplier handoff", x2, y, 10, PLUM, "CairoBold")
    notes = [
        "Page 1 is the Standard White Box from the first visual identity design.",
        "Page 2 is the matching Premium Royal Box option.",
        "Keep logo, waves and barcode label positions as shown unless die-cut engineering requires a small shift.",
        "Final locking tabs can be adjusted by the box manufacturer, but external size must remain unchanged.",
        "Send a proof before printing because royal purple varies between printers.",
    ]
    yy = y - 15 * mm
    for n in notes:
        c.setFillColor(PURPLE)
        c.circle(x2 + 2 * mm, yy + 1.8 * mm, 0.8 * mm, fill=1, stroke=0)
        text(c, n, x2 + 7 * mm, yy, 7.4, INK, "Cairo")
        yy -= 15 * mm
    draw_label(c, x2 + 10 * mm, 53 * mm, 100 * mm, 70 * mm)
    text(c, "Barcode sticker 100 x 70 mm", x2 + 10 * mm, 41 * mm, 7.2, MUTED, "CairoSemi")


def build():
    register_fonts()
    flood_transparent_logo()
    generate_contact_qr()
    generate_brand_text_assets()
    OUT.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(OUT), pagesize=(PAGE_W, PAGE_H))

    draw_header(c, "Standard White Box - Visual Identity Dieline", "Page 1 / same first design from the visual identity", LOGO_TRANSPARENT)
    dieline(c, "white")
    mockup(c, "white")
    text(c, "Page 1 / Standard white design converted to dieline. Production dimensions are in millimeters.", 35 * mm, 12 * mm, 7.2, MUTED, "CairoSemi")
    c.showPage()

    draw_header(c, "Premium Royal Box - Matching Dieline", "Page 2 / optional premium version from the same visual identity", LOGO_TRANSPARENT)
    dieline(c, "royal")
    mockup(c, "royal")
    text(c, "Page 2 / Premium royal option. Confirm CMYK proof before production.", 35 * mm, 12 * mm, 7.2, MUTED, "CairoSemi")
    c.showPage()

    measurement_page(c)
    text(c, "Page 3 / Measurements and supplier notes.", 35 * mm, 12 * mm, 7.2, MUTED, "CairoSemi")
    c.save()
    print(OUT)
    print(LOGO_TRANSPARENT)
    print(LOGO_LIGHT)


if __name__ == "__main__":
    build()
