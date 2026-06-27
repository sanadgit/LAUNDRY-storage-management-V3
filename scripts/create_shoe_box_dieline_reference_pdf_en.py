from pathlib import Path

from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor, Color, white, black
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.utils import ImageReader
from PIL import Image

from create_shoe_box_print_artwork_pdf_en import (
    ROOT,
    ASSET,
    SOURCE_LOGO,
    RECOLORED_LOGO,
    RECOLORED_LOGO_LIGHT,
    recolor_original_logo,
    fit_image,
    draw_barcode,
)


OUT = ROOT / "output" / "pdf" / "IN_OUT_Laundry_Shoe_Box_Dieline_Artwork_EN.pdf"

PAGE_W = 545.51 * mm
PAGE_H = 387.72 * mm

PURPLE = HexColor("#8F00FF")
PLUM = HexColor("#21002F")
VIOLET = HexColor("#C026D3")
PALE = HexColor("#FBF7FF")
LAV = HexColor("#EAD7F7")
KRAFT = HexColor("#D9BEA6")
DARK_KRAFT = HexColor("#B89476")
INK = HexColor("#211827")
MUTED = HexColor("#6E6474")
LINE = HexColor("#2B2430")
CUT = HexColor("#E11D48")
FOLD = HexColor("#2563EB")
SAFE = HexColor("#22A06B")
BLEED = HexColor("#8F00FF")


def register_fonts():
    for name, path in [
        ("Cairo", r"C:\Windows\Fonts\Cairo-Regular.ttf"),
        ("CairoSemi", r"C:\Windows\Fonts\Cairo-SemiBold.ttf"),
        ("CairoBold", r"C:\Windows\Fonts\Cairo-Bold.ttf"),
    ]:
        try:
            pdfmetrics.registerFont(TTFont(name, path))
        except Exception:
            pass


def text(c, s, x, y, size=8, color=INK, font="Cairo"):
    c.setFont(font, size)
    c.setFillColor(color)
    c.drawString(x, y, s)


def centered(c, s, x, y, size=8, color=INK, font="Cairo"):
    c.setFont(font, size)
    c.setFillColor(color)
    c.drawCentredString(x, y, s)


def dashed_rect(c, x, y, w, h, color=FOLD, width=0.8, dash=(4, 3)):
    c.saveState()
    c.setStrokeColor(color)
    c.setLineWidth(width)
    c.setDash(*dash)
    c.rect(x, y, w, h, fill=0, stroke=1)
    c.restoreState()


def panel(c, x, y, w, h, fill=KRAFT, stroke=LINE, cut=True, fold=False, radius=0):
    c.setFillColor(fill)
    c.setStrokeColor(stroke)
    c.setLineWidth(0.9)
    if radius:
        c.roundRect(x, y, w, h, radius, fill=1, stroke=1)
    else:
        c.rect(x, y, w, h, fill=1, stroke=1)
    if cut:
        c.setStrokeColor(CUT)
        c.setLineWidth(0.55)
        c.rect(x, y, w, h, fill=0, stroke=1)
    if fold:
        dashed_rect(c, x, y, w, h, FOLD, 0.55)


def draw_wave(c, x, y, w, h, color=PURPLE, alpha=0.18):
    c.saveState()
    c.setStrokeColor(Color(color.red, color.green, color.blue, alpha))
    c.setLineWidth(0.9)
    for i in range(10):
        yy = y + h * (0.18 + i * 0.055)
        p = c.beginPath()
        p.moveTo(x, yy)
        p.curveTo(x + w * 0.25, yy + h * 0.17, x + w * 0.55, yy - h * 0.16, x + w, yy + h * 0.08)
        c.drawPath(p, stroke=1, fill=0)
    c.restoreState()


def draw_logo(c, path, x, y, w, h):
    im = Image.open(path)
    c.drawImage(ImageReader(im), x, y, w, h, preserveAspectRatio=True, anchor="c", mask="auto")


