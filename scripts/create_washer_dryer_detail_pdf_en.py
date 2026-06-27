from pathlib import Path

from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.colors import HexColor, Color, white
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.utils import ImageReader
from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "output" / "pdf" / "IN_OUT_Laundry_Washer_Dryer_Detail_EN.pdf"
ASSET = ROOT / "output" / "branch_identity"
LOGO = ASSET / "00-primary-logo-royal-purple.png"
DRYER = ASSET / "08-ed460e-dryer-four-side-views.png"
WASHER = ASSET / "09-gs7018e-washer-four-side-views.png"
INTERIOR = ASSET / "10-washer-dryer-interior-corner-render.png"
REF_DRYER = ROOT / "tmp" / "pdfs" / "machine-catalog-renders" / "ED460E" / "page-01.png"
REF_WASHER = ROOT / "tmp" / "pdfs" / "machine-catalog-renders" / "GWET_KIT_20_EplusE" / "page-01.png"
REF_DOSING = ROOT / "tmp" / "pdfs" / "machine-catalog-renders" / "GWET_KIT_20_EplusE" / "page-03.png"
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
    c.drawString(34, 10, "IN & OUT LAUNDRY | WASHER & DRYER DETAIL | 23 JUN 2026 | VERIFY SUPPLIER INSTALLATION MANUAL")
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


def spec_table(c, x, y, rows, colw=(110, 155), title=None):
    if title:
        c.setFont("CairoBold", 10)
        c.setFillColor(PLUM)
        c.drawString(x, y + 20, title)
    row_h = 22
    c.setStrokeColor(LINE)
    c.setFont("Cairo", 7.4)
    for i, (k, v) in enumerate(rows):
        yy = y - i * row_h
        c.setFillColor(PALE if i % 2 == 0 else white)
        c.rect(x, yy - row_h + 5, sum(colw), row_h, fill=1, stroke=0)
        c.setStrokeColor(LINE)
        c.rect(x, yy - row_h + 5, sum(colw), row_h, fill=0, stroke=1)
        c.line(x + colw[0], yy - row_h + 5, x + colw[0], yy + 5)
        c.setFillColor(PLUM)
        c.setFont("CairoSemi", 7.2)
        c.drawString(x + 8, yy - 10, k)
        c.setFillColor(INK)
        c.setFont("Cairo", 7.2)
        c.drawString(x + colw[0] + 8, yy - 10, v)


def draw_plan(c, x, y):
    # scale 0.13 pt/mm for machine footprint.
    s = 0.13
    dryer_w, dryer_d = 1002 * s, 1056 * s
    washer_w, washer_d = 870 * s, 975 * s
    gap = 80
    clearance = 55
    c.setFillColor(Color(0.56, 0, 1, 0.05))
    c.roundRect(x - clearance, y - clearance, dryer_w + washer_w + gap + 2 * clearance, max(dryer_d, washer_d) + 2 * clearance, 12, fill=1, stroke=0)
    c.setStrokeColor(LINE)
    c.roundRect(x - clearance, y - clearance, dryer_w + washer_w + gap + 2 * clearance, max(dryer_d, washer_d) + 2 * clearance, 12, fill=0, stroke=1)
    c.setFillColor(Color(0.13, 0, 0.18, 0.10))
    c.roundRect(x, y, dryer_w, dryer_d, 8, fill=1, stroke=1)
    c.setFillColor(Color(0.56, 0, 1, 0.08))
    c.roundRect(x + dryer_w + gap, y, washer_w, washer_d, 8, fill=1, stroke=1)
    c.setFillColor(PLUM)
    c.rect(x, y, dryer_w, 10, fill=1, stroke=0)
    c.rect(x + dryer_w + gap, y, washer_w, 10, fill=1, stroke=0)
    c.setFont("CairoBold", 8)
    c.setFillColor(PLUM)
    c.drawCentredString(x + dryer_w / 2, y + dryer_d / 2, "ED460E DRYER")
    c.drawCentredString(x + dryer_w + gap + washer_w / 2, y + washer_d / 2, "GS7018E WASHER")
    dim_line(c, x, y - 32, x + dryer_w, y - 32, "1002 mm")
    dim_line(c, x + dryer_w + gap, y - 32, x + dryer_w + gap + washer_w, y - 32, "870 mm")
    dim_line(c, x - 28, y, x - 28, y + dryer_d, "1056 mm", vertical=True)
    dim_line(c, x + dryer_w + gap + washer_w + 28, y, x + dryer_w + gap + washer_w + 28, y + washer_d, "975 mm", vertical=True)
    c.setFont("CairoSemi", 7.2)
    c.setFillColor(MUTED)
    c.drawString(x - clearance, y + max(dryer_d, washer_d) + clearance + 10, "minimum service envelope to be finalized by supplier")


