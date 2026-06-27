from pathlib import Path
import math

from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.colors import HexColor, Color, white
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.utils import ImageReader
from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "output" / "pdf" / "IN_OUT_Laundry_Counter_Detail_EN.pdf"
ASSET = ROOT / "output" / "branch_identity"
LOGO = ASSET / "00-primary-logo-royal-purple.png"
RENDER = ASSET / "01-reception-counter-3d-logo-v2.png"
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
GREEN = HexColor("#22A06B")


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


def bullet_list(c, items, x, y, width, size=8.6, gap=6, color=INK):
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
    c.drawString(34, 10, "IN & OUT LAUNDRY | COUNTER DETAIL PACKAGE | 23 JUN 2026 | VERIFY ALL DIMENSIONS ON SITE")
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


def pill(c, text, x, y, w, fill=PLUM, stroke=None):
    c.setFillColor(fill)
    c.roundRect(x, y, w, 24, 12, fill=1, stroke=0)
    if stroke:
        c.setStrokeColor(stroke)
        c.roundRect(x, y, w, 24, 12, fill=0, stroke=1)
    c.setFont("CairoSemi", 8)
    c.setFillColor(white)
    c.drawCentredString(x + w / 2, y + 7, text)


def panel(c, x, y, w, h, title=None):
    c.setFillColor(white)
    c.roundRect(x, y, w, h, 14, fill=1, stroke=0)
    c.setStrokeColor(LINE)
    c.roundRect(x, y, w, h, 14, fill=0, stroke=1)
    if title:
        c.setFont("CairoBold", 10)
        c.setFillColor(PLUM)
        c.drawString(x + 16, y + h - 24, title)


def dim_line(c, x1, y1, x2, y2, label, offset=0, vertical=False):
    c.saveState()
    c.setStrokeColor(PLUM)
    c.setLineWidth(0.8)
    c.line(x1, y1, x2, y2)
    if vertical:
        c.line(x1 - 5, y1, x1 + 5, y1)
        c.line(x2 - 5, y2, x2 + 5, y2)
        c.translate((x1 + x2) / 2 - 10 + offset, (y1 + y2) / 2)
        c.rotate(90)
        c.setFont("CairoSemi", 7.5)
        c.setFillColor(PLUM)
        c.drawCentredString(0, 0, label)
    else:
        c.line(x1, y1 - 5, x1, y1 + 5)
        c.line(x2, y2 - 5, x2, y2 + 5)
        c.setFont("CairoSemi", 7.5)
        c.setFillColor(PLUM)
        c.drawCentredString((x1 + x2) / 2, y1 + 7 + offset, label)
    c.restoreState()


def scale_plan(mm, factor=0.105):
    return mm * factor


def draw_counter_top(c, ox, oy):
    # L shaped counter footprint, clockwise from outer corner.
    s = 0.105
    front = 2450 * s
    depth = 700 * s
    ret = 3150 * s
    rad = 80 * s
    c.setStrokeColor(PLUM)
    c.setLineWidth(1.2)
    c.setFillColor(Color(0.13, 0, 0.18, 0.08))
    p = c.beginPath()
    p.moveTo(ox, oy)
    p.lineTo(ox + front - rad, oy)
    p.curveTo(ox + front, oy, ox + front, oy, ox + front, oy + rad)
    p.lineTo(ox + front, oy + ret)
    p.lineTo(ox + front - depth, oy + ret)
    p.lineTo(ox + front - depth, oy + depth)
    p.lineTo(ox, oy + depth)
    p.close()
    c.drawPath(p, fill=1, stroke=1)
    c.setFillColor(PLUM)
    c.rect(ox, oy, front, 5, fill=1, stroke=0)
    c.rect(ox + front - 5, oy, 5, ret, fill=1, stroke=0)
    c.setFillColor(PURPLE)
    c.rect(ox + 5, oy + 11, front - 16, 4, fill=1, stroke=0)
    c.rect(ox + front - 15, oy + 11, 4, ret - 20, fill=1, stroke=0)
    c.setFillColor(white)
    c.roundRect(ox + 55, oy + 22, 95, 42, 5, fill=1, stroke=0)
    c.roundRect(ox + front - depth + 18, oy + 845 * s, 40, 118, 5, fill=1, stroke=0)
    c.setFont("CairoSemi", 7)
    c.setFillColor(MUTED)
    c.drawString(ox + 61, oy + 42, "POS")
    c.drawString(ox + front - depth + 23, oy + 930 * s, "DROP")
    dim_line(c, ox, oy - 24, ox + front, oy - 24, "2450 mm customer front")
    dim_line(c, ox + front + 24, oy, ox + front + 24, oy + ret, "3150 mm side return", vertical=True)
    dim_line(c, ox - 24, oy, ox - 24, oy + depth, "700 mm depth", vertical=True)
    dim_line(c, ox + front - depth, oy + ret + 20, ox + front, oy + ret + 20, "700 mm depth")
    c.setFont("CairoSemi", 7.2)
    c.setFillColor(VIOLET)
    c.drawString(ox + front - 40, oy + 10, "R80 exposed corner")


