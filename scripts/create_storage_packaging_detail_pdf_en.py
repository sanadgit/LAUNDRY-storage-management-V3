from pathlib import Path

from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.colors import HexColor, Color, white
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.utils import ImageReader
from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "output" / "pdf" / "IN_OUT_Laundry_Storage_Packaging_Detail_EN.pdf"
ASSET = ROOT / "output" / "branch_identity"
LOGO = ASSET / "00-primary-logo-royal-purple.png"
BAGS = ASSET / "11-folded-clothes-bag-barcode-storage.png"
GLASS = ASSET / "12-glass-caps-shoes-storage-entry.png"
SHOEBOX = ASSET / "13-shoe-box-packaging-barcode-label.png"
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
    c.drawString(34, 10, "IN & OUT LAUNDRY | STORAGE & PACKAGING DETAIL | 23 JUN 2026 | VERIFY FINAL SITE DIMENSIONS")
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


def pill(c, text, x, y, w):
    c.setFillColor(PLUM)
    c.roundRect(x, y, w, 24, 12, fill=1, stroke=0)
    c.setFont("CairoSemi", 8)
    c.setFillColor(white)
    c.drawCentredString(x + w / 2, y + 7, text)


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


def label_mockup(c, x, y, w=250, h=138, title="FOLDED QTY", qty="04 PCS", kind="FOLDED CLOTHES"):
    c.setFillColor(white)
    c.roundRect(x, y, w, h, 12, fill=1, stroke=0)
    c.setStrokeColor(LINE)
    c.roundRect(x, y, w, h, 12, fill=0, stroke=1)
    c.setFillColor(PALE)
    c.rect(x + 1, y + h - 36, w - 2, 28, fill=1, stroke=0)
    c.setFont("CairoBold", 9)
    c.setFillColor(PLUM)
    c.drawString(x + 14, y + h - 27, "IN & OUT LAUNDRY LABEL")
    rows = [("ORDER", "100568"), ("CUSTOMER", "John Smith"), (title, qty), ("SERVICE", kind), ("SHELF", "A-03"), ("DATE", "AUTO")]
    yy = y + h - 52
    for k, v in rows:
        c.setFont("CairoSemi", 7.4)
        c.setFillColor(INK)
        c.drawString(x + 14, yy, k)
        c.drawString(x + 76, yy, ":")
        c.setFont("CairoBold" if k == title else "Cairo", 7.4)
        c.setFillColor(PLUM if k == title else INK)
        c.drawString(x + 88, yy, v)
        yy -= 13
    barcode(c, x + 14, y + 12, 140, 32)
    c.setStrokeColor(INK)
    c.rect(x + w - 54, y + 12, 32, 32, fill=0, stroke=1)
    c.line(x + w - 54, y + 28, x + w - 22, y + 28)
    c.line(x + w - 38, y + 12, x + w - 38, y + 44)


def draw_glass_plan(c, x, y):
    s = 0.18
    cap_w, shoe_w = 900 * s, 1000 * s
    depth = 420 * s
    gap = 35
    c.setFillColor(Color(0.56, 0, 1, 0.05))
    c.roundRect(x - 35, y - 35, cap_w + shoe_w + gap + 70, depth + 70, 12, fill=1, stroke=0)
    c.setStrokeColor(LINE)
    c.roundRect(x - 35, y - 35, cap_w + shoe_w + gap + 70, depth + 70, 12, fill=0, stroke=1)
    for name, w, color in [("CAPS", cap_w, LAV), ("SHOES", shoe_w, PALE)]:
        c.setFillColor(color)
        c.roundRect(x, y, w, depth, 8, fill=1, stroke=0)
        c.setStrokeColor(PLUM)
        c.roundRect(x, y, w, depth, 8, fill=0, stroke=1)
        c.setFillColor(PLUM)
        c.rect(x, y, w, 9, fill=1, stroke=0)
        c.setFont("CairoBold", 8)
        c.setFillColor(PLUM)
        c.drawCentredString(x + w / 2, y + depth / 2, name)
        x += w + gap
    dim_line(c, x - shoe_w - gap - cap_w - 35 + 35, y - 28, x - shoe_w - gap - cap_w - 35 + 35 + cap_w, y - 28, "900 mm caps")
    dim_line(c, x - shoe_w, y - 28, x, y - 28, "1000 mm shoes")
    dim_line(c, x + 22, y, x + 22, y + depth, "420 mm depth", vertical=True)