def draw_elevations(c, x, y):
    floor_y = y + 24
    s = 0.105
    dw, dh = 1002 * s, 1828 * s
    ww, wh = 870 * s, 1433 * s
    gap = 36
    c.setFillColor(FLOOR)
    c.rect(x - 15, floor_y - 8, dw + ww + gap + 30, 8, fill=1, stroke=0)
    # dryer
    c.setFillColor(HexColor("#A9ADAD"))
    c.roundRect(x, floor_y, dw, dh, 5, fill=1, stroke=0)
    c.setFillColor(PLUM)
    c.rect(x, floor_y, 8, dh, fill=1, stroke=0)
    c.rect(x + dw - 8, floor_y, 8, dh, fill=1, stroke=0)
    c.setFillColor(HexColor("#111118"))
    c.rect(x, floor_y + dh - 42, dw, 42, fill=1, stroke=0)
    c.setFillColor(PURPLE)
    c.rect(x + 6, floor_y + dh - 45, dw - 12, 3, fill=1, stroke=0)
    c.setFillColor(HexColor("#15151A"))
    c.circle(x + dw / 2, floor_y + dh * 0.53, 43, fill=1, stroke=0)
    c.setFillColor(SILVER)
    c.circle(x + dw / 2, floor_y + dh * 0.53, 31, fill=1, stroke=0)
    # washer
    wx = x + dw + gap
    c.setFillColor(HexColor("#B9BCBC"))
    c.roundRect(wx, floor_y, ww, wh, 5, fill=1, stroke=0)
    c.setFillColor(PLUM)
    c.rect(wx, floor_y, 7, wh, fill=1, stroke=0)
    c.rect(wx + ww - 7, floor_y, 7, wh, fill=1, stroke=0)
    c.setFillColor(HexColor("#111118"))
    c.rect(wx, floor_y + wh - 38, ww, 38, fill=1, stroke=0)
    c.setFillColor(PURPLE)
    c.rect(wx + 6, floor_y + wh - 41, ww - 12, 3, fill=1, stroke=0)
    c.setFillColor(SILVER)
    c.circle(wx + ww / 2, floor_y + wh * 0.51, 31, fill=1, stroke=0)
    c.setStrokeColor(HexColor("#111118"))
    c.setLineWidth(3)
    c.circle(wx + ww / 2, floor_y + wh * 0.51, 38, fill=0, stroke=1)
    c.setLineWidth(1)
    c.setFont("CairoBold", 7.5)
    c.setFillColor(white)
    c.drawCentredString(x + dw / 2, floor_y + dh - 25, "ED460E")
    c.drawCentredString(wx + ww / 2, floor_y + wh - 23, "GS7018E")
    dim_line(c, x - 25, floor_y, x - 25, floor_y + dh, "1828 mm", vertical=True)
    dim_line(c, wx + ww + 25, floor_y, wx + ww + 25, floor_y + wh, "1433 mm", vertical=True)
    dim_line(c, x, floor_y - 28, x + dw, floor_y - 28, "1002 mm")
    dim_line(c, wx, floor_y - 28, wx + ww, floor_y - 28, "870 mm")


