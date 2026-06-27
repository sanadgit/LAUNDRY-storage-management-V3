from collections import deque
from pathlib import Path

from PIL import Image
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A3, A4, landscape
from reportlab.lib.colors import HexColor, Color, white, black
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.utils import ImageReader


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "output" / "pdf" / "IN_OUT_Laundry_Shoe_Box_Print_Artwork_EN.pdf"
ASSET = ROOT / "output" / "branch_identity"
SOURCE_LOGO = ROOT / "logo-in-and-out-laundry.png"
RECOLORED_LOGO = ASSET / "00-original-logo-royal-recolor.png"
RECOLORED_LOGO_LIGHT = ASSET / "00-original-logo-royal-light-for-dark-box.png"

PURPLE = HexColor("#8F00FF")
PLUM = HexColor("#21002F")
VIOLET = HexColor("#C026D3")
PALE = HexColor("#FBF7FF")
LAV = HexColor("#EAD7F7")
SILVER = HexColor("#B9BDC7")
INK = HexColor("#211827")
MUTED = HexColor("#6E6474")
LINE = HexColor("#DDD6E3")
CUT = HexColor("#E11D48")
SAFE = HexColor("#22A06B")
BLEED = HexColor("#2563EB")


def register_fonts():
    pdfmetrics.registerFont(TTFont("Cairo", r"C:\Windows\Fonts\Cairo-Regular.ttf"))
    pdfmetrics.registerFont(TTFont("CairoSemi", r"C:\Windows\Fonts\Cairo-SemiBold.ttf"))
    pdfmetrics.registerFont(TTFont("CairoBold", r"C:\Windows\Fonts\Cairo-Bold.ttf"))


def recolor_original_logo():
    """Preserve the original logo geometry; only recolor black and magenta areas.

    Border-connected white background is made transparent. Interior white text
    and negative shapes remain white.
    """
    ASSET.mkdir(parents=True, exist_ok=True)
    im = Image.open(SOURCE_LOGO).convert("RGBA")
    px = im.load()
    w, h = im.size
    visited = set()
    q = deque()

    def is_bg_white(p):
        r, g, b, a = p
        return a > 0 and r > 235 and g > 235 and b > 235

    for x in range(w):
        for y in (0, h - 1):
            if is_bg_white(px[x, y]):
                q.append((x, y))
                visited.add((x, y))
    for y in range(h):
        for x in (0, w - 1):
            if is_bg_white(px[x, y]) and (x, y) not in visited:
                q.append((x, y))
                visited.add((x, y))
    while q:
        x, y = q.popleft()
        for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if 0 <= nx < w and 0 <= ny < h and (nx, ny) not in visited and is_bg_white(px[nx, ny]):
                visited.add((nx, ny))
                q.append((nx, ny))
    for x, y in visited:
        r, g, b, a = px[x, y]
        px[x, y] = (255, 255, 255, 0)

    # Recolor non-background pixels.
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a == 0:
                continue
            # Keep interior white lettering and highlights.
            if r > 235 and g > 235 and b > 235:
                px[x, y] = (255, 255, 255, a)
                continue
            # Original magenta areas become royal purple / satin violet family.
            if r > 105 and b > 70 and g < 80:
                px[x, y] = (143, 0, 255, a)
            else:
                px[x, y] = (33, 0, 47, a)

    im.save(RECOLORED_LOGO)

    # Light version for premium dark royal box: same original geometry, colours only.
    light = Image.open(SOURCE_LOGO).convert("RGBA")
    px = light.load()
    # Reuse background mask by flood filling again.
    visited = set()
    q = deque()
    for x in range(w):
        for y in (0, h - 1):
            if is_bg_white(px[x, y]):
                q.append((x, y))
                visited.add((x, y))
    for y in range(h):
        for x in (0, w - 1):
            if is_bg_white(px[x, y]) and (x, y) not in visited:
                q.append((x, y))
                visited.add((x, y))
    while q:
        x, y = q.popleft()
        for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if 0 <= nx < w and 0 <= ny < h and (nx, ny) not in visited and is_bg_white(px[nx, ny]):
                visited.add((nx, ny))
                q.append((nx, ny))
    for x, y in visited:
        px[x, y] = (255, 255, 255, 0)
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a == 0:
                continue
            if r > 235 and g > 235 and b > 235:
                px[x, y] = (255, 255, 255, a)
                continue
            if r > 105 and b > 70 and g < 80:
                px[x, y] = (143, 0, 255, a)
            else:
                px[x, y] = (255, 255, 255, a)
    light.save(RECOLORED_LOGO_LIGHT)
    return RECOLORED_LOGO