def draw_arrow_dimension(c, x1, y1, x2, y2, label, offset=0):
    c.saveState()
    c.setStrokeColor(MUTED)
    c.setFillColor(MUTED)
    c.setLineWidth(0.45)
    if abs(y1 - y2) < 1:
        y = y1 + offset
        c.line(x1, y, x2, y)
        c.line(x1, y - 2 * mm, x1, y + 2 * mm)
        c.line(x2, y - 2 * mm, x2, y + 2 * mm)
        centered(c, label, (x1 + x2) / 2, y + 2.4 * mm, 6.2, MUTED, "CairoSemi")
    else:
        x = x1 + offset
        c.line(x, y1, x, y2)
        c.line(x - 2 * mm, y1, x + 2 * mm, y1)
        c.line(x - 2 * mm, y2, x + 2 * mm, y2)
        c.saveState()
        c.translate(x - 2.4 * mm, (y1 + y2) / 2)
        c.rotate(90)
        centered(c, label, 0, 0, 6.2, MUTED, "CairoSemi")
        c.restoreState()
    c.restoreState()


def draw_label_sticker(c, x, y, w, h):
    c.setFillColor(white)
    c.roundRect(x, y, w, h, 2 * mm, fill=1, stroke=0)
    c.setStrokeColor(Color(0, 0, 0, 0.15))
    c.roundRect(x, y, w, h, 2 * mm, fill=0, stroke=1)
    text(c, "ORDER", x + 4 * mm, y + h - 8 * mm, 5.4, PLUM, "CairoBold")
    text(c, "100568", x + 17 * mm, y + h - 8 * mm, 5.4, INK, "CairoSemi")
    text(c, "CUSTOMER", x + 4 * mm, y + h - 15 * mm, 5.2, PLUM, "CairoBold")
    text(c, "Auto print", x + 24 * mm, y + h - 15 * mm, 5.2, INK, "Cairo")
    text(c, "1 PAIR | SHELF S-04", x + 4 * mm, y + h - 22 * mm, 5.4, INK, "CairoSemi")
    draw_barcode(c, x + 4 * mm, y + 5 * mm, w - 8 * mm, 10 * mm)