def page_cover(c):
    header(c, "Storage & Packaging System", "01 / storage concept", 1)
    fit_image(c, GLASS, 34, 112, 500, 350, 16)
    c.setFillColor(Color(0.13, 0, 0.18, 0.88))
    c.roundRect(54, 130, 350, 82, 12, fill=1, stroke=0)
    wrap_text(c, "A complete customer-facing storage system: frosted folded-clothes bags, barcode labels, glass caps storage and glass shoes storage near the entry.", 72, 178, 306, 8.4, white, "Cairo", 12)
    panel(c, 560, 294, 224, 168, "COMPONENTS")
    bullet_list(c, [
        "Folded clothes: semi-transparent frosted bags with logo.",
        "Dynamic sticker: item quantity, shelf and barcode.",
        "Caps: lockable glass cabinet near entrance.",
        "Shoes: lockable glass cabinet with boxed packaging.",
        "Shoe boxes: standard white plus premium royal option."
    ], 576, 414, 190, 8.1, 4)
    panel(c, 560, 112, 224, 150, "DESIGN RULE")
    bullet_list(c, [
        "Use glass where customers can see clean premium handling.",
        "Use frosted packaging where privacy and cleanliness matter.",
        "Keep all barcode labels generated by the POS/order system."
    ], 576, 216, 190, 8.1, 4)


def page_bags(c):
    header(c, "Folded Clothes Bag System", "02 / folded clothes", 2)
    fit_image(c, BAGS, 34, 96, 470, 350, 14)
    panel(c, 534, 286, 250, 182, "BAG SPECIFICATION")
    bullet_list(c, [
        "Milky/frosted semi-transparent reusable pouch.",
        "Purple zip closure or adhesive seal.",
        "Logo centered on front, approx. 120-160 mm wide.",
        "Sticker placed top-right for scanning without moving package.",
        "Shelf code shown clearly: A-01, A-02, B-01, etc."
    ], 550, 414, 216, 8.1, 4)
    panel(c, 534, 96, 250, 156, "RECOMMENDED SIZES")
    bullet_list(c, [
        "Small: 300 x 400 mm for shirts/accessories.",
        "Medium: 400 x 500 mm for folded garments.",
        "Large: 500 x 650 mm for bulky folded items.",
        "Material: frosted PE/PP or reusable non-woven pouch."
    ], 550, 204, 216, 8.1, 4)


def page_labels(c):
    header(c, "Barcode Label Templates", "03 / stickers", 3)
    panel(c, 34, 238, 360, 230, "FOLDED CLOTHES LABEL")
    label_mockup(c, 78, 278, 270, 150, "FOLDED QTY", "04 PCS", "FOLDED CLOTHES")
    panel(c, 424, 238, 360, 230, "SHOE BOX LABEL")
    label_mockup(c, 468, 278, 270, 150, "SHOES QTY", "1 PAIR", "SHOE CLEANING")
    panel(c, 34, 82, 750, 118, "LABEL DATA RULES")
    bullet_list(c, [
        "Label data should come from the laundry order system, not typed manually.",
        "Minimum label size: 90 x 60 mm for bags; 100 x 70 mm for shoe boxes.",
        "Barcode links to the order ID. QR can open order details or customer pickup screen.",
        "Quantity fields must be prominent: FOLDED QTY for folded clothes and SHOES QTY for shoes.",
        "Shelf code must match physical shelf/cabinet labels."
    ], 54, 164, 704, 8.1, 4)


def page_glass(c):
    header(c, "Glass Storage Near Entrance", "04 / caps and shoes", 4)
    fit_image(c, GLASS, 34, 118, 500, 326, 16)
    panel(c, 564, 278, 220, 166, "CABINET SPEC")
    bullet_list(c, [
        "Tempered glass doors, lockable.",
        "Brushed silver frame with deep-plum fascia.",
        "Internal vertical LED strips, 4000K.",
        "Ventilated lower plinth for shoes cabinet.",
        "Adjustable glass shelves."
    ], 580, 396, 188, 8.1, 4)
    panel(c, 564, 88, 220, 156, "PLACEMENT")
    bullet_list(c, [
        "Install near entrance door from the inside.",
        "Do not block door swing or accessibility route.",
        "Keep visible from reception but secured.",
        "Coordinate with storefront glass and electrical outlets."
    ], 580, 196, 188, 8.1, 4)


