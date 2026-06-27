from pathlib import Path

from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.colors import HexColor, Color, white
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.utils import ImageReader
from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "output" / "pdf" / "IN_OUT_Laundry_Manual_Ironing_Table_Detail_EN.pdf"
ASSET = ROOT / "output" / "branch_identity"
LOGO = ASSET / "00-primary-logo-royal-purple.png"
FOUR = ASSET / "06-ironing-table-four-side-views.png"
INTERIOR = ASSET / "07-ironing-table-interior-corner-render.png"
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
    c.drawString(34, 10, "IN & OUT LAUNDRY | MANUAL IRONING TABLE DETAIL | 23 JUN 2026 | VERIFY DIMENSIONS ON SITE")
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


def dim_line(c, x1, y1, x2, y2, label, vertical=False, offset=0):
    c.saveState()
    c.setStrokeColor(PLUM)
    c.setLineWidth(0.8)
    c.line(x1, y1, x2, y2)
    if vertical:
        c.line(x1 - 5, y1, x1 + 5, y1)
        c.line(x2 - 5, y2, x2 + 5, y2)
        c.translate((x1 + x2) / 2 - 10 + offset, (y1 + y2) / 2)
        c.rotate(90)
        c.setFont("CairoSemi", 7.4)
        c.setFillColor(PLUM)
        c.drawCentredString(0, 0, label)
    else:
        c.line(x1, y1 - 5, x1, y1 + 5)
        c.line(x2, y2 - 5, x2, y2 + 5)
        c.setFont("CairoSemi", 7.4)
        c.setFillColor(PLUM)
        c.drawCentredString((x1 + x2) / 2, y1 + 7 + offset, label)
    c.restoreState()


def draw_plan(c, x, y):
    s = 0.17
    length = 2400 * s
    depth = 900 * s
    c.setFillColor(Color(0.13, 0, 0.18, 0.06))
    c.roundRect(x, y, length, depth, 18, fill=1, stroke=0)
    c.setStrokeColor(PLUM)
    c.setLineWidth(1.4)
    c.roundRect(x, y, length, depth, 18, fill=0, stroke=1)
    c.setFillColor(white)
    c.roundRect(x + 8, y + 8, length - 16, depth - 16, 16, fill=1, stroke=0)
    c.setStrokeColor(LINE)
    c.roundRect(x + 8, y + 8, length - 16, depth - 16, 16, fill=0, stroke=1)
    c.setFillColor(PLUM)
    c.roundRect(x - 48, y + depth / 2 - 28, 42, 56, 12, fill=1, stroke=0)
    c.roundRect(x + length + 6, y + depth / 2 - 28, 42, 56, 12, fill=1, stroke=0)
    c.setStrokeColor(SILVER)
    c.roundRect(x - 62, y + depth / 2 - 38, 58, 76, 12, fill=0, stroke=1)
    c.roundRect(x + length + 4, y + depth / 2 - 38, 58, 76, 12, fill=0, stroke=1)
    c.setFillColor(PURPLE)
    c.rect(x + 18, y + depth - 18, length - 36, 4, fill=1, stroke=0)
    for i in range(4):
        bx = x + 70 + i * 88
        c.setFillColor(LAV)
        c.roundRect(bx, y + 30, 62, 48, 8, fill=1, stroke=0)
    dim_line(c, x, y - 42, x + length, y - 42, "2400 mm recommended large table")
    dim_line(c, x - 28, y, x - 28, y + depth, "900 mm depth", vertical=True)
    c.setFont("CairoSemi", 7.2)
    c.setFillColor(MUTED)
    c.drawString(x + 72, y + depth + 12, "long padded ironing top")
    c.drawString(x + length - 66, y + depth / 2 + 40, "iron rest")