def draw_front_elevation(c, x, y, w=510, h=220):
    base_y = y + 34
    scale = w / 2450
    height = 1050 * scale
    draw_w = 2450 * scale
    c.setStrokeColor(LINE)
    c.setFillColor(FLOOR)
    c.rect(x + 20, base_y - 10, draw_w + 20, 10, fill=1, stroke=0)
    c.setFillColor(PLUM)
    c.roundRect(x + 30, base_y, draw_w, height, 7, fill=1, stroke=0)
    c.setFillColor(white)
    c.rect(x + 22, base_y + height, draw_w + 16, 40 * scale, fill=1, stroke=0)
    c.setFillColor(PURPLE)
    c.rect(x + 30, base_y + height - 58 * scale, draw_w, 22 * scale, fill=1, stroke=0)
    c.setFillColor(SILVER)
    c.rect(x + 30, base_y, draw_w, 100 * scale, fill=1, stroke=0)
    c.setFillColor(Color(1, 1, 1, 0.14))
    for i in range(7):
        xx = x + 55 + i * (draw_w - 70) / 6
        c.line(xx, base_y + 120 * scale, xx, base_y + height - 90 * scale)
    c.setFillColor(white)
    c.roundRect(x + 310, base_y + 260 * scale, 460 * scale, 520 * scale, 5, fill=1, stroke=0)
    c.setFont("CairoSemi", 7)
    c.setFillColor(PLUM)
    c.drawCentredString(x + 310 + 230 * scale, base_y + 505 * scale, "LOWER SERVICE")
    dim_line(c, x + 30, base_y - 26, x + 30 + draw_w, base_y - 26, "2450 mm")
    dim_line(c, x + 8, base_y, x + 8, base_y + height, "1050 mm", vertical=True)
    c.setFont("CairoBold", 8.3)
    c.setFillColor(PLUM)
    c.drawString(x + 30, y + h - 16, "CUSTOMER FRONT ELEVATION")


def draw_staff_elevation(c, x, y, w=510, h=220):
    base_y = y + 34
    scale = w / 2450
    height = 1050 * scale
    draw_w = 2450 * scale
    c.setFillColor(FLOOR)
    c.rect(x + 20, base_y - 10, draw_w + 20, 10, fill=1, stroke=0)
    c.setFillColor(white)
    c.roundRect(x + 30, base_y, draw_w, height, 7, fill=1, stroke=0)
    c.setStrokeColor(PLUM)
    c.roundRect(x + 30, base_y, draw_w, height, 7, fill=0, stroke=1)
    c.setFillColor(PALE)
    modules = [(0, 480, "POS CPU"), (480, 450, "CASH DRAWER"), (930, 520, "OPEN SHELF"), (1450, 560, "BAGS"), (2010, 440, "CLEANING")]
    for start, width, label in modules:
        xx = x + 30 + start * scale
        ww = width * scale
        c.setFillColor(PALE)
        c.roundRect(xx + 4, base_y + 140 * scale, ww - 8, 700 * scale, 5, fill=1, stroke=0)
        c.setStrokeColor(LINE)
        c.roundRect(xx + 4, base_y + 140 * scale, ww - 8, 700 * scale, 5, fill=0, stroke=1)
        c.setFont("CairoSemi", 6.7)
        c.setFillColor(PLUM)
        c.drawCentredString(xx + ww / 2, base_y + 465 * scale, label)
    c.setFillColor(SILVER)
    c.rect(x + 30, base_y, draw_w, 100 * scale, fill=1, stroke=0)
    c.setFillColor(PURPLE)
    c.rect(x + 55, base_y + height - 74 * scale, draw_w - 50, 18 * scale, fill=1, stroke=0)
    c.setFillColor(PLUM)
    c.circle(x + 190, base_y + height - 150 * scale, 14 * scale, fill=1, stroke=0)
    c.circle(x + 660, base_y + height - 150 * scale, 14 * scale, fill=1, stroke=0)
    c.circle(x + 1140, base_y + height - 150 * scale, 14 * scale, fill=1, stroke=0)
    c.setFont("CairoSemi", 6.7)
    c.setFillColor(MUTED)
    c.drawString(x + 60, base_y + height - 112 * scale, "60 mm cable grommets")
    dim_line(c, x + 30, base_y - 26, x + 30 + draw_w, base_y - 26, "2450 mm")
    dim_line(c, x + 8, base_y, x + 8, base_y + height, "1050 mm", vertical=True)
    c.setFont("CairoBold", 8.3)
    c.setFillColor(PLUM)
    c.drawString(x + 30, y + h - 16, "STAFF SIDE / INTERNAL ELEVATION")


