from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.colors import HexColor, Color, white
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.utils import ImageReader
from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "output" / "pdf" / "IN_OUT_Laundry_New_Branch_Visual_Identity_EN.pdf"
ASSET = ROOT / "output" / "branch_identity"
SOURCE_LOGO = ROOT / "logo-in-and-out-laundry.png"
NEW_LOGO = ASSET / "00-primary-logo-royal-purple.png"
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

pdfmetrics.registerFont(TTFont("Cairo", r"C:\Windows\Fonts\Cairo-Regular.ttf"))
pdfmetrics.registerFont(TTFont("CairoSemi", r"C:\Windows\Fonts\Cairo-SemiBold.ttf"))
pdfmetrics.registerFont(TTFont("CairoBold", r"C:\Windows\Fonts\Cairo-Bold.ttf"))


def fit_image(c, path, x, y, w, h, radius=0, darken=0, contain=False):
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
        c.setFillColor(Color(0, 0, 0, darken)); c.rect(x, y, w, h, fill=1, stroke=0)
    c.restoreState()


def wrap_text(c, text, x, y, width, size=9, color=INK, font="Cairo", leading=None):
    leading = leading or size * 1.5
    c.setFont(font, size); c.setFillColor(color)
    words, lines, current = str(text).split(), [], ""
    for word in words:
        trial = word if not current else current + " " + word
        if pdfmetrics.stringWidth(trial, font, size) <= width:
            current = trial
        else:
            if current: lines.append(current)
            current = word
    if current: lines.append(current)
    for line in lines:
        c.drawString(x, y, line); y -= leading
    return y


def footer(c, page):
    c.setStrokeColor(LINE); c.line(34, 24, W - 34, 24)
    c.setFont("Cairo", 7); c.setFillColor(MUTED)
    c.drawString(34, 10, "IN & OUT LAUNDRY  |  NEW BRANCH CONCEPT  |  23 JUN 2026")
    c.drawRightString(W - 34, 10, str(page))


def header(c, title, kicker, page):
    c.setFillColor(PALE); c.rect(0, 0, W, H, fill=1, stroke=0)
    c.setFillColor(PURPLE); c.rect(W - 18, 0, 18, H, fill=1, stroke=0)
    c.setFont("CairoSemi", 7.5); c.setFillColor(VIOLET); c.drawString(34, H - 28, kicker.upper())
    c.setFont("CairoBold", 23); c.setFillColor(PLUM); c.drawString(34, H - 60, title)
    footer(c, page)


def bullet_list(c, items, x, y, width, size=9, gap=7, color=INK):
    for item in items:
        c.setFillColor(PURPLE); c.circle(x + 4, y + 4, 2.2, fill=1, stroke=0)
        y = wrap_text(c, item, x + 15, y, width - 15, size, color, "Cairo", size * 1.5)
        y -= gap
    return y


def card(c, x, y, w, h, title, body, accent=PURPLE):
    c.setFillColor(white); c.roundRect(x, y, w, h, 12, fill=1, stroke=0)
    c.setFillColor(accent); c.roundRect(x, y, 7, h, 3.5, fill=1, stroke=0)
    c.setFont("CairoBold", 11); c.setFillColor(PLUM); c.drawString(x + 20, y + h - 27, title)
    wrap_text(c, body, x + 20, y + h - 50, w - 38, 8.4, MUTED, "Cairo", 13)


def pill(c, text, x, y, w):
    c.setFillColor(white); c.roundRect(x, y, w, 26, 13, fill=1, stroke=0)
    c.setFont("CairoSemi", 8); c.setFillColor(PLUM); c.drawCentredString(x + w / 2, y + 8, text)