def draw_front(c, x, y):
    length = 430
    h = 165
    c.setFillColor(FLOOR)
    c.rect(x - 16, y - 8, length + 32, 8, fill=1, stroke=0)
    c.setFillColor(white)
    c.roundRect(x, y + h, length, 24, 12, fill=1, stroke=0)
    c.setStrokeColor(LINE)
    c.roundRect(x, y + h, length, 24, 12, fill=0, stroke=1)
    c.setFillColor(PURPLE)
    c.rect(x + 12, y + h - 5, length - 24, 5, fill=1, stroke=0)
    c.setFillColor(white)
    c.rect(x, y + 18, length, h - 18, fill=1, stroke=0)
    c.setStrokeColor(LINE)
    c.rect(x, y + 18, length, h - 18, fill=0, stroke=1)
    c.setFillColor(PLUM)
    c.rect(x, y, length, 18, fill=1, stroke=0)
    c.setStrokeColor(LINE)
    for i in range(1, 4):
        xx = x + i * length / 4
        c.line(xx, y + 18, xx, y + h - 5)
    for i in range(4):
        bx = x + 16 + i * length / 4
        c.setFillColor(LAV)
        c.roundRect(bx, y + 28, 82, 58, 8, fill=1, stroke=0)
        c.setStrokeColor(LINE)
        c.roundRect(bx, y + 28, 82, 58, 8, fill=0, stroke=1)
    c.setFont("CairoBold", 9)
    c.setFillColor(PLUM)
    c.drawCentredString(x + length / 2, y + 106, "OPEN HOLLOW STORAGE")
    dim_line(c, x, y - 28, x + length, y - 28, "2400 mm")
    dim_line(c, x - 28, y, x - 28, y + h + 24, "900 mm finished height", vertical=True)


def draw_side(c, x, y):
    depth = 170
    h = 165
    c.setFillColor(FLOOR)
    c.rect(x - 16, y - 8, depth + 32, 8, fill=1, stroke=0)
    c.setFillColor(white)
    c.roundRect(x, y + h, depth, 24, 12, fill=1, stroke=0)
    c.setStrokeColor(LINE)
    c.roundRect(x, y + h, depth, 24, 12, fill=0, stroke=1)
    c.setFillColor(white)
    c.rect(x, y + 18, depth, h - 18, fill=1, stroke=0)
    c.setStrokeColor(LINE)
    c.rect(x, y + 18, depth, h - 18, fill=0, stroke=1)
    c.setFillColor(PURPLE)
    c.rect(x + 8, y + h - 5, depth - 16, 5, fill=1, stroke=0)
    c.setFillColor(PLUM)
    c.rect(x, y, depth, 18, fill=1, stroke=0)
    c.setFillColor(LAV)
    c.roundRect(x + 48, y + 34, 74, 58, 8, fill=1, stroke=0)
    c.setStrokeColor(SILVER)
    c.roundRect(x - 34, y + h + 8, 52, 30, 9, fill=0, stroke=1)
    c.setFillColor(PLUM)
    c.roundRect(x - 28, y + h + 12, 42, 20, 8, fill=1, stroke=0)
    dim_line(c, x, y - 28, x + depth, y - 28, "900 mm")
    dim_line(c, x - 28, y, x - 28, y + h + 24, "900 mm", vertical=True)


def page_cover(c):
    header(c, "Manual Ironing Table Redesign", "01 / design correction", 1)
    fit_image(c, INTERIOR, 34, 112, 500, 350, 16)
    c.setFillColor(Color(0.13, 0, 0.18, 0.88))
    c.roundRect(54, 130, 350, 88, 12, fill=1, stroke=0)
    wrap_text(c, "A cleaner version of the actual large hollow ironing table: white padded top, open organized underside, heat-safe iron pads, tool holders and royal purple brand details.", 72, 184, 306, 8.4, white, "Cairo", 12)
    panel(c, 560, 292, 224, 170, "CORE IDEA")
    bullet_list(c, [
        "Keep the table large and hollow/open inside.",
        "Make the inside organized with divided shelves and removable bins.",
        "Keep the surface plain white, padded and easy to replace.",
        "Add safe iron rest pads at both ends.",
        "Use subtle IN & OUT royal identity accents."
    ], 576, 414, 190, 8.2, 4)
    panel(c, 560, 112, 224, 150, "RECOMMENDED SIZE")
    bullet_list(c, [
        "Large working version: 2400 L x 900 D x 900 H mm.",
        "If site is tight, reduce length to match final floor plan.",
        "Final dimensions must be checked on site before fabrication."
    ], 576, 216, 190, 8.2, 4)


