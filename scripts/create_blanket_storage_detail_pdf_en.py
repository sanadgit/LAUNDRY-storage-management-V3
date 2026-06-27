from pathlib import Path

from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.colors import HexColor, Color, white
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.utils import ImageReader
from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "output" / "pdf" / "IN_OUT_Laundry_Overhead_Blanket_Storage_Detail_EN.pdf"
ASSET = ROOT / "output" / "branch_identity"
LOGO = ASSET / "00-primary-logo-royal-purple.png"
OVERHEAD = ASSET / "14-overhead-blanket-storage-above-conveyor.png"
BAG = ASSET / "15-blanket-bag-label-storage.png"
W, H = landscape(A4)

PURPLE = HexColor("#8F00FF")
PLUM = HexColor("#21002F")
VIOLET = HexColor("#C026D3")
PALE = HexColor("#FBF7FF")
LAV = HexColor("#EAD7F7")
SILVER = HexColor("#B9BDC7")
INK = HexColor("#211827")
MUTED = HexColor("#6E6474")
LINE = HexColor("#DDD6E3")
FLOOR = HexColor("#E6E5E8")


def register_fonts():
    pdfmetrics.registerFont(TTFont("Cairo", r"C:\Windows\Fonts\Cairo-Regular.ttf"))
    pdfmetrics.registerFont(TTFont("CairoSemi", r"C:\Windows\Fonts\Cairo-SemiBold.ttf"))
    pdfmetrics.registerFont(TTFont("CairoBold", r"C:\Windows\Fonts\Cairo-Bold.ttf"))


def fit_image(c, path, x, y, w, h, radius=0, contain=False):
    im = Image.open(path)
    iw, ih = im.size
    scale = min(w / iw, h / ih) if contain else max(w / iw, h / ih)
    sw, sh = iw * scale, ih * scale
    dx, dy = x + (w - sw) / 2, y + (h - sh) / 2
    c.saveState()
    p = c.beginPath()
    if radius:
        p.roundRect(x, y, w, h, radius)
    else:
        p.rect(x, y, w, h)
    c.clipPath(p, stroke=0, fill=0)
    c.drawImage(ImageReader(im), dx, dy, sw, sh, mask="auto")
    c.restoreState()


def wrap_text(c, text, x, y, width, size=9, color=INK, font="Cairo", leading=None):
    leading = leading or size * 1.45
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


def bullet_list(c, items, x, y, width, size=8.4, gap=5, color=INK):
    for item in items:
        c.setFillColor(PURPLE)
        c.circle(x + 4, y + 4, 2.1, fill=1, stroke=0)
        y = wrap_text(c, item, x + 15, y, width - 15, size, color, "Cairo", size * 1.45)
        y -= gap
    return y


def footer(c, page):
    c.setStrokeColor(LINE)
    c.line(34, 24, W - 34, 24)
    c.setFont("Cairo", 7)
    c.setFillColor(MUTED)
    c.drawString(34, 10, "IN & OUT LAUNDRY | OVERHEAD BLANKET STORAGE DETAIL | 23 JUN 2026 | VERIFY STRUCTURE ON SITE")
    c.drawRightString(W - 34, 10, str(page))


def header(c, title, kicker, page):
    c.setFillColor(PALE)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    c.setFillColor(PURPLE)
    c.rect(W - 18, 0, 18, H, fill=1, stroke=0)
    c.setFont("CairoSemi", 7.5)
    c.setFillColor(VIOLET)
    c.drawString(34, H - 28, kicker.upper())
    c.setFont("CairoBold", 23)
    c.setFillColor(PLUM)
    c.drawString(34, H - 60, title)
    if LOGO.exists():
        fit_image(c, LOGO, W - 96, H - 74, 48, 48, contain=True)
    footer(c, page)


