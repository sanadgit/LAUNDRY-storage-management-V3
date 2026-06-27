from pathlib import Path

from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.colors import HexColor, Color, white
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.utils import ImageReader
from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "output" / "pdf" / "IN_OUT_Laundry_Garment_Conveyor_Detail_EN.pdf"
ASSET = ROOT / "output" / "branch_identity"
REF = ROOT / "tmp" / "conveyor-reference.png"
LOGO = ASSET / "00-primary-logo-royal-purple.png"
FOUR = ASSET / "04-conveyor-four-side-views.png"
INTERIOR = ASSET / "05-conveyor-interior-render-white-bags.png"
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
    c.drawString(34, 10, "IN & OUT LAUNDRY | GARMENT CONVEYOR DETAIL | 23 JUN 2026 | VERIFY SUPPLIER DIMENSIONS")
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


def draw_top_plan(c, x, y):
    # Indicative footprint derived from the submitted plan and supplier-style reference.
    s = 0.14
    length = 2540 * s
    width = 800 * s
    clear_len = 2850 * s
    clear_w = 1000 * s
    c.setStrokeColor(LINE)
    c.setFillColor(Color(0.56, 0, 1, 0.05))
    c.roundRect(x - (clear_len - length) / 2, y - (clear_w - width) / 2, clear_len, clear_w, 12, fill=1, stroke=1)
    c.setFillColor(Color(0.13, 0, 0.18, 0.08))
    c.roundRect(x, y, length, width, 28, fill=1, stroke=1)
    c.setStrokeColor(PLUM)
    c.setLineWidth(3)
    c.roundRect(x + 12, y + 12, length - 24, width - 24, 20, fill=0, stroke=1)
    c.setStrokeColor(PURPLE)
    c.setLineWidth(1.5)
    c.roundRect(x + 22, y + 22, length - 44, width - 44, 16, fill=0, stroke=1)
    c.setFillColor(PLUM)
    for px in [x + 70, x + length - 70]:
        c.rect(px - 7, y - 28, 14, width + 56, fill=1, stroke=0)
        c.roundRect(px - 42, y - 42, 84, 14, 5, fill=1, stroke=0)
        c.roundRect(px - 42, y + width + 28, 84, 14, 5, fill=1, stroke=0)
    c.setFillColor(white)
    c.roundRect(x + length - 105, y + width - 58, 72, 40, 8, fill=1, stroke=0)
    c.setFont("CairoSemi", 7)
    c.setFillColor(MUTED)
    c.drawString(x + length - 96, y + width - 37, "MOTOR")
    dim_line(c, x, y - 62, x + length, y - 62, "2540 mm machine zone")
    dim_line(c, x - 58, y, x - 58, y + width, "800 mm bag width", vertical=True)
    dim_line(c, x - (clear_len - length) / 2, y + width + 56, x - (clear_len - length) / 2 + clear_len, y + width + 56, "2850 mm service envelope")


def draw_front_elevation(c, x, y):
    rail_y = y + 195
    floor_y = y + 30
    length = 410
    c.setFillColor(FLOOR)
    c.rect(x - 15, floor_y - 8, length + 30, 8, fill=1, stroke=0)
    c.setFillColor(PLUM)
    c.roundRect(x, rail_y, length, 18, 9, fill=1, stroke=0)
    c.setFillColor(PURPLE)
    c.rect(x + 10, rail_y - 5, length - 20, 4, fill=1, stroke=0)
    c.setStrokeColor(SILVER)
    c.setLineWidth(1)
    for i in range(29):
        xx = x + 14 + i * (length - 28) / 28
        c.line(xx, rail_y - 5, xx, rail_y - 22)
        c.circle(xx, rail_y - 27, 2.3, stroke=1, fill=0)
    c.setFillColor(PLUM)
    for xx in [x + 55, x + length - 55]:
        c.rect(xx - 5, floor_y, 10, rail_y - floor_y, fill=1, stroke=0)
        c.roundRect(xx - 45, floor_y - 12, 90, 12, 5, fill=1, stroke=0)
    c.roundRect(x + length - 105, rail_y + 18, 84, 48, 10, fill=1, stroke=0)
    c.setFillColor(white)
    for i in range(15):
        bx = x + 22 + i * 25
        c.roundRect(bx, rail_y - 138, 34, 120, 12, fill=1, stroke=0)
        c.setStrokeColor(LINE)
        c.roundRect(bx, rail_y - 138, 34, 120, 12, fill=0, stroke=1)
        if i % 3 == 0:
            c.setFont("CairoBold", 5.2)
            c.setFillColor(PLUM)
            c.drawCentredString(bx + 17, rail_y - 78, "&")
            c.setFont("CairoSemi", 3.7)
            c.drawCentredString(bx + 17, rail_y - 88, "IN & OUT")
            c.setFillColor(white)
    dim_line(c, x, floor_y - 30, x + length, floor_y - 30, "2540 mm indicative")
    dim_line(c, x - 32, floor_y, x - 32, rail_y + 66, "2200-2300 mm overall", vertical=True)
    dim_line(c, x + length + 22, rail_y - 138, x + length + 22, rail_y - 18, "1300-1500 mm bag", vertical=True)