def page_cover(c):
    header(c, "Washer & Dryer Equipment", "01 / equipment package", 1)
    fit_image(c, INTERIOR, 34, 112, 500, 350, 16)
    c.setFillColor(Color(0.13, 0, 0.18, 0.88))
    c.roundRect(54, 130, 360, 82, 12, fill=1, stroke=0)
    wrap_text(c, "Corrected equipment vision based on the submitted supplier PDFs: ED460E tumble dryer, GS7018E washer extractor, and LS100 dosing coordination.", 72, 178, 318, 8.4, white, "Cairo", 12)
    panel(c, 560, 312, 224, 150, "EQUIPMENT")
    bullet_list(c, [
        "ED460E commercial tumble dryer - Girbau Spain.",
        "GS7018E wet cleaning washer extractor - Girbau Spain.",
        "LS100 Venturi dosing unit - Seko Italy, coordinated with washer.",
        "Royal identity applied only as subtle trim and decals."
    ], 576, 414, 190, 8.1, 4)
    panel(c, 560, 112, 224, 168, "IMPORTANT")
    bullet_list(c, [
        "This PDF is an interior/design coordination package.",
        "Final installation follows supplier manuals and MEP drawings.",
        "All utility clearances and service access must be verified on site."
    ], 576, 226, 190, 8.1, 4)


def page_dryer(c):
    header(c, "ED460E Dryer - All Sides", "02 / dryer", 2)
    fit_image(c, DRYER, 34, 78, 750, 390, 14, contain=True)
    wrap_text(c, "Visual target: keep the industrial grey/black dryer body, large round door, rear exhaust/service access, with only restrained IN & OUT purple accents.", 44, 54, 720, 8.2, MUTED, "CairoSemi", 12)


def page_washer(c):
    header(c, "GS7018E Washer - All Sides", "03 / washer", 3)
    fit_image(c, WASHER, 34, 78, 750, 390, 14, contain=True)
    wrap_text(c, "Visual target: keep the commercial washer proportions, stainless door, top control screen and rear water/drain connections, with restrained brand trim.", 44, 54, 720, 8.2, MUTED, "CairoSemi", 12)


def page_plan(c):
    header(c, "Footprint & Site Coordination", "04 / footprint", 4)
    panel(c, 34, 92, 520, 376, "INDICATIVE PLAN")
    draw_plan(c, 112, 225)
    panel(c, 584, 292, 200, 176, "PLAN NOTES")
    bullet_list(c, [
        "Place washer near water, drain and dosing connections.",
        "Place dryer where exhaust duct can run directly and safely.",
        "Keep removable panels and rear service zones accessible.",
        "Do not block fire, AC, electrical isolation or maintenance routes."
    ], 600, 416, 168, 7.8, 4)
    panel(c, 584, 92, 200, 166, "CLEARANCE")
    bullet_list(c, [
        "Show clear service envelope on final MEP plan.",
        "Allow door swing and loading basket movement.",
        "Use anti-vibration leveling and floor load verification.",
        "Confirm exact supplier clearance before ordering."
    ], 600, 207, 168, 7.8, 4)


def page_elevations(c):
    header(c, "Relative Elevation & Key Dimensions", "05 / elevation", 5)
    panel(c, 34, 92, 520, 376, "FRONT RELATIVE HEIGHTS")
    draw_elevations(c, 110, 140)
    panel(c, 584, 292, 200, 176, "ED460E DRYER")
    spec_table(c, 600, 406, [
        ("Capacity", "23 kg"),
        ("Drum", "940 dia x 663 L mm"),
        ("Volume", "460 lit"),
        ("Door open height", "695 mm"),
        ("Dimensions", "1002 x 1056 x 1828 mm"),
        ("Weight", "339 kg"),
    ], (78, 98))
    panel(c, 584, 92, 200, 166, "GS7018E WASHER")
    spec_table(c, 600, 206, [
        ("Capacity", "20 kg wet / 18 kg wash"),
        ("Drum", "700 dia x 459 D mm"),
        ("Volume", "177 dm3"),
        ("Door opening", "470 mm"),
        ("Dimensions", "870 x 975 x 1433 mm"),
        ("Static load", "499 kg"),
    ], (78, 98))