def draw_end_elevation(c, x, y, title):
    base_y = y + 26
    scale = 0.155
    depth = 700 * scale
    height = 1050 * scale
    c.setFillColor(FLOOR)
    c.rect(x + 25, base_y - 10, depth + 22, 10, fill=1, stroke=0)
    c.setFillColor(PLUM)
    c.roundRect(x + 36, base_y, depth, height, 6, fill=1, stroke=0)
    c.setFillColor(SILVER)
    c.rect(x + 36, base_y, depth, 100 * scale, fill=1, stroke=0)
    c.setFillColor(PURPLE)
    c.rect(x + 36, base_y + height - 58 * scale, depth, 22 * scale, fill=1, stroke=0)
    c.setFillColor(white)
    c.rect(x + 27, base_y + height, depth + 18, 40 * scale, fill=1, stroke=0)
    dim_line(c, x + 36, base_y - 22, x + 36 + depth, base_y - 22, "700 mm")
    dim_line(c, x + 12, base_y, x + 12, base_y + height, "1050 mm", vertical=True)
    c.setFont("CairoBold", 8.3)
    c.setFillColor(PLUM)
    c.drawString(x + 22, y + 202, title)


def draw_corner_section(c, x, y):
    c.setFillColor(white)
    c.roundRect(x, y, 238, 206, 12, fill=1, stroke=0)
    c.setStrokeColor(LINE)
    c.roundRect(x, y, 238, 206, 12, fill=0, stroke=1)
    c.setFont("CairoBold", 9)
    c.setFillColor(PLUM)
    c.drawString(x + 16, y + 182, "EXPOSED CORNER DETAIL")
    cx, cy = x + 118, y + 96
    c.setFillColor(PALE)
    c.roundRect(cx - 70, cy - 52, 140, 104, 18, fill=1, stroke=0)
    c.setFillColor(PLUM)
    c.roundRect(cx - 60, cy - 42, 120, 84, 14, fill=1, stroke=0)
    c.setFillColor(white)
    c.rect(cx - 66, cy + 40, 132, 12, fill=1, stroke=0)
    c.setFillColor(PURPLE)
    c.rect(cx - 58, cy + 25, 116, 6, fill=1, stroke=0)
    c.setStrokeColor(PURPLE)
    c.arc(cx + 40, cy + 22, cx + 88, cy + 70, 180, 90)
    c.setFont("CairoSemi", 7.4)
    c.setFillColor(VIOLET)
    c.drawString(cx + 47, cy + 63, "R80")
    bullet_list(c, [
        "Use softened external corner. Preferred radius R80 mm.",
        "If radius fabrication is difficult, use a 150 x 150 mm chamfer.",
        "No sharp edges on the customer route."
    ], x + 16, y + 52, 205, 7.4, 3)


def page_cover(c):
    header(c, "Reception Counter Detail", "01 / counter package", 1)
    fit_image(c, RENDER, 34, 110, 495, 350, 16)
    c.setFillColor(Color(0.13, 0, 0.18, 0.88))
    c.roundRect(54, 128, 300, 98, 12, fill=1, stroke=0)
    c.setFont("CairoBold", 10)
    c.setFillColor(LAV)
    c.drawString(72, 198, "DESIGN INTENT")
    wrap_text(c, "A royal deep-plum reception counter with white quartz top, violet reveal lighting, stainless plinth and a softened corner for a premium customer path.", 72, 172, 255, 8.4, white, "Cairo", 13)
    panel(c, 560, 300, 224, 160, "KEY DIMENSIONS")
    bullet_list(c, [
        "Customer front run: 2450 mm.",
        "Side return run: 3150 mm.",
        "Standard counter depth: 700 mm.",
        "Finished height: 1050 mm.",
        "Plinth height: 100 mm.",
        "Accessible lowered section: 760-800 mm high, 900 mm wide if required."
    ], 576, 408, 190, 8.1, 4)
    panel(c, 560, 110, 224, 160, "IMPORTANT")
    bullet_list(c, [
        "Dimensions are derived from the current concept plan.",
        "Contractor must verify exact walls, columns, glass line and door swing on site.",
        "Issue final shop drawing after checking POS, printer, cash drawer and cable routing."
    ], 576, 218, 190, 8.1, 4)