def page_views(c):
    header(c, "All-Side Visual Direction", "02 / all sides", 2)
    fit_image(c, FOUR, 34, 70, 750, 400, 14, contain=True)
    wrap_text(c, "Use this as the visual target for the joinery and metal fabricator. The table remains practical: open inside, easy to clean, and strong enough for daily ironing work.", 44, 52, 720, 8.2, MUTED, "CairoSemi", 12)


def page_plan(c):
    header(c, "Top Plan & Working Zones", "03 / footprint", 3)
    panel(c, 34, 90, 530, 378, "INDICATIVE TOP PLAN")
    draw_plan(c, 88, 230)
    panel(c, 594, 292, 190, 176, "TOP SURFACE")
    bullet_list(c, [
        "Replaceable white ironing cover over heat-resistant padding.",
        "Soft rounded corners to avoid fabric snagging.",
        "No loose cloth hanging below the top edge.",
        "Iron rest pads must be heat resistant and fixed securely."
    ], 610, 416, 158, 7.8, 4)
    panel(c, 594, 90, 190, 166, "WORKFLOW")
    bullet_list(c, [
        "Clean folded items in bins below.",
        "Spray bottles and tags fixed on side holders.",
        "Power cable routed through clips, not across the floor.",
        "Leave clear movement space around both long sides."
    ], 610, 205, 158, 7.8, 4)


def page_elevations(c):
    header(c, "Front, Back & Side Elevations", "04 / dimensions", 4)
    panel(c, 34, 238, 520, 230, "FRONT / BACK ELEVATION")
    draw_front(c, 74, 268)
    panel(c, 594, 238, 190, 230, "LEFT / RIGHT SIDE")
    draw_side(c, 608, 268)
    panel(c, 34, 82, 750, 118, "ELEVATION NOTES")
    bullet_list(c, [
        "Open hollow storage should stay visible and clean; avoid turning it into a fully closed cabinet.",
        "Use four internal bays for bins or folded linens. Minimum clear bay width: 450-500 mm.",
        "Recommended clear storage height below top rail: 520-600 mm.",
        "Use adjustable stainless feet for leveling and easy floor cleaning.",
        "Use deep royal plum lower skirting only as an accent, not as a heavy closed base."
    ], 54, 164, 704, 8.1, 4)