def panel(c, x, y, w, h, title=None):
    c.setFillColor(white)
    c.roundRect(x, y, w, h, 14, fill=1, stroke=0)
    c.setStrokeColor(LINE)
    c.roundRect(x, y, w, h, 14, fill=0, stroke=1)
    if title:
        c.setFont("CairoBold", 10)
        c.setFillColor(PLUM)
        c.drawString(x + 16, y + h - 24, title)


def dim_line(c, x1, y1, x2, y2, label, vertical=False):
    c.saveState()
    c.setStrokeColor(PLUM)
    c.setLineWidth(0.8)
    c.line(x1, y1, x2, y2)
    if vertical:
        c.line(x1 - 5, y1, x1 + 5, y1)
        c.line(x2 - 5, y2, x2 + 5, y2)
        c.translate((x1 + x2) / 2 - 10, (y1 + y2) / 2)
        c.rotate(90)
        c.setFont("CairoSemi", 7.4)
        c.setFillColor(PLUM)
        c.drawCentredString(0, 0, label)
    else:
        c.line(x1, y1 - 5, x1, y1 + 5)
        c.line(x2, y2 - 5, x2, y2 + 5)
        c.setFont("CairoSemi", 7.4)
        c.setFillColor(PLUM)
        c.drawCentredString((x1 + x2) / 2, y1 + 7, label)
    c.restoreState()


def barcode(c, x, y, w, h):
    c.setFillColor(white)
    c.rect(x, y, w, h, fill=1, stroke=0)
    c.setFillColor(INK)
    pos = x + 3
    pattern = [1, 2, 1, 3, 2, 1, 4, 1, 2, 3, 1, 1, 2, 4, 1, 2, 2, 1, 3, 1, 4, 2]
    i = 0
    while pos < x + w - 3:
        bw = pattern[i % len(pattern)]
        c.rect(pos, y + 3, bw, h - 6, fill=1, stroke=0)
        pos += bw + (1 if i % 3 else 2)
        i += 1


def label_mockup(c, x, y, w=300, h=170):
    c.setFillColor(white)
    c.roundRect(x, y, w, h, 12, fill=1, stroke=0)
    c.setStrokeColor(LINE)
    c.roundRect(x, y, w, h, 12, fill=0, stroke=1)
    c.setFillColor(PALE)
    c.rect(x + 1, y + h - 36, w - 2, 28, fill=1, stroke=0)
    c.setFont("CairoBold", 9)
    c.setFillColor(PLUM)
    c.drawString(x + 14, y + h - 27, "BLANKET STORAGE LABEL")
    rows = [
        ("ORDER NO", "100568"),
        ("CUSTOMER NAME", "Omar Ali"),
        ("CUSTOMER PHONE", "050-123-4567"),
        ("SERVICE", "Blanket Cleaning"),
        ("BLANKET QTY", "2"),
        ("TOTAL", "3"),
        ("SHELF", "BL-A02"),
        ("DATE", "AUTO"),
    ]
    yy = y + h - 52
    for k, v in rows:
        c.setFont("CairoSemi", 7.5)
        c.setFillColor(INK)
        c.drawString(x + 14, yy, k)
        c.drawString(x + 92, yy, ":")
        c.setFont("Cairo", 7.5)
        c.drawString(x + 104, yy, v)
        yy -= 13
    c.setFont("CairoBold", 24)
    c.setFillColor(PLUM)
    c.drawRightString(x + w - 18, y + 62, "2 OF 3")
    barcode(c, x + 14, y + 13, 160, 32)
    c.setStrokeColor(INK)
    c.rect(x + w - 56, y + 13, 34, 34, fill=0, stroke=1)
    c.line(x + w - 56, y + 30, x + w - 22, y + 30)
    c.line(x + w - 39, y + 13, x + w - 39, y + 47)