def page_top_plan(c):
    header(c, "Top Plan & Overall Footprint", "02 / top view", 2)
    panel(c, 34, 82, 520, 386, "L-SHAPE COUNTER PLAN")
    draw_counter_top(c, 100, 130)
    c.setFont("Cairo", 7.5)
    c.setFillColor(MUTED)
    wrap_text(c, "Orientation: customer side is the 2450 mm front run. Staff works from the inside of the L. The exposed corner facing the customer route must be rounded or chamfered.", 58, 108, 455, 7.8, MUTED, "Cairo", 11)
    panel(c, 584, 292, 200, 176, "PLAN NOTES")
    bullet_list(c, [
        "Keep 900-1000 mm clear staff passage behind counter where possible.",
        "Top overhang: 25-30 mm on customer side, 10-15 mm on staff side.",
        "Cable grommets at POS and printer positions.",
        "Coordinate counter edge with entrance door and customer queue line."
    ], 600, 416, 168, 7.8, 4)
    panel(c, 584, 82, 200, 176, "TOP SURFACE")
    bullet_list(c, [
        "White quartz or solid surface, 30-40 mm visual thickness.",
        "Soft arris on all exposed edges.",
        "Avoid porous stone due to detergent, moisture and daily cleaning.",
        "Seal all joints with moisture-resistant silicone."
    ], 600, 206, 168, 7.8, 4)


def page_elevations_front_back(c):
    header(c, "Front & Back Elevations", "03 / elevations", 3)
    panel(c, 34, 288, 530, 180)
    draw_front_elevation(c, 82, 292, 395, 160)
    panel(c, 34, 82, 530, 180)
    draw_staff_elevation(c, 82, 86, 395, 160)
    panel(c, 594, 272, 190, 196, "FRONT FINISH")
    bullet_list(c, [
        "Main face: deep royal plum HPL, satin finish.",
        "Horizontal reveal: royal purple LED line with opal diffuser.",
        "Toe kick: brushed stainless steel, 100 mm high.",
        "Optional: subtle vertical grooves or panels, easy to wipe clean."
    ], 610, 415, 158, 7.8, 4)
    panel(c, 594, 82, 190, 160, "STAFF SIDE")
    bullet_list(c, [
        "Lockable storage where cash or devices are kept.",
        "Open shelf for bags and printer paper.",
        "Ventilation openings for POS CPU or UPS.",
        "Removable rear panels for maintenance."
    ], 610, 195, 158, 7.8, 4)


def page_sides_corner(c):
    header(c, "Left, Right & Corner Details", "04 / side views", 4)
    panel(c, 34, 250, 230, 218)
    draw_end_elevation(c, 70, 262, "LEFT END PANEL")
    panel(c, 302, 250, 230, 218)
    draw_end_elevation(c, 338, 262, "RIGHT END PANEL")
    draw_corner_section(c, 560, 262)
    panel(c, 34, 82, 750, 130, "SIDE AND CORNER NOTES")
    bullet_list(c, [
        "Left and right end panels must continue the same deep-plum HPL wrap so the counter reads as one solid object from every angle.",
        "Use concealed adjustable legs behind the stainless plinth. Plinth should be removable for cleaning and service.",
        "If the side return touches a wall, leave a 10-15 mm scribed filler to absorb wall irregularity.",
        "All exposed customer-side vertical edges: minimum R3 edge softening. Main outside corner: R80 preferred.",
        "LED transformer and dimmer must stay accessible from the staff side, not sealed inside the body."
    ], 54, 172, 704, 8.1, 4)