def draw_dieline(c):
    x0 = 38 * mm
    y0 = 34 * mm
    scale = 0.39

    # Production panels in mm.
    side = 130
    flap = 55
    length = 340
    width = 220
    tuck = 35
    back = 130

    s = mm * scale
    fw, sw, lw, ww, th, bh = flap * s, side * s, length * s, width * s, tuck * s, back * s

    cx = x0 + fw + sw
    base_y = y0 + th + side * s
    front_y = y0 + th
    lid_y = base_y + ww + bh
    hinge_y = base_y + ww

    # Front tuck and wall.
    panel(c, cx, y0, lw, th, fill=KRAFT, radius=4 * mm)
    centered(c, "FRONT TUCK FLAP 340 x 35", cx + lw / 2, y0 + th / 2 - 1.6 * mm, 5.5, INK, "CairoSemi")
    panel(c, cx, front_y, lw, sw, fill=KRAFT)
    centered(c, "FRONT WALL 340 x 130", cx + lw / 2, front_y + sw / 2, 5.8, INK, "CairoSemi")
    draw_logo(c, RECOLORED_LOGO, cx + lw * 0.40, front_y + sw * 0.28, lw * 0.20, sw * 0.22)

    # Base with side walls and dust flaps.
    panel(c, cx, base_y, lw, ww, fill=HexColor("#F8F1EA"))
    centered(c, "BASE PANEL 340 x 220", cx + lw / 2, base_y + ww / 2, 6.5, INK, "CairoBold")
    panel(c, cx - sw, base_y, sw, ww, fill=KRAFT)
    centered(c, "LEFT SIDE WALL 130 x 220", cx - sw / 2, base_y + ww / 2, 5.4, INK, "CairoSemi")
    panel(c, cx + lw, base_y, sw, ww, fill=KRAFT)
    centered(c, "RIGHT SIDE WALL 130 x 220", cx + lw + sw / 2, base_y + ww / 2, 5.4, INK, "CairoSemi")
    panel(c, cx - sw - fw, base_y + ww * 0.22, fw, ww * 0.56, fill=KRAFT, radius=2 * mm)
    panel(c, cx + lw + sw, base_y + ww * 0.22, fw, ww * 0.56, fill=KRAFT, radius=2 * mm)

    # Hinge and lid.
    panel(c, cx, hinge_y, lw, bh, fill=KRAFT)
    centered(c, "BACK / HINGE WALL 340 x 130", cx + lw / 2, hinge_y + bh / 2, 5.8, INK, "CairoSemi")
    panel(c, cx - sw, hinge_y, sw, bh, fill=KRAFT)
    panel(c, cx + lw, hinge_y, sw, bh, fill=KRAFT)

    panel(c, cx, lid_y, lw, ww, fill=white)
    c.saveState()
    c.rect(cx, lid_y, lw, ww, fill=0, stroke=0)
    c.setFillColor(PALE)
    c.rect(cx, lid_y, lw, ww, fill=1, stroke=0)
    c.setFillColor(Color(PURPLE.red, PURPLE.green, PURPLE.blue, 0.12))
    p = c.beginPath()
    p.moveTo(cx, lid_y + ww * 0.18)
    p.lineTo(cx + lw, lid_y + ww * 0.52)
    p.lineTo(cx + lw, lid_y + ww * 0.08)
    p.lineTo(cx, lid_y - ww * 0.06)
    p.close()
    c.drawPath(p, fill=1, stroke=0)
    draw_wave(c, cx + 3 * mm, lid_y + 3 * mm, lw - 6 * mm, ww - 6 * mm, PURPLE, 0.20)
    c.restoreState()
    c.setStrokeColor(CUT)
    c.rect(cx, lid_y, lw, ww, fill=0, stroke=1)
    draw_logo(c, RECOLORED_LOGO, cx + lw * 0.36, lid_y + ww * 0.31, lw * 0.28, ww * 0.32)
    centered(c, "LID TOP ARTWORK 340 x 220", cx + lw / 2, lid_y + ww - 8 * mm, 5.8, PLUM, "CairoBold")

    # Lid side walls.
    panel(c, cx - sw, lid_y, sw, ww, fill=KRAFT)
    panel(c, cx + lw, lid_y, sw, ww, fill=KRAFT)
    panel(c, cx - sw - fw, lid_y + ww * 0.20, fw, ww * 0.60, fill=KRAFT, radius=2 * mm)
    panel(c, cx + lw + sw, lid_y + ww * 0.20, fw, ww * 0.60, fill=KRAFT, radius=2 * mm)

    # Label sticker on right long side.
    draw_label_sticker(c, cx + lw + sw * 0.08, base_y + 15 * mm, sw * 0.84, ww * 0.34)

    # Fold guide lines.
    for xx in [cx, cx + lw, cx - sw, cx + lw + sw]:
        c.setStrokeColor(FOLD)
        c.setDash(4, 3)
        c.line(xx, base_y, xx, base_y + ww)
        c.line(xx, lid_y, xx, lid_y + ww)
        c.setDash()
    for yy in [front_y, base_y, hinge_y, lid_y, lid_y + ww]:
        c.setStrokeColor(FOLD)
        c.setDash(4, 3)
        c.line(cx, yy, cx + lw, yy)
        c.setDash()

    # Overall dimensions.
    draw_arrow_dimension(c, cx, lid_y + ww, cx + lw, lid_y + ww, "340 mm", 8 * mm)
    draw_arrow_dimension(c, cx + lw + sw, base_y, cx + lw + sw, base_y + ww, "220 mm", 10 * mm)
    draw_arrow_dimension(c, cx + lw + sw + fw, base_y, cx + lw + sw + fw, base_y + sw, "130 mm", 8 * mm)

    # Legend.
    lx = 34 * mm
    ly = 29 * mm
    for color, label, dash in [
        (CUT, "CUT LINE", None),
        (FOLD, "FOLD / CREASE LINE", (4, 3)),
        (SAFE, "KEEP LOGO/TEXT 5 mm INSIDE TRIM", None),
        (BLEED, "ADD 3 mm BLEED ON PRINTED FACES", None),
    ]:
        c.setStrokeColor(color)
        c.setLineWidth(1.2)
        if dash:
            c.setDash(*dash)
        c.line(lx, ly, lx + 13 * mm, ly)
        c.setDash()
        text(c, label, lx + 16 * mm, ly - 2.1 * mm, 6.4, INK, "CairoSemi")
        lx += 76 * mm


