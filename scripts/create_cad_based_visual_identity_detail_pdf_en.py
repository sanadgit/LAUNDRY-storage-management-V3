from pathlib import Path

from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.colors import HexColor, Color, white
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.utils import ImageReader
from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "output" / "pdf" / "IN_OUT_Laundry_CAD_Based_Visual_Identity_Detail_EN.pdf"
ASSET = ROOT / "output" / "branch_identity"
CAD = ROOT / "cad shop layout.png"
LOGO = ASSET / "00-primary-logo-royal-purple.png"
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


def fit_image(c, path, x, y, w, h, radius=0, contain=False, darken=0):
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
    if darken:
        c.setFillColor(Color(0, 0, 0, darken))
        c.rect(x, y, w, h, fill=1, stroke=0)
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
    c.drawString(34, 10, "IN & OUT LAUNDRY | CAD-BASED VISUAL IDENTITY & INTERIOR DETAIL | 24 JUN 2026")
    c.drawRightString(W - 34, 10, str(page))


def header(c, title, kicker, page):
    c.setFillColor(PALE)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    c.setFillColor(PURPLE)
    c.rect(W - 18, 0, 18, H, fill=1, stroke=0)
    c.setFont("CairoSemi", 7.5)
    c.setFillColor(VIOLET)
    c.drawString(34, H - 28, kicker.upper())
    c.setFont("CairoBold", 22)
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


def pill(c, text, x, y, w, fill=PLUM):
    c.setFillColor(fill)
    c.roundRect(x, y, w, 24, 12, fill=1, stroke=0)
    c.setFont("CairoSemi", 8)
    c.setFillColor(white)
    c.drawCentredString(x + w / 2, y + 7, text)


def swatch(c, name, hex_code, color, x, y, w=134):
    c.setFillColor(color)
    c.roundRect(x, y, w, 58, 10, fill=1, stroke=0)
    c.setFont("CairoBold", 7.5)
    c.setFillColor(white if color not in [PALE, white, FLOOR] else PLUM)
    c.drawString(x + 10, y + 34, name)
    c.setFont("Cairo", 7)
    c.drawString(x + 10, y + 17, hex_code)


def table(c, x, y, col_widths, rows, header_fill=PLUM, row_h=23, font_size=7.4):
    total_w = sum(col_widths)
    c.setStrokeColor(LINE)
    for r, row in enumerate(rows):
        yy = y - r * row_h
        fill = header_fill if r == 0 else (PALE if r % 2 else white)
        c.setFillColor(fill)
        c.rect(x, yy - row_h, total_w, row_h, fill=1, stroke=0)
        c.setStrokeColor(LINE)
        c.rect(x, yy - row_h, total_w, row_h, fill=0, stroke=1)
        xx = x
        for i, text in enumerate(row):
            if i:
                c.line(xx, yy - row_h, xx, yy)
            c.setFont("CairoBold" if r == 0 else "Cairo", font_size)
            c.setFillColor(white if r == 0 else INK)
            wrap_text(c, text, xx + 6, yy - 15, col_widths[i] - 12, font_size, white if r == 0 else INK, "CairoBold" if r == 0 else "Cairo", font_size * 1.2)
            xx += col_widths[i]