def fit_image(c, path, x, y, w, h, contain=True):
    im = Image.open(path)
    iw, ih = im.size
    scale = min(w / iw, h / ih) if contain else max(w / iw, h / ih)
    sw, sh = iw * scale, ih * scale
    dx, dy = x + (w - sw) / 2, y + (h - sh) / 2
    c.drawImage(ImageReader(im), dx, dy, sw, sh, mask="auto")


def wrap_text(c, text, x, y, width, size=9, color=INK, font="Cairo", leading=None):
    leading = leading or size * 1.4
    c.setFont(font, size)
    c.setFillColor(color)
    words, lines, current = str(text).split(), [], ""
    for word in words:
        trial = word if not current else current + " " + word
        if pdfmetrics.stringWidth(trial, font, size) <= width:
            current = trial
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    for line in lines:
        c.drawString(x, y, line)
        y -= leading
    return y


def header(c, title, subtitle, page_no, size=landscape(A4)):
    w, h = size
    c.setFillColor(PALE)
    c.rect(0, 0, w, h, fill=1, stroke=0)
    c.setFillColor(PURPLE)
    c.rect(w - 12 * mm, 0, 12 * mm, h, fill=1, stroke=0)
    c.setFont("CairoSemi", 8)
    c.setFillColor(VIOLET)
    c.drawString(18 * mm, h - 18 * mm, subtitle.upper())
    c.setFont("CairoBold", 20)
    c.setFillColor(PLUM)
    c.drawString(18 * mm, h - 30 * mm, title)
    c.setStrokeColor(LINE)
    c.line(18 * mm, 12 * mm, w - 18 * mm, 12 * mm)
    c.setFont("Cairo", 7)
    c.setFillColor(MUTED)
    c.drawString(18 * mm, 6 * mm, "IN & OUT LAUNDRY | SHOE BOX PRINT ARTWORK | ORIGINAL LOGO RECOLORED ONLY | 25 JUN 2026")
    c.drawRightString(w - 18 * mm, 6 * mm, str(page_no))


def panel(c, x, y, w, h, title=None):
    c.setFillColor(white)
    c.roundRect(x, y, w, h, 4 * mm, fill=1, stroke=0)
    c.setStrokeColor(LINE)
    c.roundRect(x, y, w, h, 4 * mm, fill=0, stroke=1)
    if title:
        c.setFont("CairoBold", 10)
        c.setFillColor(PLUM)
        c.drawString(x + 8 * mm, y + h - 10 * mm, title)


def bullet_list(c, items, x, y, width, size=8.3, gap=4):
    for item in items:
        c.setFillColor(PURPLE)
        c.circle(x + 2 * mm, y + 1.8 * mm, 0.9 * mm, fill=1, stroke=0)
        y = wrap_text(c, item, x + 6 * mm, y, width - 6 * mm, size, INK, "Cairo", size * 1.35)
        y -= gap * mm
    return y


def draw_legend(c, x, y):
    items = [(CUT, "CUT / TRIM"), (BLEED, "3 mm BLEED"), (SAFE, "5 mm SAFE AREA")]
    for color, label in items:
        c.setStrokeColor(color)
        c.setLineWidth(1.4)
        c.line(x, y, x + 16 * mm, y)
        c.setFont("CairoSemi", 7.5)
        c.setFillColor(INK)
        c.drawString(x + 19 * mm, y - 2.5 * mm, label)
        y -= 8 * mm