def draw_3d_mockup(c):
    ox = 354 * mm
    oy = 98 * mm
    scale = 1.0

    def poly(points, fill, stroke=LINE):
        p = c.beginPath()
        p.moveTo(points[0][0], points[0][1])
        for pt in points[1:]:
            p.lineTo(pt[0], pt[1])
        p.close()
        c.setFillColor(fill)
        c.setStrokeColor(stroke)
        c.setLineWidth(0.8)
        c.drawPath(p, fill=1, stroke=1)

    base_front = [(ox, oy + 35 * mm), (ox + 102 * mm, oy), (ox + 102 * mm, oy + 34 * mm), (ox, oy + 68 * mm)]
    base_side = [(ox + 102 * mm, oy), (ox + 146 * mm, oy + 34 * mm), (ox + 146 * mm, oy + 67 * mm), (ox + 102 * mm, oy + 34 * mm)]
    base_inside = [(ox, oy + 68 * mm), (ox + 102 * mm, oy + 34 * mm), (ox + 146 * mm, oy + 67 * mm), (ox + 42 * mm, oy + 103 * mm)]
    back_wall = [(ox + 42 * mm, oy + 103 * mm), (ox + 146 * mm, oy + 67 * mm), (ox + 147 * mm, oy + 104 * mm), (ox + 43 * mm, oy + 140 * mm)]
    lid = [(ox + 43 * mm, oy + 140 * mm), (ox + 147 * mm, oy + 104 * mm), (ox + 177 * mm, oy + 160 * mm), (ox + 72 * mm, oy + 198 * mm)]
    lid_side = [(ox + 147 * mm, oy + 104 * mm), (ox + 177 * mm, oy + 160 * mm), (ox + 184 * mm, oy + 147 * mm), (ox + 153 * mm, oy + 92 * mm)]
    lid_back = [(ox + 43 * mm, oy + 140 * mm), (ox + 72 * mm, oy + 198 * mm), (ox + 56 * mm, oy + 192 * mm), (ox + 28 * mm, oy + 136 * mm)]

    poly(base_front, DARK_KRAFT)
    poly(base_side, HexColor("#C8A78C"))
    poly(base_inside, HexColor("#EFE3D8"))
    poly(back_wall, KRAFT)
    poly(lid, PALE)
    poly(lid_side, KRAFT)
    poly(lid_back, KRAFT)

    # Artwork impression on lid.
    c.saveState()
    c.setFillColor(Color(PURPLE.red, PURPLE.green, PURPLE.blue, 0.16))
    p = c.beginPath()
    p.moveTo(ox + 63 * mm, oy + 150 * mm)
    p.lineTo(ox + 158 * mm, oy + 116 * mm)
    p.lineTo(ox + 170 * mm, oy + 140 * mm)
    p.lineTo(ox + 75 * mm, oy + 176 * mm)
    p.close()
    c.drawPath(p, fill=1, stroke=0)
    c.restoreState()

    draw_logo(c, RECOLORED_LOGO, ox + 84 * mm, oy + 137 * mm, 45 * mm, 31 * mm)
    text(c, "result / open shoe box", ox + 39 * mm, oy + 212 * mm, 18, black, "CairoBold")
    text(c, "Finished box: 340 L x 220 W x 130 H mm", ox + 15 * mm, oy - 12 * mm, 8.3, MUTED, "CairoSemi")


def draw_header(c):
    c.setFillColor(white)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    text(c, "IN & OUT LAUNDRY", 35 * mm, PAGE_H - 28 * mm, 11, PLUM, "CairoBold")
    text(c, "Shoe Box Packaging Dieline Artwork", 35 * mm, PAGE_H - 44 * mm, 22, black, "CairoBold")
    text(c, "Original logo geometry preserved - recolored only to the royal identity palette", 35 * mm, PAGE_H - 55 * mm, 8.2, MUTED, "CairoSemi")
    draw_logo(c, RECOLORED_LOGO, PAGE_W - 98 * mm, PAGE_H - 48 * mm, 56 * mm, 31 * mm)