def draw_plan(c, x, y):
    s = 0.13
    total_w = 3800 * s
    depth = 650 * s
    conveyor_w = 2540 * s
    c.setFillColor(Color(0.56, 0, 1, 0.05))
    c.roundRect(x, y + 105, total_w, depth, 12, fill=1, stroke=0)
    c.setStrokeColor(PLUM)
    c.roundRect(x, y + 105, total_w, depth, 12, fill=0, stroke=1)
    for i in range(4):
        xx = x + i * total_w / 4
        c.line(xx, y + 105, xx, y + 105 + depth)
        c.setFillColor(LAV)
        c.roundRect(xx + 10, y + 120, total_w / 4 - 20, depth - 30, 8, fill=1, stroke=0)
    c.setFillColor(Color(0.13, 0, 0.18, 0.12))
    c.roundRect(x + (total_w - conveyor_w) / 2, y, conveyor_w, 55, 18, fill=1, stroke=0)
    c.setStrokeColor(PLUM)
    c.roundRect(x + (total_w - conveyor_w) / 2, y, conveyor_w, 55, 18, fill=0, stroke=1)
    c.setFont("CairoBold", 8)
    c.setFillColor(PLUM)
    c.drawCentredString(x + total_w / 2, y + 145, "OVERHEAD BLANKET STORAGE")
    c.drawCentredString(x + total_w / 2, y + 20, "CONVEYOR BELOW")
    dim_line(c, x, y + 105 + depth + 28, x + total_w, y + 105 + depth + 28, "3800 mm overall run")
    dim_line(c, x - 30, y + 105, x - 30, y + 105 + depth, "650 mm depth", vertical=True)


def page_cover(c):
    header(c, "Overhead Blanket Storage", "01 / blanket storage", 1)
    fit_image(c, OVERHEAD, 34, 112, 500, 350, 16)
    c.setFillColor(Color(0.13, 0, 0.18, 0.88))
    c.roundRect(54, 130, 350, 82, 12, fill=1, stroke=0)
    wrap_text(c, "Blanket storage sits above the conveyor: strong wall/ceiling-supported rack, frosted blanket bags, visible labels and safe front guard rail.", 72, 178, 306, 8.4, white, "Cairo", 12)
    panel(c, 560, 294, 224, 168, "CORE RULES")
    bullet_list(c, [
        "Storage is above the conveyor, not on the floor.",
        "Each blanket goes into a frosted semi-transparent bag.",
        "Every bag has order/customer/phone/barcode/quantity label.",
        "Front guard rail prevents bags from falling.",
        "Do not block conveyor movement or maintenance."
    ], 576, 414, 190, 8.1, 4)
    panel(c, 560, 112, 224, 150, "QUANTITY LOGIC")
    bullet_list(c, [
        "Label must show quantity from total: e.g. 2 OF 3.",
        "Barcode links to order ID.",
        "Shelf code starts with BL for blankets, e.g. BL-A02."
    ], 576, 216, 190, 8.1, 4)


def page_render(c):
    header(c, "Visual Direction Above Conveyor", "02 / 3d view", 2)
    fit_image(c, OVERHEAD, 34, 78, 750, 390, 14, contain=True)
    wrap_text(c, "Use this as the target visual: overhead blanket cubbies above the conveyor, royal plum structure, brushed-silver brackets, LED task strip and labeled bags.", 44, 54, 720, 8.2, MUTED, "CairoSemi", 12)


def page_bag(c):
    header(c, "Blanket Bag & Label System", "03 / packaging", 3)
    fit_image(c, BAG, 34, 96, 500, 350, 14)
    panel(c, 564, 286, 220, 182, "BAG SPECIFICATION")
    bullet_list(c, [
        "Large frosted semi-transparent zipper bag.",
        "Logo printed in royal purple/plum on front.",
        "Label fixed top-right for scanning while stacked.",
        "Material should resist dust, moisture and handling.",
        "Use soft rectangular shape so bags stack safely."
    ], 580, 414, 188, 8.1, 4)
    panel(c, 564, 96, 220, 156, "RECOMMENDED SIZES")
    bullet_list(c, [
        "Single blanket: 600 x 450 x 180 mm.",
        "Large blanket/duvet: 750 x 550 x 220 mm.",
        "Use same label template across sizes.",
        "Do not overfill; bag must close flat."
    ], 580, 204, 188, 8.1, 4)