def draw_barcode(c, x, y, w, h):
    c.setFillColor(white)
    c.rect(x, y, w, h, fill=1, stroke=0)
    c.setFillColor(black)
    pattern = [1, 2, 1, 3, 2, 1, 4, 1, 2, 3, 1, 1, 2, 4, 1, 2, 2, 1, 3, 1, 4, 2]
    pos = x + 1.5 * mm
    i = 0
    while pos < x + w - 2 * mm:
        bw = pattern[i % len(pattern)] * 0.35 * mm
        c.rect(pos, y + 1 * mm, bw, h - 2 * mm, fill=1, stroke=0)
        pos += bw + (0.45 if i % 3 else 0.8) * mm
        i += 1


def draw_wave(c, x, y, w, h, color=PURPLE, lines=11, alpha=0.32):
    c.saveState()
    c.setStrokeColor(Color(color.red, color.green, color.blue, alpha))
    c.setLineWidth(0.6)
    for i in range(lines):
        yy = y + h * (0.18 + i * 0.035)
        p = c.beginPath()
        p.moveTo(x, yy)
        p.curveTo(x + w * 0.28, yy + h * 0.16, x + w * 0.52, yy - h * 0.14, x + w, yy + h * 0.08)
        c.drawPath(p, stroke=1, fill=0)
    c.restoreState()


def draw_label(c, x, y, w=100 * mm, h=70 * mm, royal=False):
    c.setFillColor(white)
    c.roundRect(x, y, w, h, 3 * mm, fill=1, stroke=0)
    c.setStrokeColor(LINE)
    c.roundRect(x, y, w, h, 3 * mm, fill=0, stroke=1)
    c.setFont("CairoBold", 9)
    c.setFillColor(PLUM)
    c.drawString(x + 6 * mm, y + h - 10 * mm, "IN & OUT LAUNDRY")
    rows = [
        ("ORDER", "100568"),
        ("CUSTOMER", "John Smith"),
        ("SHOES QTY", "1 PAIR"),
        ("SERVICE", "Shoe Cleaning"),
        ("SHELF", "A-03"),
        ("DATE", "AUTO"),
    ]
    yy = y + h - 20 * mm
    for k, v in rows:
        c.setFont("CairoSemi", 7)
        c.setFillColor(INK)
        c.drawString(x + 6 * mm, yy, k)
        c.drawString(x + 32 * mm, yy, ":")
        c.setFont("CairoBold" if k == "SHOES QTY" else "Cairo", 7)
        c.setFillColor(PLUM if k == "SHOES QTY" else INK)
        c.drawString(x + 37 * mm, yy, v)
        yy -= 7 * mm
    draw_barcode(c, x + 6 * mm, y + 7 * mm, 58 * mm, 13 * mm)
    c.setStrokeColor(INK)
    c.rect(x + w - 23 * mm, y + 7 * mm, 15 * mm, 15 * mm, fill=0, stroke=1)
    c.line(x + w - 23 * mm, y + 14.5 * mm, x + w - 8 * mm, y + 14.5 * mm)
    c.line(x + w - 15.5 * mm, y + 7 * mm, x + w - 15.5 * mm, y + 22 * mm)


def draw_print_rect(c, x, y, w_mm, h_mm, bg=white, royal=False, title=None, label_zone=False, top_logo=True):
    w, h = w_mm * mm, h_mm * mm
    bleed = 3 * mm
    safe = 5 * mm
    c.setFillColor(bg)
    c.rect(x - bleed, y - bleed, w + 2 * bleed, h + 2 * bleed, fill=1, stroke=0)
    draw_wave(c, x, y, w, h * 0.55, white if royal else PURPLE, alpha=0.28 if royal else 0.22)
    c.setStrokeColor(BLEED)
    c.setDash(3, 2)
    c.rect(x - bleed, y - bleed, w + 2 * bleed, h + 2 * bleed, fill=0, stroke=1)
    c.setDash()
    c.setStrokeColor(CUT)
    c.setLineWidth(1.2)
    c.rect(x, y, w, h, fill=0, stroke=1)
    c.setStrokeColor(SAFE)
    c.setLineWidth(0.8)
    c.rect(x + safe, y + safe, w - 2 * safe, h - 2 * safe, fill=0, stroke=1)
    if top_logo:
        logo_path = RECOLORED_LOGO_LIGHT if royal else RECOLORED_LOGO
        fit_image(c, logo_path, x + w * 0.34, y + h * 0.31, w * 0.32, h * 0.42, contain=True)
    if label_zone:
        draw_label(c, x + w - 110 * mm, y + 15 * mm, 100 * mm, 70 * mm)
    if title:
        c.setFont("CairoBold", 10)
        c.setFillColor(PLUM if not royal else white)
        c.drawCentredString(x + w / 2, y + h + 7 * mm, title)
    c.setFont("CairoSemi", 7.5)
    c.setFillColor(MUTED if not royal else white)
    c.drawRightString(x + w, y - 8 * mm, f"Trim size: {w_mm} x {h_mm} mm")