def draw_measurement_page(c):
    c.setPageSize((PAGE_W, PAGE_H))
    c.setFillColor(PALE)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    text(c, "IN & OUT LAUNDRY", 35 * mm, PAGE_H - 28 * mm, 11, PLUM, "CairoBold")
    text(c, "Production Measurements & Supplier Notes", 35 * mm, PAGE_H - 44 * mm, 22, black, "CairoBold")

    x = 35 * mm
    y = PAGE_H - 76 * mm
    col_w = 225 * mm
    rows = [
        ("Finished external size", "340 L x 220 W x 130 H mm"),
        ("Lid top artwork", "340 x 220 mm"),
        ("Base panel", "340 x 220 mm"),
        ("Front wall", "340 x 130 mm"),
        ("Back / hinge wall", "340 x 130 mm"),
        ("Left & right side walls", "130 x 220 mm"),
        ("Side dust flaps", "55 x 120 mm, rounded corners"),
        ("Front tuck flap", "340 x 35 mm"),
        ("Barcode sticker", "100 x 70 mm, applied on long side"),
        ("Bleed", "3 mm outside all printed faces"),
        ("Safe area", "5 mm inside all trims for logo and text"),
        ("Material", "Rigid greyboard 1.5-2.0 mm or laminated E-flute corrugated"),
    ]

    c.setFillColor(white)
    c.roundRect(x - 4 * mm, y - 128 * mm, col_w, 136 * mm, 4 * mm, fill=1, stroke=0)
    c.setStrokeColor(Color(0, 0, 0, 0.10))
    c.roundRect(x - 4 * mm, y - 128 * mm, col_w, 136 * mm, 4 * mm, fill=0, stroke=1)
    for i, (k, v) in enumerate(rows):
        yy = y - i * 10 * mm
        text(c, k, x, yy, 7.6, PLUM, "CairoBold")
        text(c, v, x + 83 * mm, yy, 7.6, INK, "CairoSemi")
        c.setStrokeColor(Color(0, 0, 0, 0.06))
        c.line(x, yy - 3 * mm, x + col_w - 12 * mm, yy - 3 * mm)

    x2 = 304 * mm
    c.setFillColor(white)
    c.roundRect(x2 - 4 * mm, y - 128 * mm, 200 * mm, 136 * mm, 4 * mm, fill=1, stroke=0)
    c.setStrokeColor(Color(0, 0, 0, 0.10))
    c.roundRect(x2 - 4 * mm, y - 128 * mm, 200 * mm, 136 * mm, 4 * mm, fill=0, stroke=1)
    text(c, "Supplier checklist", x2, y, 10, PLUM, "CairoBold")
    notes = [
        "Use the attached dieline as the visual folding structure.",
        "Keep the original logo shape unchanged; only these colors are approved.",
        "Deep Royal Plum: #21002F. Royal Purple: #8F00FF.",
        "Convert artwork to CMYK and send a digital proof before printing.",
        "Ask for one physical sample before bulk production.",
        "If supplier uses another locking method, keep external box size unchanged.",
    ]
    yy = y - 14 * mm
    for n in notes:
        c.setFillColor(PURPLE)
        c.circle(x2 + 2 * mm, yy + 1.8 * mm, 0.8 * mm, fill=1, stroke=0)
        text(c, n, x2 + 7 * mm, yy, 7.6, INK, "Cairo")
        yy -= 13 * mm

    # Label template.
    draw_label_sticker(c, x2 + 10 * mm, 56 * mm, 100 * mm, 70 * mm)
    text(c, "100 x 70 mm barcode sticker", x2 + 10 * mm, 43 * mm, 7.2, MUTED, "CairoSemi")

    draw_logo(c, RECOLORED_LOGO_LIGHT, x2 + 122 * mm, 73 * mm, 58 * mm, 34 * mm)
    c.setFillColor(PLUM)
    c.roundRect(x2 + 118 * mm, 61 * mm, 66 * mm, 57 * mm, 4 * mm, fill=1, stroke=0)
    draw_logo(c, RECOLORED_LOGO_LIGHT, x2 + 123 * mm, 77 * mm, 56 * mm, 31 * mm)
    text(c, "Dark-box logo version", x2 + 122 * mm, 48 * mm, 7.2, MUTED, "CairoSemi")


def build():
    register_fonts()
    recolor_original_logo()
    OUT.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(OUT), pagesize=(PAGE_W, PAGE_H))
    draw_header(c)
    draw_dieline(c)
    draw_3d_mockup(c)
    text(c, "Page 1 / Dieline follows the provided reference shape. Measurements are production dimensions in millimeters.", 35 * mm, 12 * mm, 7.2, MUTED, "CairoSemi")
    c.showPage()
    draw_measurement_page(c)
    text(c, "Page 2 / Send this file with the original recolored logo assets to the packaging supplier.", 35 * mm, 12 * mm, 7.2, MUTED, "CairoSemi")
    c.save()
    print(OUT)


if __name__ == "__main__":
    build()