def draw_side_elevation(c, x, y):
    rail_y = y + 190
    floor_y = y + 30
    width = 165
    c.setFillColor(FLOOR)
    c.rect(x - 20, floor_y - 8, width + 40, 8, fill=1, stroke=0)
    c.setFillColor(PLUM)
    c.roundRect(x, rail_y, width, 18, 9, fill=1, stroke=0)
    c.roundRect(x + 38, rail_y + 18, 88, 52, 10, fill=1, stroke=0)
    c.setFillColor(PURPLE)
    c.rect(x + 10, rail_y - 5, width - 20, 4, fill=1, stroke=0)
    c.setFillColor(PLUM)
    c.rect(x + width / 2 - 5, floor_y, 10, rail_y - floor_y, fill=1, stroke=0)
    c.roundRect(x + width / 2 - 58, floor_y - 12, 116, 12, 5, fill=1, stroke=0)
    c.setFillColor(white)
    for i in range(5):
        bx = x + 26 + i * 23
        c.roundRect(bx, rail_y - 132, 40, 115, 12, fill=1, stroke=0)
        c.setStrokeColor(LINE)
        c.roundRect(bx, rail_y - 132, 40, 115, 12, fill=0, stroke=1)
    dim_line(c, x, floor_y - 30, x + width, floor_y - 30, "800-900 mm")
    dim_line(c, x - 28, floor_y, x - 28, rail_y + 70, "2200-2300 mm", vertical=True)


def page_cover(c):
    header(c, "Garment Conveyor Correction", "01 / reference and intent", 1)
    panel(c, 34, 112, 250, 350, "SOURCE REFERENCE")
    fit_image(c, REF, 54, 140, 210, 280, 10, contain=True)
    panel(c, 314, 112, 470, 350, "CORRECTED DESIGN INTENT")
    fit_image(c, INTERIOR, 334, 215, 430, 215, 14)
    c.setFillColor(Color(0.13, 0, 0.18, 0.88))
    c.roundRect(334, 130, 430, 70, 12, fill=1, stroke=0)
    wrap_text(c, "The conveyor must follow the supplied machine reference: overhead track, rounded end, top motor housing, hook chain and T-shaped floor supports. All hanging garments are replaced with long white branded garment bags.", 352, 176, 390, 8.4, white, "Cairo", 12)
    for text, x, w in [("REFERENCE-BASED SHAPE", 34, 170), ("WHITE LONG BAGS", 218, 130), ("IN & OUT LOGO", 360, 124), ("ROYAL PLUM FRAME", 495, 150), ("SERVICE ENVELOPE", 656, 128)]:
        pill(c, text, x, 74, w)


def page_four_views(c):
    header(c, "Four-Side Visual Direction", "02 / all sides", 2)
    fit_image(c, FOUR, 34, 78, 750, 390, 14, contain=True)
    wrap_text(c, "Use this page as the visual target for the supplier and interior contractor. Exact mechanism, chain pitch and capacity must follow the selected conveyor model.", 44, 54, 720, 8.3, MUTED, "CairoSemi", 12)


def page_plan(c):
    header(c, "Footprint & Plan Coordination", "03 / top plan", 3)
    panel(c, 34, 90, 520, 378, "INDICATIVE TOP PLAN")
    draw_top_plan(c, 90, 240)
    panel(c, 584, 288, 200, 180, "PLAN RULES")
    bullet_list(c, [
        "Place the conveyor in the planned production zone beside the wall.",
        "Keep customer-facing circulation visually clean; avoid blocking reception sightline.",
        "Allow service access to motor cover and chain inspection points.",
        "Do not fix wall cabinets or lighting where they block conveyor movement."
    ], 600, 416, 168, 7.8, 4)
    panel(c, 584, 90, 200, 166, "DIMENSION BASIS")
    bullet_list(c, [
        "Machine zone shown: approx. 2540 x 800 mm.",
        "Service envelope: approx. 2850 x 1000 mm.",
        "Final dimensions depend on supplier model and hook capacity.",
        "Verify ceiling, lights, AC and wall clearance on site."
    ], 600, 205, 168, 7.8, 4)