def page_specs(c):
    size = landscape(A4)
    header(c, "Shoe Box Packaging Artwork", "01 / technical summary", 1, size)
    w, h = size
    panel(c, 18 * mm, 34 * mm, 88 * mm, 145 * mm, "ORIGINAL LOGO")
    fit_image(c, SOURCE_LOGO, 34 * mm, 82 * mm, 56 * mm, 70 * mm, contain=True)
    c.setFont("CairoSemi", 8)
    c.setFillColor(MUTED)
    c.drawCentredString(62 * mm, 68 * mm, "Original geometry")
    panel(c, 116 * mm, 34 * mm, 88 * mm, 145 * mm, "RECOLORED ONLY")
    fit_image(c, RECOLORED_LOGO, 132 * mm, 82 * mm, 56 * mm, 70 * mm, contain=True)
    c.setFillColor(MUTED)
    c.drawCentredString(160 * mm, 68 * mm, "Royal plum / purple")
    panel(c, 214 * mm, 34 * mm, 75 * mm, 145 * mm, "BOX SPEC")
    bullet_list(c, [
        "Box type: two-piece rigid shoe box or laminated corrugated shoe box.",
        "Standard adult trim size: 340 L x 220 W x 130 H mm.",
        "Bleed: 3 mm outside trim on every printed panel.",
        "Safe area: keep logo/text 5 mm inside trim.",
        "Standard option: matte white carton.",
        "Premium option: deep royal plum carton.",
        "Supplier must apply final die-cut dieline and convert artwork to CMYK before mass production."
    ], 226 * mm, 152 * mm, 54 * mm, 7.6, 2.8)
    draw_legend(c, 226 * mm, 62 * mm)


def page_white_lid(c):
    size = landscape(A3)
    c.setPageSize(size)
    header(c, "Standard White Box - Lid Top", "02 / 1:1 artwork panel", 2, size)
    draw_print_rect(c, 40 * mm, 35 * mm, 340, 220, bg=white, royal=False, title="TOP LID ARTWORK - STANDARD WHITE BOX")
    draw_legend(c, 330 * mm, 250 * mm)


def page_white_sides(c):
    size = landscape(A3)
    c.setPageSize(size)
    header(c, "Standard White Box - Side Panels", "03 / 1:1 artwork panels", 3, size)
    draw_print_rect(c, 35 * mm, 146 * mm, 340, 60, bg=white, title="LONG FRONT SIDE - 340 x 60 mm", top_logo=True)
    draw_print_rect(c, 35 * mm, 55 * mm, 340, 70, bg=white, title="LONG LABEL SIDE - 340 x 70 mm", label_zone=True, top_logo=False)
    c.setFont("CairoSemi", 8)
    c.setFillColor(MUTED)
    c.drawString(35 * mm, 38 * mm, "Supplier note: long sides shown as print panels. Final wrap/hinge/glue tabs depend on chosen box construction.")


def page_royal_lid(c):
    size = landscape(A3)
    c.setPageSize(size)
    header(c, "Premium Royal Box - Lid Top", "04 / 1:1 artwork panel", 4, size)
    draw_print_rect(c, 40 * mm, 35 * mm, 340, 220, bg=PLUM, royal=True, title="TOP LID ARTWORK - PREMIUM ROYAL BOX")
    draw_legend(c, 330 * mm, 250 * mm)