def mini_plan(c, x, y, scale=1.0):
    # Diagram based on cad shop layout: not a construction drawing.
    w, h = 465 * scale, 300 * scale
    c.setFillColor(white)
    c.roundRect(x, y, w, h, 12, fill=1, stroke=0)
    c.setStrokeColor(PLUM)
    c.setLineWidth(2)
    c.rect(x + 15 * scale, y + 18 * scale, w - 30 * scale, h - 30 * scale, fill=0, stroke=1)
    c.setLineWidth(1)

    def box(lbl, bx, by, bw, bh, fill=PALE):
        c.setFillColor(fill)
        c.roundRect(x + bx * scale, y + by * scale, bw * scale, bh * scale, 4 * scale, fill=1, stroke=0)
        c.setStrokeColor(PLUM)
        c.roundRect(x + bx * scale, y + by * scale, bw * scale, bh * scale, 4 * scale, fill=0, stroke=1)
        c.setFont("CairoBold", 5.8 * scale)
        c.setFillColor(PLUM)
        c.drawCentredString(x + (bx + bw / 2) * scale, y + (by + bh / 2 - 3) * scale, lbl)

    box("HAND", 18, 247, 38, 32)
    box("UTILITY", 72, 252, 42, 26)
    box("S-WASH", 122, 252, 58, 26)
    box("DRYER", 206, 232, 82, 55)
    box("WASHER", 326, 232, 94, 60)
    box("STEAM", 432, 228, 38, 72)
    box("TABLE 1", 420, 126, 56, 96, LAV)
    box("TABLE 2", 420, 20, 56, 96, LAV)
    box("CONVEYOR", 292, 45, 66, 190, Color(0.56, 0, 1, 0.08))
    box("COUNTER", 145, 80, 82, 80, white)
    c.setStrokeColor(LINE)
    c.line(x + 15 * scale, y + 182 * scale, x + 260 * scale, y + 182 * scale)
    c.line(x + 260 * scale, y + 182 * scale, x + 260 * scale, y + 48 * scale)
    c.setFont("CairoSemi", 6 * scale)
    c.setFillColor(MUTED)
    c.drawString(x + 28 * scale, y + 28 * scale, "Front facade / entrance side")


def page_cover(c):
    header(c, "CAD-Based New Branch Identity", "01 / approved direction", 1)
    fit_image(c, ASSET / "17-cad-based-full-branch-layout-concept.png", 34, 94, 760, 390, 18)
    c.setFillColor(Color(0.13, 0, 0.18, 0.86))
    c.roundRect(52, 112, 365, 96, 14, fill=1, stroke=0)
    c.setFont("CairoBold", 11)
    c.setFillColor(LAV)
    c.drawString(72, 184, "FINAL CONCEPT BASIS")
    wrap_text(c, "This visual identity package is now based on the CAD shop layout: reception at the lower-left, machine line on the back wall, conveyor in the center, and two manual ironing tables on the right wall.", 72, 160, 320, 8.7, white, "Cairo", 13)


def page_cad_basis(c):
    header(c, "CAD Layout Translation", "02 / layout basis", 2)
    panel(c, 34, 92, 360, 376, "SUBMITTED CAD PLAN")
    fit_image(c, CAD, 58, 145, 310, 245, 8, contain=True)
    panel(c, 424, 92, 360, 376, "DESIGN INTERPRETATION")
    mini_plan(c, 446, 150, 0.66)
    bullet_list(c, [
        "Machine positions follow the submitted CAD image, not the earlier exploratory layout.",
        "The back-wall line reads left-to-right: hand washing, utility sink, small washer, dryer, large washer and steam iron.",
        "The right wall carries two long manual ironing tables.",
        "The conveyor remains central with overhead blanket storage above it.",
        "Reception counter remains in the lower-left/front zone."
    ], 444, 410, 315, 8.2, 4)


def page_brand_system(c):
    header(c, "Visual Identity System", "03 / brand foundations", 3)
    panel(c, 34, 92, 250, 376, "PRIMARY LOGO")
    fit_image(c, LOGO, 70, 230, 178, 160, 10, contain=True)
    wrap_text(c, "Use the refreshed circular IN & OUT Laundry mark consistently on the reception wall, counter face, packaging, garment bags, blanket bags, and subtle machine decals.", 58, 188, 200, 8.1, MUTED, "Cairo", 12)
    panel(c, 314, 92, 470, 376, "ROYAL COLOUR PALETTE")
    swatch(c, "DEEP ROYAL PLUM", "#21002F", PLUM, 338, 370)
    swatch(c, "ROYAL PURPLE", "#8F00FF", PURPLE, 486, 370)
    swatch(c, "SATIN VIOLET", "#C026D3", VIOLET, 634, 370)
    swatch(c, "PALE LAVENDER", "#FBF7FF", PALE, 338, 292)
    swatch(c, "PURE WHITE", "#FFFFFF", white, 486, 292)
    swatch(c, "BRUSHED SILVER", "#B9BDC7", SILVER, 634, 292)
    bullet_list(c, [
        "Deep plum is the anchor: counter, cabinet fascia, plinths, storage frames and major trim.",
        "Royal purple is the highlight: LED lines, callout trims, thin equipment accents and wayfinding.",
        "White and pale lavender keep the small branch bright, clean and premium.",
        "Brushed silver connects the identity with commercial laundry equipment."
    ], 338, 238, 406, 8.4, 5)