def page_cover(c):
    fit_image(c, ASSET / "03-storefront-3d-logo-v2.png", 0, 0, W, H, darken=.32)
    c.setFillColor(Color(.13, 0, .18, .86)); c.rect(0, 0, W * .45, H, fill=1, stroke=0)
    c.setFillColor(white); c.roundRect(45, H - 225, 285, 145, 18, fill=1, stroke=0)
    fit_image(c, NEW_LOGO, 58, H - 213, 259, 120, contain=True)
    c.setFont("CairoBold", 22); c.setFillColor(white)
    c.drawString(48, H - 282, "VISUAL IDENTITY &")
    c.drawString(48, H - 316, "INTERIOR CONCEPT")
    c.setFont("CairoSemi", 11); c.setFillColor(LAV)
    c.drawString(49, H - 351, "NEW BRANCH / DESIGN ENGINEER BRIEF")
    c.setFillColor(PURPLE); c.roundRect(48, 64, 217, 34, 17, fill=1, stroke=0)
    c.setFont("CairoSemi", 8.4); c.setFillColor(white)
    c.drawCentredString(156, 76, "ROYAL  |  CLEAN  |  OPERATIONAL")
    c.setFont("Cairo", 7); c.drawString(48, 34, "CONCEPT DESIGN - NOT FOR CONSTRUCTION")


def page_logo(c):
    header(c, "Primary Logo Refresh", "01 / BRAND MARK", 2)
    wrap_text(c, "The refreshed mark keeps the original IN / OUT directional idea and ampersand DNA, then reorganises them into a cleaner circular system that matches the new royal-purple interior identity.", 34, H - 98, 730, 10, INK, "Cairo", 17)
    c.setFillColor(white); c.roundRect(34, 92, 280, 330, 16, fill=1, stroke=0)
    c.setFont("CairoBold", 10); c.setFillColor(PLUM); c.drawString(52, 394, "SOURCE BRAND MARK")
    fit_image(c, SOURCE_LOGO, 69, 122, 210, 245, contain=True)
    c.setFillColor(white); c.roundRect(334, 92, 460, 330, 16, fill=1, stroke=0)
    c.setFont("CairoBold", 10); c.setFillColor(PURPLE); c.drawString(352, 394, "REFRESHED PRIMARY LOCKUP")
    fit_image(c, NEW_LOGO, 357, 130, 414, 230, contain=True)
    c.setFillColor(PLUM); c.roundRect(34, 48, 760, 31, 15, fill=1, stroke=0)
    c.setFont("CairoSemi", 8); c.setFillColor(white)
    c.drawCentredString(W/2, 59, "USE THE APPROVED VECTOR ARTWORK FOR FABRICATION - DO NOT TRACE THE 3D RENDERS")


def page_strategy(c):
    header(c, "Design Direction", "02 / BRAND EXPERIENCE", 3)
    c.setFont("CairoBold", 15); c.setFillColor(PURPLE); c.drawString(34, H - 105, "Premium cleanliness without operational friction")
    wrap_text(c, "The branch uses a bright white base, deep-plum architectural blocks and restrained royal-violet light. The customer sees a refined brand; the team gets a durable, easy-to-clean workplace.", 34, H - 135, 730, 10, INK, "Cairo", 17)
    card(c, 34, 265, 240, 110, "BRAND IMPRESSION", "Premium, organised, trustworthy, quick and visibly clean. Never nightclub-like or over-saturated.")
    card(c, 294, 265, 240, 110, "COLOUR BALANCE", "70% white/pale lavender, 20% deep plum, 8% silver and 2% royal-violet light.", VIOLET)
    card(c, 554, 265, 240, 110, "OPERATION FIRST", "Every aesthetic decision must protect circulation, maintenance access, ventilation and hygiene.", SILVER)
    c.setFillColor(PLUM); c.roundRect(34, 60, 760, 165, 18, fill=1, stroke=0)
    c.setFillColor(white); c.roundRect(54, 83, 290, 120, 14, fill=1, stroke=0)
    fit_image(c, NEW_LOGO, 67, 94, 264, 96, contain=True)
    c.setFont("CairoSemi", 9); c.setFillColor(LAV); c.drawString(390, 181, "THE SPATIAL PROMISE")
    wrap_text(c, "Customers see order and cleanliness from the first step. Staff find every tool in place without crowding the workflow.", 390, 148, 350, 15, white, "CairoBold", 25)