def page_royal_sides(c):
    size = landscape(A3)
    c.setPageSize(size)
    header(c, "Premium Royal Box - Side Panels", "05 / 1:1 artwork panels", 5, size)
    draw_print_rect(c, 35 * mm, 146 * mm, 340, 60, bg=PLUM, royal=True, title="LONG FRONT SIDE - 340 x 60 mm", top_logo=True)
    draw_print_rect(c, 35 * mm, 55 * mm, 340, 70, bg=PLUM, royal=True, title="LONG LABEL SIDE - 340 x 70 mm", label_zone=True, top_logo=False)
    c.setFont("CairoSemi", 8)
    c.setFillColor(MUTED)
    c.drawString(35 * mm, 38 * mm, "Premium option uses deep royal plum flood colour. Confirm print proof because dark flood coverage needs supplier approval.")


def page_label_template(c):
    size = landscape(A4)
    c.setPageSize(size)
    header(c, "Barcode Label & Placement", "06 / label template", 6, size)
    panel(c, 20 * mm, 38 * mm, 120 * mm, 128 * mm, "LABEL TEMPLATE")
    draw_label(c, 31 * mm, 62 * mm, 100 * mm, 70 * mm)
    c.setFont("CairoSemi", 8)
    c.setFillColor(MUTED)
    c.drawString(31 * mm, 48 * mm, "Actual label size: 100 x 70 mm")
    panel(c, 152 * mm, 38 * mm, 128 * mm, 128 * mm, "PLACEMENT AND DATA")
    bullet_list(c, [
        "Place the sticker on the long side, right corner, so staff can scan while boxes are stacked.",
        "Barcode links to order ID. QR can open order details or pickup screen.",
        "Fields required: ORDER, CUSTOMER, SHOES QTY, SERVICE, SHELF, DATE.",
        "Use water-resistant matte sticker stock.",
        "Do not print variable data on the box itself; print it on the sticker at packing time."
    ], 164 * mm, 142 * mm, 100 * mm, 8.2, 3.5)


def page_manufacturing_notes(c):
    size = landscape(A4)
    c.setPageSize(size)
    header(c, "Manufacturing Notes", "07 / supplier handoff", 7, size)
    panel(c, 20 * mm, 40 * mm, 124 * mm, 132 * mm, "PRODUCTION SPEC")
    bullet_list(c, [
        "Recommended material: rigid greyboard 1.5-2.0 mm wrapped with printed paper, or laminated E-flute corrugated board.",
        "Finish: matte lamination. Spot UV on logo is optional after first proof.",
        "Colour references: Deep Royal Plum #21002F, Royal Purple #8F00FF, Satin Violet #C026D3, Brushed Silver #B9BDC7.",
        "Keep the original logo shape unchanged. Only colour conversion is allowed.",
        "Supplier to add final die-cut, fold, glue and tuck lines according to their production method.",
        "Request one physical sample before bulk printing."
    ], 32 * mm, 148 * mm, 96 * mm, 7.8, 3.3)
    panel(c, 156 * mm, 40 * mm, 124 * mm, 132 * mm, "DELIVERY CHECKLIST")
    bullet_list(c, [
        "Confirm final box size: 340 x 220 x 130 mm.",
        "Confirm if lid and base are separate pieces or single folding box.",
        "Confirm CMYK proof against royal brand palette.",
        "Confirm barcode sticker stock and printer compatibility.",
        "Confirm the label side faces outward when boxes are stacked in the shoes cabinet.",
        "Confirm premium royal box cost before deciding bulk use."
    ], 168 * mm, 148 * mm, 96 * mm, 7.8, 3.3)


def build():
    register_fonts()
    recolor_original_logo()
    OUT.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(OUT), pagesize=landscape(A4))
    pages = [page_specs, page_white_lid, page_white_sides, page_royal_lid, page_royal_sides, page_label_template, page_manufacturing_notes]
    for fn in pages:
        fn(c)
        c.showPage()
    c.save()
    print(OUT)
    print(RECOLORED_LOGO)
    print(RECOLORED_LOGO_LIGHT)


if __name__ == "__main__":
    build()