def page_mep(c):
    header(c, "MEP, Dosing & Services", "06 / services", 6)
    panel(c, 34, 272, 360, 196, "DRYER SERVICES - ED460E")
    bullet_list(c, [
        "Power consumption: 24 kW.",
        "Applied voltage: 380-415 V / 3 Ph / 50 Hz.",
        "Isolator: 63 A.",
        "Exhaust outlet: 200 mm.",
        "Airflow: 802 CFM.",
        "Coordinate heat, ventilation and duct route before fixing cabinets."
    ], 54, 414, 320, 8.1, 4)
    panel(c, 424, 272, 360, 196, "WASHER SERVICES - GS7018E")
    bullet_list(c, [
        "Power: 15.4 kW.",
        "Applied voltage: 380-415 V / 3 Ph / 50 Hz.",
        "Isolator: 32 A.",
        "Water connection: 2 x 19 mm, pressure 58 PSI.",
        "Consumption: 270 L/hr.",
        "Drain diameter: 76 mm."
    ], 444, 414, 320, 8.1, 4)
    panel(c, 34, 82, 360, 150, "LS100 DOSING UNIT")
    bullet_list(c, [
        "Wall-mounted dosing system from the supplied GWET kit.",
        "Dimensions: 1166 x 160 x 270 mm.",
        "Power: 0.27 kW, 220/1/50, isolator 13 A.",
        "Keep chemical containers in a ventilated safety cabinet or tray."
    ], 54, 188, 320, 8.1, 4)
    panel(c, 424, 82, 360, 150, "COORDINATION RULES")
    bullet_list(c, [
        "MEP contractor to provide final utility drawings.",
        "Supplier to approve exhaust, drain, water, isolation and anchoring.",
        "Provide shutoff valves, service loops and accessible isolation.",
        "Protect purple identity finishes from heat, water and chemicals."
    ], 444, 188, 320, 8.1, 4)


def page_references(c):
    header(c, "Submitted PDF References", "07 / source sheets", 7)
    panel(c, 34, 96, 238, 360, "ED460E PDF")
    fit_image(c, REF_DRYER, 52, 122, 202, 294, 8, contain=True)
    panel(c, 302, 96, 238, 360, "GS7018E PDF")
    fit_image(c, REF_WASHER, 320, 122, 202, 294, 8, contain=True)
    panel(c, 570, 96, 214, 360, "LS100 DOSING PDF")
    fit_image(c, REF_DOSING, 586, 122, 182, 294, 8, contain=True)
    wrap_text(c, "These thumbnails are included only to show the submitted source sheets used for design coordination. Supplier manuals override this concept package.", 44, 62, 720, 8.2, MUTED, "CairoSemi", 12)


def page_handover(c):
    header(c, "Engineer Handover Checklist", "08 / handover", 8)
    panel(c, 34, 292, 750, 176, "WHAT TO CONFIRM BEFORE INSTALLATION")
    bullet_list(c, [
        "Confirm exact supplier models, machine serial drawings, clearances and utility locations.",
        "Confirm floor load capacity, anti-vibration requirements and machine leveling method.",
        "Confirm dryer exhaust duct size, duct route, airflow, heat discharge and make-up air.",
        "Confirm washer drain route, water pressure, soft water connection and dosing tie-in.",
        "Confirm electrical isolators, emergency access, maintenance panels and service routes.",
        "Approve final machine finish/branding decal size before applying any identity elements."
    ], 54, 414, 700, 8.4, 5)
    panel(c, 34, 82, 360, 170, "DESIGN APPROVAL")
    bullet_list(c, [
        "Approve all-side visual direction for dryer.",
        "Approve all-side visual direction for washer.",
        "Approve interior corner arrangement.",
        "Approve LS100 dosing and chemical storage location."
    ], 54, 202, 312, 8.2, 4)
    panel(c, 424, 82, 360, 170, "SAFETY NOTES")
    bullet_list(c, [
        "Keep chemicals away from heat and electrical panels.",
        "Use non-slip service floor and clear loading path.",
        "Do not cover ventilation or exhaust points with decor panels.",
        "Provide access for cleaning lint, drain and dosing maintenance."
    ], 444, 202, 312, 8.2, 4)


def build():
    register_fonts()
    OUT.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(OUT), pagesize=landscape(A4))
    for fn in [page_cover, page_dryer, page_washer, page_plan, page_elevations, page_mep, page_references, page_handover]:
        fn(c)
        c.showPage()
    c.save()
    print(OUT)


if __name__ == "__main__":
    build()