def page_palette(c):
    header(c, "Colour System", "03 / PALETTE", 4)
    colors = [("ROYAL PURPLE", "#8F00FF", PURPLE, "Wayfinding and light accents"), ("DEEP ROYAL PLUM", "#21002F", PLUM, "Counter, fascia and strong fields"), ("SATIN VIOLET", "#C026D3", VIOLET, "Secondary and digital accent"), ("PALE LAVENDER", "#FBF7FF", PALE, "Backgrounds and ceilings"), ("PURE WHITE", "#FFFFFF", white, "Walls and work surfaces"), ("BRUSHED SILVER", "#B9BDC7", SILVER, "Letters, plinths and equipment")]
    for i,(name,code,col,use) in enumerate(colors):
        x=34+(i%3)*254; y=H-130-(i//3)*176
        c.setFillColor(white); c.roundRect(x,y-122,234,145,14,fill=1,stroke=0)
        c.setFillColor(col); c.roundRect(x+12,y-45,210,56,10,fill=1,stroke=0)
        if col==white: c.setStrokeColor(LINE); c.roundRect(x+12,y-45,210,56,10,fill=0,stroke=1)
        c.setFont("CairoBold",9.5); c.setFillColor(PLUM); c.drawString(x+14,y-69,name)
        c.setFont("CairoSemi",8); c.setFillColor(MUTED); c.drawRightString(x+218,y-69,code)
        wrap_text(c,use,x+14,y-94,200,7.8,MUTED,"Cairo",12)
    c.setFillColor(PLUM); c.roundRect(34,50,760,68,14,fill=1,stroke=0)
    c.setFont("CairoBold",9); c.setFillColor(LAV); c.drawString(54,91,"COLOUR EXCLUSIONS")
    wrap_text(c,"No blue, teal, green, orange or gold in branded architectural elements. Do not cover large production surfaces in purple.",54,68,690,8.5,white,"Cairo",14)


def page_zoning(c):
    header(c, "Spatial Zoning & Workflow", "04 / PLAN LOGIC", 5)
    px,py,pw,ph=34,75,500,400
    c.setFillColor(white); c.roundRect(px,py,pw,ph,14,fill=1,stroke=0)
    c.setStrokeColor(PLUM); c.setLineWidth(2); c.rect(px+18,py+18,pw-36,ph-36,fill=0,stroke=1)
    c.setFillColor(PLUM); c.roundRect(px+30,py+35,210,50,5,fill=1,stroke=0); c.rect(px+190,py+35,50,170,fill=1,stroke=0)
    c.setFont("CairoBold",8); c.setFillColor(white); c.drawString(px+75,py+54,"RECEPTION")
    c.setFillColor(LAV); c.roundRect(px+277,py+52,70,250,12,fill=1,stroke=0); c.setStrokeColor(PURPLE); c.roundRect(px+277,py+52,70,250,12,fill=0,stroke=1)
    c.setFillColor(PLUM); c.saveState(); c.translate(px+310,py+133); c.rotate(90); c.setFont("CairoBold",8); c.drawString(0,0,"GARMENT CONVEYOR"); c.restoreState()
    blocks=[(px+40,py+290,75,65,"SMALL WASHER"),(px+150,py+290,95,65,"LARGE WASHER"),(px+275,py+310,110,55,"LARGE DRYER"),(px+385,py+230,60,115,"IRONING"),(px+382,py+95,65,115,"STEAM")]
    for xx,yy,ww,hh,label in blocks:
        c.setFillColor(FLOOR); c.roundRect(xx,yy,ww,hh,5,fill=1,stroke=0); c.setFont("CairoSemi",6.2); c.setFillColor(PLUM); c.drawCentredString(xx+ww/2,yy+hh/2,label)
    c.setStrokeColor(PURPLE); c.setLineWidth(3); p=c.beginPath(); p.moveTo(px+65,py+108); p.lineTo(px+260,py+108); p.lineTo(px+260,py+275); p.lineTo(px+410,py+275); c.drawPath(p,stroke=1,fill=0)
    c.setFont("Cairo",7); c.setFillColor(MUTED); c.drawString(px+28,py+25,"Concept diagram derived from the supplied plan - not a construction drawing.")
    c.setFont("CairoBold",13); c.setFillColor(PURPLE); c.drawString(560,H-115,"RECOMMENDED SEQUENCE")
    bullet_list(c,["Receive and inspect at the counter.","Move orders to washing and drying without crossing the customer route.","Iron or steam with tools stored above each station.","Hang and sort finished garments on the conveyor.","Return completed orders to reception for collection."],560,H-150,225,8.8,8)
    c.setFillColor(PLUM); c.roundRect(558,80,236,105,12,fill=1,stroke=0)
    c.setFont("CairoBold",9); c.setFillColor(LAV); c.drawString(576,151,"CLEAR CIRCULATION")
    wrap_text(c,"Target 1000 mm clear on the primary route and 900 mm local minimum, subject to authority and accessibility requirements.",576,125,194,8.2,white,"Cairo",13)


def page_reception(c):
    header(c, "Reception Counter & Feature Wall", "05 / RECEPTION", 6)
    fit_image(c,ASSET/"01-reception-counter-3d-logo-v2.png",34,164,760,335,16)
    c.setFillColor(Color(.13,0,.18,.88)); c.roundRect(52,184,310,100,12,fill=1,stroke=0)
    c.setFont("CairoBold",10); c.setFillColor(LAV); c.drawString(70,255,"THE PRIMARY BRAND MOMENT")
    wrap_text(c,"A calm deep-plum counter, white worktop, controlled violet reveal and a fluted white logo wall visible from the street.",70,228,260,8.8,white,"Cairo",14)
    for text,x,w in [("WHITE QUARTZ",34,135),("MOISTURE-RESISTANT HPL",180,180),("STAINLESS PLINTH",371,145),("SERVICEABLE LED",527,135),("HIDDEN CABLES",673,121)]: pill(c,text,x,112,w)
    wrap_text(c,"The refreshed circular brand mark is centred on the customer sightline and shown as serviceable dimensional signage.",34,73,730,8.5,MUTED,"CairoSemi",13)


def page_counter(c):
    header(c, "Indicative Counter Dimensions", "06 / COUNTER ELEVATION", 7)
    x,y,w,h=34,120,500,315
    c.setFillColor(white); c.roundRect(x,y,w,h,14,fill=1,stroke=0); fy=y+48
    c.setStrokeColor(MUTED); c.line(x+32,fy,x+w-30,fy)
    c.setFillColor(PLUM); c.roundRect(x+55,fy,355,156,6,fill=1,stroke=0)
    c.setFillColor(white); c.rect(x+48,fy+156,370,18,fill=1,stroke=0)
    c.setFillColor(PURPLE); c.rect(x+55,fy+143,355,6,fill=1,stroke=0)
    c.setFillColor(SILVER); c.rect(x+55,fy,355,10,fill=1,stroke=0)
    c.setFillColor(white); c.rect(x+245,fy+98,100,76,fill=1,stroke=0)
    c.setStrokeColor(PURPLE); c.setLineWidth(1); c.line(x+35,fy,x+35,fy+174); c.line(x+29,fy,x+41,fy); c.line(x+29,fy+174,x+41,fy+174)
    c.saveState(); c.translate(x+20,fy+70); c.rotate(90); c.setFont("CairoSemi",8); c.setFillColor(PLUM); c.drawString(0,0,"1050 mm"); c.restoreState()
    c.line(x+55,fy-22,x+410,fy-22); c.line(x+55,fy-28,x+55,fy-16); c.line(x+410,fy-28,x+410,fy-16)
    c.setFont("CairoSemi",8); c.setFillColor(PLUM); c.drawCentredString(x+232,fy-37,"2450 mm - VERIFY ON SITE")
    c.setFont("CairoBold",11); c.drawString(x+25,y+h-35,"INDICATIVE FRONT ELEVATION")
    c.setFont("Cairo",7); c.setFillColor(MUTED); c.drawString(x+25,y+h-55,"All dimensions in millimetres")
    c.setFont("CairoBold",13); c.setFillColor(PURPLE); c.drawString(560,H-114,"FABRICATION NOTES")
    bullet_list(c,["Staff worktop height: approx. 1050 mm; worktop depth: 650-700 mm.","Accessible lowered customer section: 760-800 mm high and at least 900 mm wide where required.","30-40 mm visual thickness white quartz or solid surface with softened edges.","Moisture-resistant HPL body on marine plywood or approved compact board.","100 mm stainless plinth and LED in aluminium profile with opal diffuser.","Lockable internal service access for power, data, UPS and POS cables."],560,H-150,225,8.3,5)


def page_storefront(c):
    header(c, "External Storefront", "07 / FACADE", 8)
    fit_image(c,ASSET/"03-storefront-3d-logo-v2.png",34,154,760,345,16)
    c.setFillColor(Color(.13,0,.18,.88)); c.roundRect(52,174,292,105,12,fill=1,stroke=0)
    c.setFont("CairoBold",10); c.setFillColor(LAV); c.drawString(70,250,"CLEAR PRESENCE FROM A DISTANCE")
    wrap_text(c,"Deep-plum fascia, silver illuminated lettering, transparent glass and a restrained frosted wave band.",70,222,245,8.8,white,"Cairo",14)
    bullet_list(c,["Use the refreshed circular IN & OUT mark consistently on fascia, interior wall and side panel.","Use silver or white channel letters with a restrained violet halo.","Suggested letter height: 350-500 mm, subject to site survey and authority approval.","Frosted privacy band: approximately 850-1200 mm above finished floor.","Keep the entrance threshold accessible and the storefront visually open."],34,119,740,8.2,4)


def page_production(c):
    header(c, "Production Area & Overhead Storage", "08 / OPERATIONS", 9)
    fit_image(c,ASSET/"02-production-area-3d-logo-v2.png",34,164,760,335,16)
    c.setFillColor(Color(.13,0,.18,.88)); c.roundRect(492,184,284,108,12,fill=1,stroke=0)
    c.setFont("CairoBold",10); c.setFillColor(LAV); c.drawString(510,262,"STORAGE AS PART OF THE SYSTEM")
    wrap_text(c,"Closed cabinets above both ironing stations and ventilated overhead storage near washing equipment, while preserving service and ventilation access.",510,234,238,8.5,white,"Cairo",13)
    for text,x,w in [("350-400 mm DEEP",34,140),("SAFE HEAD CLEARANCE",185,155),("STEAM-RESISTANT HPL",351,170),("4000K TASK LIGHT",532,145),("SOFT-CLOSE DOORS",688,106)]: pill(c,text,x,112,w)
    wrap_text(c,"Do not store flammable or heat-sensitive products above steam equipment. Final clearances follow each manufacturer's manual.",34,72,730,8.4,MUTED,"CairoSemi",13)


def page_finishes(c):
    header(c, "Materials & Finishes Schedule", "09 / FINISHES", 10)
    rows=[("GENERAL FLOOR","Light-grey commercial porcelain, R10 slip resistance, limited joints and medium-grey grout."),("EQUIPMENT FLOOR","Same finish or higher-rated system to drainage design, with hygienic coved skirting."),("WALLS","Washable paint or white hygienic panels in splash and steam zones."),("COUNTER","Matt deep-plum HPL, white quartz top and stainless-steel 304 plinth."),("LOGO WALL","Warm-white fluted panels with removable access around power and service points."),("OVERHEAD STORAGE","Matt white moisture-resistant HPL, plum detail band and soft-close hardware."),("FASCIA","Matt deep-plum ACP with UV-resistant finish and detailed movement joints."),("LETTERS","Coated aluminium or stainless steel, 4000K face light and low-output violet halo.")]
    x,y,w=34,H-125,760
    c.setFillColor(PLUM); c.roundRect(x,y,w,35,9,fill=1,stroke=0)
    c.setFont("CairoBold",9); c.setFillColor(white); c.drawString(x+18,y+11,"ELEMENT"); c.drawString(x+215,y+11,"SPECIFICATION")
    rh=47
    for i,(name,spec) in enumerate(rows):
        ry=y-(i+1)*rh; c.setFillColor(white if i%2==0 else PALE); c.rect(x,ry,w,rh-2,fill=1,stroke=0)
        c.setFont("CairoBold",8.3); c.setFillColor(PLUM); c.drawString(x+18,ry+18,name)
        wrap_text(c,spec,x+215,ry+23,520,8,INK,"Cairo",12)
    c.setFont("CairoSemi",8); c.setFillColor(MUTED); c.drawString(34,53,"Contractor to submit physical samples for colour, texture and gloss approval before procurement.")


def page_signage(c):
    header(c, "Signage, Typography & Lighting", "10 / GRAPHIC SYSTEM", 11)
    card(c,34,330,240,125,"PRIMARY BRAND ART","Use the refreshed circular mark and approved vector artwork. Do not redraw the logo from a render or screenshot.")
    card(c,294,330,240,125,"TYPOGRAPHY","Cairo SemiBold for bilingual wayfinding and labels. Use short, high-contrast messages with generous spacing.",VIOLET)
    card(c,554,330,240,125,"SECONDARY EMBLEM","The circular emblem may be used alone on glass, doors, uniforms and small applications.",SILVER)
    c.setFillColor(white); c.roundRect(34,70,500,225,14,fill=1,stroke=0)
    c.setFont("CairoBold",11); c.setFillColor(PLUM); c.drawString(55,264,"LIGHTING LAYERS")
    lights=[("GENERAL","4000K / CRI 90+ / low glare",.86),("IRONING TASK","4000K / continuous under-cabinet",.72),("LOGO WALL","3500-4000K / soft wall wash",.58),("VIOLET ACCENT","Low output / dimmable",.34)]
    yy=225
    for name,spec,ratio in lights:
        c.setFont("CairoBold",8.5); c.setFillColor(PLUM); c.drawString(55,yy,name)
        c.setFillColor(LINE); c.roundRect(190,yy-2,280,8,4,fill=1,stroke=0); c.setFillColor(PURPLE if ratio<.5 else VIOLET); c.roundRect(190,yy-2,280*ratio,8,4,fill=1,stroke=0)
        c.setFont("Cairo",7.3); c.setFillColor(MUTED); c.drawString(55,yy-19,spec); yy-=46
    c.setFillColor(PLUM); c.roundRect(558,70,236,225,14,fill=1,stroke=0)
    c.setFont("CairoBold",10); c.setFillColor(LAV); c.drawString(578,264,"NON-NEGOTIABLES")
    bullet_list(c,["No exposed LED dots or visible drivers.","No violet task light directly on garments.","Consistent colour temperature in work zones.","Separate circuits for signage, accent and task lighting.","All drivers and transformers remain serviceable."],578,228,192,8.2,6,white)


def page_handoff(c):
    header(c, "Technical Coordination & Handover", "11 / NEXT ACTIONS", 12)
    c.setFont("CairoBold",14); c.setFillColor(PURPLE); c.drawString(34,H-110,"BEFORE SHOP DRAWINGS")
    bullet_list(c,["Complete site survey: storefront, levels, columns, doors and ceiling services.","Confirm exact machine models, utility connections, ventilation and maintenance clearances.","Issue counter, cabinet and signage shop drawings with fixing details and sections.","Coordinate conveyor movement before fixing cabinets or lighting tracks.","Approve HPL, quartz, ACP, frosted film and colour samples under site lighting.","Combine electrical, plumbing, drainage, HVAC and fire systems in one coordinated drawing.","Build a counter and logo-wall mock-up before full fabrication.","Approve the refreshed logo as final vector artwork before signage manufacture."],34,H-150,730,9.5,6)
    c.setFillColor(PLUM); c.roundRect(34,62,760,94,16,fill=1,stroke=0)
    c.setFont("CairoBold",10); c.setFillColor(LAV); c.drawString(55,124,"DOCUMENT STATUS")
    wrap_text(c,"Visual identity and concept-design brief ready for development into construction documents. All dimensions are indicative and must be verified on site and against equipment manuals.",55,96,690,9.5,white,"Cairo",16)


def build():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    c=canvas.Canvas(str(OUT),pagesize=(W,H),pageCompression=1)
    c.setTitle("IN & OUT Laundry - New Branch Visual Identity - English")
    for fn in [page_cover,page_logo,page_strategy,page_palette,page_zoning,page_reception,page_counter,page_storefront,page_production,page_finishes,page_signage,page_handoff]:
        fn(c); c.showPage()
    c.save(); print(OUT)


if __name__=="__main__": build()