def page_zoning_workflow(c):
    header(c, "Operational Zoning & Flow", "04 / workflow", 4)
    fit_image(c, ASSET / "17-cad-based-full-branch-layout-concept.png", 34, 128, 500, 330, 16)
    panel(c, 560, 288, 224, 180, "CUSTOMER ZONE")
    bullet_list(c, [
        "Reception counter at lower-left/front.",
        "Glass caps and shoes storage near the facade.",
        "Clear customer-facing brand wall behind counter.",
        "Customer path stays outside the production corridor."
    ], 576, 414, 190, 8.1, 4)
    panel(c, 560, 92, 224, 164, "PRODUCTION FLOW")
    bullet_list(c, [
        "Receive at counter.",
        "Sort to hand wash, small washer, large washer or dryer line.",
        "Move to steam iron or manual ironing tables.",
        "Hang completed garments on conveyor.",
        "Pack folded items, shoes, caps and blankets with barcode labels."
    ], 576, 206, 190, 8.1, 4)


def page_reception_counter(c):
    header(c, "Reception Counter & Brand Wall", "05 / reception", 5)
    fit_image(c, ASSET / "01-reception-counter-3d-logo-v2.png", 34, 150, 500, 300, 16)
    panel(c, 560, 292, 224, 158, "DESIGN DETAILS")
    bullet_list(c, [
        "Deep royal plum counter body with white quartz top.",
        "Thin royal purple LED reveal at front and side.",
        "Fluted white brand wall with centered circular logo.",
        "Hidden POS/data/power access from staff side.",
        "Stainless or brushed-silver plinth for cleaning durability."
    ], 576, 402, 190, 8.1, 4)
    panel(c, 560, 110, 224, 150, "CAD POSITION")
    bullet_list(c, [
        "Counter remains in the lower-left/front area shown in CAD.",
        "Keep sightline to entrance and glass storage.",
        "Maintain clear route from counter to production zone."
    ], 576, 214, 190, 8.2, 4)
    pill(c, "COUNTER DETAIL PDF EXISTS", 34, 92, 185)
    pill(c, "WHITE QUARTZ TOP", 235, 92, 145)
    pill(c, "ROYAL PLUM BODY", 396, 92, 148)
    pill(c, "LOGO WALL", 560, 92, 105)


def page_machine_line(c):
    header(c, "Back Wall Machine Line", "06 / machines", 6)
    fit_image(c, ASSET / "10-washer-dryer-interior-corner-render.png", 34, 206, 330, 245, 14)
    fit_image(c, ASSET / "08-ed460e-dryer-four-side-views.png", 388, 276, 190, 170, 10, contain=True)
    fit_image(c, ASSET / "09-gs7018e-washer-four-side-views.png", 596, 276, 190, 170, 10, contain=True)
    rows = [
        ["CAD order", "Equipment", "Identity treatment", "Coordination note"],
        ["1", "Hand washing", "Plum base cabinet, stainless sink, pale lavender splash wall", "Waterproof wall, floor drain, hand-wash signage"],
        ["2", "Utility sink", "Compact plum/white service sink zone", "Use for tools, delicate prep and spot treatment"],
        ["3", "S-washing", "Small washer with subtle logo decal", "Confirm water, drain and electrical access"],
        ["4", "Dryer ED460E", "Grey/silver body, plum edge trim, small logo", "Exhaust route, airflow and make-up air"],
        ["5", "Washing machine GS7018E", "Grey/silver body, purple trim, small logo", "Water, drain, dosing and vibration control"],
        ["6", "Steam iron", "White/silver unit with plum trim", "Steam, heat, clearance and safe working surface"]
    ]
    table(c, 34, 182, [62, 150, 240, 300], rows, row_h=23, font_size=7.1)