def page_elevations(c):
    header(c, "Front, Back & Side Elevations", "04 / dimensions", 4)
    panel(c, 34, 245, 510, 223, "FRONT / BACK ELEVATION")
    draw_front_elevation(c, 82, 258)
    panel(c, 584, 245, 200, 223, "LEFT / RIGHT SIDE")
    draw_side_elevation(c, 602, 258)
    panel(c, 34, 82, 750, 126, "ELEVATION NOTES")
    bullet_list(c, [
        "Overall height should typically sit around 2200-2300 mm, subject to supplier model and ceiling height.",
        "Bottom of garment bags should remain at least 150 mm above finished floor for cleaning and airflow.",
        "Use deep royal plum powder coating or approved HPL/paint finish for visible frame parts.",
        "Use brushed silver or stainless hooks, chain and exposed hardware. Keep moving parts serviceable.",
        "Add a subtle purple LED line only if it does not interfere with maintenance or safety."
    ], 54, 172, 704, 8.1, 4)


def page_bags_branding(c):
    header(c, "White Garment Bag Branding", "05 / bags and logo", 5)
    panel(c, 34, 92, 345, 376, "BAG MOCKUP")
    bx, by = 150, 145
    c.setFillColor(white)
    c.roundRect(bx, by, 112, 245, 28, fill=1, stroke=0)
    c.setStrokeColor(LINE)
    c.roundRect(bx, by, 112, 245, 28, fill=0, stroke=1)
    c.setFillColor(PLUM)
    c.circle(bx + 56, by + 158, 24, fill=0, stroke=1)
    c.setFont("CairoBold", 32)
    c.drawCentredString(bx + 56, by + 145, "&")
    c.setFont("CairoBold", 11)
    c.drawCentredString(bx + 56, by + 115, "IN & OUT")
    c.setFont("CairoSemi", 7)
    c.setFillColor(SILVER)
    c.drawCentredString(bx + 56, by + 101, "LAUNDRY")
    dim_line(c, bx - 26, by, bx - 26, by + 245, "1300-1500 mm", vertical=True)
    dim_line(c, bx, by - 30, bx + 112, by - 30, "550-650 mm")
    panel(c, 430, 292, 354, 176, "BAG SPECIFICATION")
    bullet_list(c, [
        "Long opaque white garment bag. Avoid transparent plastic for the premium reception look.",
        "Logo centered on upper-middle front area, printed in royal plum and purple.",
        "Suggested logo print width: 220-300 mm depending on bag size.",
        "Use breathable but clean-looking material if garments remain bagged for long periods."
    ], 446, 416, 310, 8, 4)
    panel(c, 430, 92, 354, 166, "VISUAL RULES")
    bullet_list(c, [
        "All visible hanging items on the conveyor should read as white branded bags.",
        "No mixed random colours facing the customer route.",
        "Keep barcode or order tag small and on the side or lower rear.",
        "Logo must use the refreshed circular IN & OUT mark from the identity package."
    ], 446, 208, 310, 8, 4)


def page_handover(c):
    header(c, "Supplier & Contractor Handover", "06 / coordination", 6)
    panel(c, 34, 292, 750, 176, "WHAT TO CONFIRM BEFORE ORDERING")
    bullet_list(c, [
        "Exact conveyor model, load capacity, hook count, chain speed and motor power.",
        "Final length, width, turning radius, support positions and floor fixing plate size.",
        "Required power supply, switch location, emergency stop and maintenance access.",
        "Noise level and vibration control suitable for a compact laundry branch.",
        "Clearance between conveyor, wall, ironing tables, cabinets, lighting, sprinklers and AC outlets."
    ], 54, 414, 700, 8.4, 5)
    panel(c, 34, 82, 360, 170, "CONTRACTOR NOTES")
    bullet_list(c, [
        "Do not fabricate surrounding joinery until supplier shop drawing is approved.",
        "Mark motor side and service side clearly on the plan.",
        "Keep the plum frame visible and clean; avoid hiding it behind storage.",
        "Protect moving parts from dust during construction."
    ], 54, 202, 312, 8.2, 4)
    panel(c, 424, 82, 360, 170, "OWNER APPROVAL")
    bullet_list(c, [
        "Approve four-side visual direction.",
        "Approve white bag length and logo size.",
        "Approve exact conveyor supplier model.",
        "Approve final installed position after site measurement."
    ], 444, 202, 312, 8.2, 4)


def build():
    register_fonts()
    OUT.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(OUT), pagesize=landscape(A4))
    for fn in [page_cover, page_four_views, page_plan, page_elevations, page_bags_branding, page_handover]:
        fn(c)
        c.showPage()
    c.save()
    print(OUT)


if __name__ == "__main__":
    build()