def page_label(c):
    header(c, "Barcode Label Template", "04 / label", 4)
    panel(c, 34, 132, 380, 300, "REQUIRED LABEL FIELDS")
    label_mockup(c, 72, 188, 300, 170)
    panel(c, 444, 252, 340, 180, "DATA REQUIREMENTS")
    bullet_list(c, [
        "ORDER NO: unique order number from the system.",
        "CUSTOMER NAME: customer display name.",
        "CUSTOMER PHONE: primary mobile number.",
        "SERVICE: Blanket Cleaning / Blanket Packing.",
        "BLANKET QTY and TOTAL: displayed as X OF Y.",
        "SHELF: exact physical blanket shelf code.",
        "BARCODE: links to order detail and pickup status."
    ], 462, 382, 300, 8.1, 4)
    panel(c, 444, 132, 340, 90, "LABEL SIZE")
    bullet_list(c, [
        "Minimum: 100 x 70 mm.",
        "Preferred for blankets: 120 x 80 mm.",
        "Use water-resistant matte sticker."
    ], 462, 180, 300, 8.1, 4)


def page_dimensions(c):
    header(c, "Footprint, Elevation & Safety", "05 / dimensions", 5)
    panel(c, 34, 92, 520, 376, "INDICATIVE PLAN")
    draw_plan(c, 64, 210)
    panel(c, 584, 292, 200, 176, "DIMENSION BASIS")
    bullet_list(c, [
        "Overall run: approx. 3800 mm above conveyor.",
        "Shelf depth: 600-650 mm.",
        "Shelf height: 700-800 mm storage opening.",
        "Bottom of rack should clear conveyor hooks and maintenance path.",
        "Final size follows site ceiling and wall conditions."
    ], 600, 416, 168, 7.8, 4)
    panel(c, 584, 92, 200, 166, "STRUCTURAL SAFETY")
    bullet_list(c, [
        "Wall/ceiling brackets must be engineer-approved.",
        "Do not load on conveyor frame.",
        "Use front guard rail and side stops.",
        "Define max kg per bay before fabrication."
    ], 600, 207, 168, 7.8, 4)


def page_handover(c):
    header(c, "Supplier & Engineer Handover", "06 / handover", 6)
    panel(c, 34, 292, 750, 176, "WHAT TO CONFIRM BEFORE FABRICATION")
    bullet_list(c, [
        "Measure the exact wall/ceiling above the conveyor and check columns, AC, sprinklers and lights.",
        "Confirm conveyor maintenance clearance and hanger movement before fixing the overhead rack.",
        "Confirm structural fixing method, anchors, maximum load per bay and safety guard rail detail.",
        "Approve blanket bag size, frosted material, logo size and label placement.",
        "Connect label fields to the order system so quantity appears as X OF Y automatically.",
        "Prototype one blanket bag and one label before bulk ordering."
    ], 54, 414, 700, 8.4, 5)
    panel(c, 34, 82, 360, 170, "APPROVAL POINTS")
    bullet_list(c, [
        "Approve overhead location above conveyor.",
        "Approve rack dimensions and bay count.",
        "Approve bag opacity and logo size.",
        "Approve label fields and barcode/QR format."
    ], 54, 202, 312, 8.2, 4)
    panel(c, 424, 82, 360, 170, "OPERATIONS NOTES")
    bullet_list(c, [
        "Blanket bags should scan without removing from shelf.",
        "Place heavier blankets on lower overhead level only.",
        "Keep a step/ladder policy for safe access if needed.",
        "Shelf codes must match the sorting/LED shelf system."
    ], 444, 202, 312, 8.2, 4)


def build():
    register_fonts()
    OUT.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(OUT), pagesize=landscape(A4))
    for fn in [page_cover, page_render, page_bag, page_label, page_dimensions, page_handover]:
        fn(c)
        c.showPage()
    c.save()
    print(OUT)


if __name__ == "__main__":
    build()