def page_conveyor_blankets(c):
    header(c, "Conveyor & Overhead Blanket Storage", "07 / conveyor", 7)
    fit_image(c, ASSET / "05-conveyor-interior-render-white-bags.png", 34, 250, 360, 210, 14)
    fit_image(c, ASSET / "14-overhead-blanket-storage-above-conveyor.png", 424, 250, 360, 210, 14)
    panel(c, 34, 92, 360, 130, "CONVEYOR RULES")
    bullet_list(c, [
        "Install lengthwise in the center as shown in CAD.",
        "Use white long garment bags with IN & OUT logo.",
        "Keep service access and hanger movement clear.",
        "Use plum frame and brushed-silver hardware."
    ], 54, 178, 320, 8.1, 4)
    panel(c, 424, 92, 360, 130, "BLANKET STORAGE RULES")
    bullet_list(c, [
        "Storage is directly above the conveyor, not on the conveyor frame.",
        "Use wall/ceiling-supported rack with front safety rail.",
        "Frosted blanket bags show order/customer/phone/barcode and X OF Y quantity.",
        "Define max load per bay before fabrication."
    ], 444, 178, 320, 8.1, 4)


def page_ironing_tables(c):
    header(c, "Manual Ironing Tables", "08 / ironing", 8)
    fit_image(c, ASSET / "07-ironing-table-interior-corner-render.png", 34, 164, 500, 300, 16)
    panel(c, 560, 292, 224, 158, "CAD POSITION")
    bullet_list(c, [
        "Two long manual ironing tables sit on the right wall.",
        "Table iron 1 is above table iron 2 as shown in CAD.",
        "Tables run lengthwise and remain parallel to the wall.",
        "Keep clear path between tables and conveyor."
    ], 576, 402, 190, 8.1, 4)
    panel(c, 560, 110, 224, 150, "DETAILS")
    bullet_list(c, [
        "White padded replaceable top.",
        "Open hollow storage below with removable bins.",
        "Heat-safe iron rest pads at ends.",
        "Spray/tag holders and clean cable routing."
    ], 576, 214, 190, 8.2, 4)
    pill(c, "TWO DISTINCT TABLES", 34, 92, 165)
    pill(c, "OPEN STORAGE BELOW", 215, 92, 165)
    pill(c, "RIGHT WALL POSITION", 396, 92, 165)


def page_packaging_storage(c):
    header(c, "Packaging & Customer-Facing Storage", "09 / storage", 9)
    fit_image(c, ASSET / "12-glass-caps-shoes-storage-entry.png", 34, 250, 360, 210, 14)
    fit_image(c, ASSET / "11-folded-clothes-bag-barcode-storage.png", 424, 250, 360, 210, 14)
    fit_image(c, ASSET / "13-shoe-box-packaging-barcode-label.png", 34, 92, 360, 130, 12)
    fit_image(c, ASSET / "15-blanket-bag-label-storage.png", 424, 92, 360, 130, 12)
    pill(c, "CAPS GLASS STORAGE", 50, 226, 160)
    pill(c, "SHOES GLASS STORAGE", 225, 226, 165)
    pill(c, "FOLDED CLOTHES BAGS", 440, 226, 175)
    pill(c, "BARCODE LABELS", 630, 226, 135)