def page_plan(c):
    header(c, "Storage Footprint & Elevation", "05 / dimensions", 5)
    panel(c, 34, 92, 520, 376, "INDICATIVE PLAN")
    draw_glass_plan(c, 125, 270)
    c.setFont("CairoBold", 9)
    c.setFillColor(PLUM)
    c.drawString(82, 210, "ELEVATION")
    x, y = 100, 132
    cap_w, shoe_w, h, gap = 145, 160, 220, 35
    for label, w in [("CAPS STORAGE", cap_w), ("SHOES STORAGE", shoe_w)]:
        c.setFillColor(Color(1, 1, 1, 0.9))
        c.roundRect(x, y, w, h, 8, fill=1, stroke=0)
        c.setStrokeColor(PLUM)
        c.roundRect(x, y, w, h, 8, fill=0, stroke=1)
        c.setFillColor(PLUM)
        c.rect(x, y + h - 32, w, 32, fill=1, stroke=0)
        c.setFont("CairoBold", 7.2)
        c.setFillColor(white)
        c.drawCentredString(x + w / 2, y + h - 21, label)
        c.setStrokeColor(LINE)
        for i in range(1, 5):
            c.line(x + 10, y + i * 34, x + w - 10, y + i * 34)
        x += w + gap
    dim_line(c, 82, y, 82, y + h, "2200 mm", vertical=True)
    dim_line(c, 100, y - 26, 100 + cap_w, y - 26, "900 mm")
    dim_line(c, 100 + cap_w + gap, y - 26, 100 + cap_w + gap + shoe_w, y - 26, "1000 mm")
    panel(c, 584, 270, 200, 198, "DIMENSION BASIS")
    bullet_list(c, [
        "Caps cabinet: 900 W x 420 D x 2200 H mm.",
        "Shoes cabinet: 1000 W x 450 D x 2200 H mm.",
        "Final width may adjust to door/wall condition.",
        "Allow 900 mm clear walkway in front."
    ], 600, 416, 168, 7.8, 4)
    panel(c, 584, 92, 200, 142, "SAFETY")
    bullet_list(c, [
        "Use tempered glass and soft-close locks.",
        "Anchor cabinets to wall/floor.",
        "Keep shoe cabinet ventilated.",
        "No sharp shelf edges."
    ], 600, 190, 168, 7.8, 4)


def page_shoebox(c):
    header(c, "Shoe Box Packaging", "06 / shoe packaging", 6)
    fit_image(c, SHOEBOX, 34, 96, 500, 350, 14)
    panel(c, 564, 286, 220, 182, "PACKAGING DECISION")
    bullet_list(c, [
        "Use white box as the standard option: cleaner, brighter and easier to print.",
        "Use deep royal plum box as premium/VIP option.",
        "Add barcode sticker on side for scanning while stacked.",
        "Use branded tissue paper inside the box."
    ], 580, 414, 188, 8.1, 4)
    panel(c, 564, 96, 220, 156, "BOX SIZES")
    bullet_list(c, [
        "Standard adult: 340 x 220 x 130 mm.",
        "Large shoes: 380 x 260 x 150 mm.",
        "Kids/small: 280 x 180 x 110 mm.",
        "Material: rigid white carton or laminated corrugated board."
    ], 580, 204, 188, 8.1, 4)


def page_handover(c):
    header(c, "Supplier & Engineer Handover", "07 / handover", 7)
    panel(c, 34, 292, 750, 176, "WHAT TO PRODUCE NEXT")
    bullet_list(c, [
        "Final cabinet shop drawings after measuring the entrance wall, door swing and storefront glass.",
        "Artwork files for bag print, shoe box print and barcode label template.",
        "POS/order system mapping: order ID, customer, quantity, shelf code, barcode and pickup status.",
        "Material samples: frosted pouch, white carton, royal plum carton, glass frame, LED strip.",
        "Prototype one folded-clothes bag and one shoe box before bulk production.",
        "Confirm shelf coding system with the operational clothes sorting workflow."
    ], 54, 414, 700, 8.4, 5)
    panel(c, 34, 82, 360, 170, "APPROVAL POINTS")
    bullet_list(c, [
        "Approve bag opacity and logo size.",
        "Approve label fields and barcode format.",
        "Approve glass cabinet location near door.",
        "Approve standard white and premium royal shoe boxes."
    ], 54, 202, 312, 8.2, 4)
    panel(c, 424, 82, 360, 170, "OPERATIONS NOTES")
    bullet_list(c, [
        "Folded bags must scan without removing from shelf.",
        "Caps and shoes storage must be lockable.",
        "Boxes should be stacked with labels facing out.",
        "Shelf codes should match the LED sorting/address system."
    ], 444, 202, 312, 8.2, 4)


def build():
    register_fonts()
    OUT.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(OUT), pagesize=landscape(A4))
    for fn in [page_cover, page_bags, page_labels, page_glass, page_plan, page_shoebox, page_handover]:
        fn(c)
        c.showPage()
    c.save()
    print(OUT)


if __name__ == "__main__":
    build()