def page_section_materials(c):
    header(c, "Vertical Section & Materials", "05 / section", 5)
    panel(c, 34, 92, 355, 376, "TYPICAL VERTICAL SECTION")
    x, y = 105, 135
    c.setFillColor(FLOOR)
    c.rect(x - 28, y - 8, 220, 8, fill=1, stroke=0)
    c.setFillColor(SILVER)
    c.rect(x, y, 154, 16, fill=1, stroke=0)
    c.setFillColor(PLUM)
    c.rect(x, y + 16, 154, 145, fill=1, stroke=0)
    c.setFillColor(PURPLE)
    c.rect(x, y + 146, 154, 6, fill=1, stroke=0)
    c.setFillColor(white)
    c.rect(x - 8, y + 161, 170, 12, fill=1, stroke=0)
    c.setStrokeColor(PLUM)
    c.setLineWidth(0.8)
    for yy, label in [(y + 167, "30-40 mm quartz / solid surface top"), (y + 149, "serviceable violet LED reveal"), (y + 92, "18 mm marine plywood + HPL"), (y + 8, "100 mm brushed stainless plinth")]:
        c.line(x + 170, yy, x + 238, yy + 18)
        c.setFont("CairoSemi", 7.2)
        c.setFillColor(PLUM)
        c.drawString(x + 244, yy + 14, label)
    dim_line(c, x - 28, y, x - 28, y + 173, "1050 mm", vertical=True)
    dim_line(c, x, y - 24, x + 154, y - 24, "700 mm depth")
    panel(c, 430, 286, 354, 182, "MATERIAL SCHEDULE")
    rows = [
        ("Top", "White quartz / solid surface", "30-40 mm visual thickness"),
        ("Body", "Moisture-resistant HPL", "Deep royal plum #21002F"),
        ("Accent", "LED reveal", "Royal purple #8F00FF, 4000K"),
        ("Plinth", "Brushed stainless steel", "100 mm removable toe kick"),
        ("Hardware", "Soft-close hinges / runners", "Commercial grade"),
    ]
    ty = 430
    c.setFont("CairoBold", 7.2)
    c.setFillColor(PLUM)
    c.drawString(446, ty, "ITEM")
    c.drawString(512, ty, "MATERIAL")
    c.drawString(655, ty, "NOTE")
    ty -= 18
    c.setFont("Cairo", 7)
    for a, b, d in rows:
        c.setFillColor(LINE)
        c.line(446, ty + 11, 762, ty + 11)
        c.setFillColor(INK)
        c.drawString(446, ty, a)
        c.drawString(512, ty, b)
        c.drawString(655, ty, d)
        ty -= 24
    panel(c, 430, 92, 354, 160, "FABRICATION CHECKLIST")
    bullet_list(c, [
        "Confirm POS, printer, QR scanner, cash drawer and customer card machine positions.",
        "Confirm power, data and low-voltage route before carcass production.",
        "Make one corner mock-up for approval: plum HPL, quartz edge, LED reveal and plinth.",
        "Use shop drawings with exact site-measured dimensions before cutting."
    ], 446, 204, 310, 8, 4)


def page_handover(c):
    header(c, "Engineer Handover Notes", "06 / coordination", 6)
    panel(c, 34, 292, 750, 176, "WHAT THE DECOR CONTRACTOR SHOULD PRODUCE NEXT")
    bullet_list(c, [
        "Final measured shop drawing with plan, front, back, two sides, section and fixing details.",
        "Exact internal cabinet layout based on the owner's POS workflow and devices.",
        "Electrical drawing for sockets, data point, LED driver, switch and maintenance hatch.",
        "Material sample board: white top, deep-plum HPL, violet LED diffuser, stainless plinth and edge sample.",
        "A 3D joinery view showing the rounded corner and staff-side storage before fabrication."
    ], 54, 414, 700, 8.4, 5)
    panel(c, 34, 82, 360, 170, "APPROVAL HOLD POINTS")
    bullet_list(c, [
        "Site measurement approved.",
        "Counter corner detail approved.",
        "Material samples approved under actual lighting.",
        "Electrical and data route approved.",
        "First installed LED reveal approved before closing panels."
    ], 54, 202, 312, 8.2, 4)
    panel(c, 424, 82, 360, 170, "ASSUMPTIONS TO VERIFY")
    bullet_list(c, [
        "Counter height and lowered section comply with local accessibility requirements.",
        "Door swing, customer queue and reception circulation are clear.",
        "No conflict with floor drains, columns, glass facade frame or AC outlets.",
        "Moisture protection and cleaning access are included."
    ], 444, 202, 312, 8.2, 4)


def build():
    register_fonts()
    OUT.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(OUT), pagesize=landscape(A4))
    for fn in [page_cover, page_top_plan, page_elevations_front_back, page_sides_corner, page_section_materials, page_handover]:
        fn(c)
        c.showPage()
    c.save()
    print(OUT)


if __name__ == "__main__":
    build()