def page_materials(c):
    header(c, "Materials & Hollow Storage Detail", "05 / fabrication", 5)
    panel(c, 34, 92, 355, 376, "TYPICAL SECTION")
    x, y = 115, 145
    c.setFillColor(FLOOR)
    c.rect(x - 35, y - 8, 230, 8, fill=1, stroke=0)
    c.setFillColor(PLUM)
    c.rect(x, y, 160, 16, fill=1, stroke=0)
    c.setFillColor(white)
    c.rect(x, y + 16, 160, 130, fill=1, stroke=0)
    c.setStrokeColor(LINE)
    c.rect(x, y + 16, 160, 130, fill=0, stroke=1)
    c.setFillColor(PURPLE)
    c.rect(x + 8, y + 132, 144, 5, fill=1, stroke=0)
    c.setFillColor(white)
    c.roundRect(x - 7, y + 146, 174, 22, 11, fill=1, stroke=0)
    c.setStrokeColor(LINE)
    c.roundRect(x - 7, y + 146, 174, 22, 11, fill=0, stroke=1)
    c.setFillColor(LAV)
    c.roundRect(x + 40, y + 35, 80, 52, 8, fill=1, stroke=0)
    labels = [
        (y + 158, "replaceable white ironing cover + heat padding"),
        (y + 134, "royal purple trim / optional LED-safe accent"),
        (y + 88, "open hollow shelf with removable bin"),
        (y + 8, "deep plum kick strip + adjustable feet"),
    ]
    c.setStrokeColor(PLUM)
    for yy, label in labels:
        c.line(x + 172, yy, x + 235, yy + 16)
        c.setFont("CairoSemi", 7.2)
        c.setFillColor(PLUM)
        c.drawString(x + 240, yy + 12, label)
    dim_line(c, x - 28, y, x - 28, y + 168, "900 mm", vertical=True)
    dim_line(c, x, y - 24, x + 160, y - 24, "900 mm depth")
    panel(c, 430, 286, 354, 182, "MATERIAL SCHEDULE")
    rows = [
        ("Frame", "White powder-coated steel / compact board", "Moisture resistant"),
        ("Top", "Heat-resistant padding + white cover", "Replaceable cover"),
        ("Shelves", "White HPL / compact laminate", "Wipe-clean"),
        ("Accent", "Royal purple trim", "#8F00FF"),
        ("Feet", "Adjustable stainless leveling feet", "Easy floor cleaning"),
    ]
    ty = 430
    c.setFont("CairoBold", 7.2)
    c.setFillColor(PLUM)
    c.drawString(446, ty, "ITEM")
    c.drawString(512, ty, "MATERIAL")
    c.drawString(665, ty, "NOTE")
    ty -= 18
    c.setFont("Cairo", 7)
    for a, b, d in rows:
        c.setFillColor(LINE)
        c.line(446, ty + 11, 762, ty + 11)
        c.setFillColor(INK)
        c.drawString(446, ty, a)
        c.drawString(512, ty, b)
        c.drawString(665, ty, d)
        ty -= 24
    panel(c, 430, 92, 354, 160, "FABRICATION RULES")
    bullet_list(c, [
        "No exposed sharp metal edges near fabric path.",
        "All bins removable for cleaning.",
        "Iron pads fixed mechanically, not loose.",
        "Power route clipped under the top or side frame.",
        "Do not store chemicals directly under hot iron zones."
    ], 446, 204, 310, 8, 4)


def page_handover(c):
    header(c, "Joinery & Site Handover", "06 / coordination", 6)
    panel(c, 34, 292, 750, 176, "WHAT TO CONFIRM BEFORE FABRICATION")
    bullet_list(c, [
        "Confirm final table length against the actual branch plan and circulation around both ironing tables.",
        "Confirm iron type, iron rest size, cable route, socket location and heat pad material.",
        "Confirm number and size of removable bins, folded-cloth shelf height and tag holder position.",
        "Confirm top cover fabric, padding thickness, cleaning method and replacement process.",
        "Build one corner/side mock-up for approval before producing both tables."
    ], 54, 414, 700, 8.4, 5)
    panel(c, 34, 82, 360, 170, "OWNER APPROVAL")
    bullet_list(c, [
        "Approve large table size or reduced site-fit size.",
        "Approve open hollow storage layout.",
        "Approve purple trim and logo placement.",
        "Approve iron rest and spray bottle holder details."
    ], 54, 202, 312, 8.2, 4)
    panel(c, 424, 82, 360, 170, "SAFETY NOTES")
    bullet_list(c, [
        "Keep hot irons away from stored fabrics and chemicals.",
        "Use heat-resistant surfaces at both ends.",
        "Provide cable strain relief and avoid floor cables.",
        "Keep floor below table easy to clean and inspect."
    ], 444, 202, 312, 8.2, 4)


def build():
    register_fonts()
    OUT.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(OUT), pagesize=landscape(A4))
    for fn in [page_cover, page_views, page_plan, page_elevations, page_materials, page_handover]:
        fn(c)
        c.showPage()
    c.save()
    print(OUT)


if __name__ == "__main__":
    build()