def page_materials_finishes(c):
    header(c, "Materials & Finish Schedule", "10 / finishes", 10)
    rows = [
        ["Element", "Primary material", "Finish / colour", "Notes"],
        ["Reception counter", "Moisture-resistant board + quartz", "Deep plum body, white top, purple LED", "Serviceable access panels"],
        ["Brand wall", "Fluted panel / painted MDF or HPL", "White or pale lavender", "Dimensional logo centered"],
        ["Machine line wall", "Washable wall finish / compact panels", "Pale lavender with plum base strip", "Water and chemical resistant"],
        ["Manual tables", "Powder-coated steel or compact board", "White frame, plum plinth, purple trim", "Heat resistant top and replaceable cover"],
        ["Conveyor frame", "Steel + stainless hardware", "Deep plum frame, silver moving parts", "Supplier safety and maintenance rules override decor"],
        ["Blanket rack", "Steel frame + compact shelves", "Deep plum frame, white shelves", "Engineer-approved wall/ceiling fixings"],
        ["Glass storage", "Tempered glass + aluminum frame", "Brushed silver and deep plum fascia", "Lockable, lit, ventilated"],
        ["Packaging", "Frosted pouches, cartons, labels", "White, plum, purple wave motif", "Barcode generated by order system"],
        ["Floor", "Commercial porcelain / epoxy", "Warm light grey", "Anti-slip, easy cleaning"]
    ]
    table(c, 34, 438, [155, 210, 205, 160], rows, row_h=30, font_size=7.2)


def page_lighting_signage(c):
    header(c, "Lighting, Signage & Wayfinding", "11 / ambience", 11)
    panel(c, 34, 282, 360, 186, "LIGHTING SYSTEM")
    bullet_list(c, [
        "Use 4000K neutral task lighting across production areas.",
        "Use concealed purple LED reveals only as accents, not as primary light.",
        "Add under-cabinet lighting above ironing and hand-wash zones.",
        "Add vertical LED strips inside caps/shoes glass storage.",
        "Keep LED drivers serviceable and away from water/steam."
    ], 54, 414, 320, 8.1, 4)
    panel(c, 424, 282, 360, 186, "SIGNAGE")
    bullet_list(c, [
        "Use English labels on operational zones in the design package.",
        "Final customer-facing signs may be bilingual if required.",
        "Use deep plum background with white text for zone tags.",
        "Machine decals should be subtle and not cover manufacturer panels.",
        "Shelf codes must match the barcode/LED sorting system."
    ], 444, 414, 320, 8.1, 4)
    panel(c, 34, 92, 360, 150, "BRAND APPLICATION")
    bullet_list(c, [
        "Main logo: reception wall, counter, storefront, glass storage.",
        "Small logo: bags, boxes, blanket pouches and machine lower panels.",
        "Wave motif: packaging, frosted bands, label backgrounds.",
        "Avoid over-branding inside technical service areas."
    ], 54, 196, 320, 8.1, 4)
    panel(c, 424, 92, 360, 150, "DO NOT DO")
    bullet_list(c, [
        "Do not block vents, exhaust, service panels or conveyor mechanisms.",
        "Do not use dark finishes on every wall; keep the shop bright.",
        "Do not place loose storage on the floor.",
        "Do not use non-waterproof materials near wet areas."
    ], 444, 196, 320, 8.1, 4)


def page_mep_safety(c):
    header(c, "MEP & Safety Coordination", "12 / engineering", 12)
    rows = [
        ["Zone", "MEP coordination", "Safety / maintenance note"],
        ["Hand washing", "Waterproof wall, hot/cold water, drainage, splash control", "Anti-slip floor and chemical-safe surfaces"],
        ["Small washer", "Water, drain, power and leveling", "Leave access to rear and side service panels"],
        ["Dryer", "Power, exhaust outlet, airflow, make-up air and heat control", "No decor panels over exhaust or vents"],
        ["Large washer", "Water pressure, drain, dosing, vibration and load", "Floor load and anti-vibration controls"],
        ["Steam iron", "Power/steam/heat route and clearance", "Protect nearby finishes from heat and moisture"],
        ["Conveyor", "Power, movement clearance and emergency access", "Do not hang blanket rack from conveyor frame"],
        ["Blanket rack", "Lighting cable and structural fixing", "Engineer-approved anchors and max load per bay"],
        ["Counter", "POS power, data, printer, cash drawer and cable access", "Lockable staff side, no exposed cables"],
        ["Glass storage", "LED power, lock hardware and ventilation", "Tempered glass and wall/floor anchoring"]
    ]
    table(c, 34, 436, [145, 345, 250], rows, row_h=34, font_size=7.1)


def page_shop_drawing_checklist(c):
    header(c, "Shop Drawing Package Checklist", "13 / next deliverables", 13)
    panel(c, 34, 276, 750, 192, "REQUIRED FROM INTERIOR CONTRACTOR")
    bullet_list(c, [
        "Final measured CAD plan based on the actual site, confirming walls, glass line, columns and doors.",
        "Counter shop drawing: plan, elevations, sections, POS cable access and corner detail.",
        "Machine wall MEP layout: power, isolators, drain, water, exhaust, steam and dosing connections.",
        "Conveyor and blanket rack coordination drawing with clearances, movement envelope and load details.",
        "Manual ironing table fabrication drawings for both right-wall tables.",
        "Caps/shoes glass storage drawings with locks, lighting, ventilation and anchoring.",
        "Packaging artwork files for bags, blanket pouches, shoe boxes and barcode labels."
    ], 54, 418, 704, 8.4, 5)
    panel(c, 34, 92, 360, 150, "APPROVAL MOCK-UPS")
    bullet_list(c, [
        "Counter material and LED mock-up.",
        "One manual ironing table corner mock-up.",
        "One frosted folded-clothes bag and label.",
        "One blanket pouch and label.",
        "One white and one royal shoe box."
    ], 54, 196, 320, 8.1, 4)
    panel(c, 424, 92, 360, 150, "OWNER DECISIONS")
    bullet_list(c, [
        "Approve final CAD layout before production.",
        "Approve exact shelf coding and barcode format.",
        "Approve material samples under site lighting.",
        "Approve all logo sizes before fabrication.",
        "Approve MEP drawings before closing walls or cabinets."
    ], 444, 196, 320, 8.1, 4)


def page_reference_files(c):
    header(c, "Reference Detail Files Already Prepared", "14 / references", 14)
    rows = [
        ["Package", "File", "Purpose"],
        ["Counter", "IN_OUT_Laundry_Counter_Detail_EN.pdf", "Reception counter shop-drawing guide"],
        ["Conveyor", "IN_OUT_Laundry_Garment_Conveyor_Detail_EN.pdf", "Garment conveyor visual and technical direction"],
        ["Manual ironing tables", "IN_OUT_Laundry_Manual_Ironing_Table_Detail_EN.pdf", "Two right-wall table fabrication direction"],
        ["Washer & dryer", "IN_OUT_Laundry_Washer_Dryer_Detail_EN.pdf", "Machine visuals, dimensions and MEP notes"],
        ["Storage & packaging", "IN_OUT_Laundry_Storage_Packaging_Detail_EN.pdf", "Folded clothes, caps, shoes and box packaging"],
        ["Blanket storage", "IN_OUT_Laundry_Overhead_Blanket_Storage_Detail_EN.pdf", "Overhead blanket rack above conveyor"],
        ["Original identity", "IN_OUT_Laundry_New_Branch_Visual_Identity_EN.pdf", "Initial brand concept and palette"],
        ["CAD-based concept image", "17-cad-based-full-branch-layout-concept.png", "Current visual reference for the full branch"]
    ]
    table(c, 34, 438, [190, 330, 220], rows, row_h=32, font_size=7.2)
    panel(c, 34, 76, 750, 80, "STATUS")
    wrap_text(c, "This document is the updated English visual identity package that aligns all previous item details to the submitted CAD shop layout. It is suitable for review with the interior designer, MEP coordinator and equipment supplier before final shop drawings.", 54, 122, 704, 9, INK, "Cairo", 13)


def build():
    register_fonts()
    OUT.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(OUT), pagesize=landscape(A4))
    pages = [
        page_cover,
        page_cad_basis,
        page_brand_system,
        page_zoning_workflow,
        page_reception_counter,
        page_machine_line,
        page_conveyor_blankets,
        page_ironing_tables,
        page_packaging_storage,
        page_materials_finishes,
        page_lighting_signage,
        page_mep_safety,
        page_shop_drawing_checklist,
        page_reference_files,
    ]
    for fn in pages:
        fn(c)
        c.showPage()
    c.save()
    print(OUT)


if __name__ == "__main__":
    build()
