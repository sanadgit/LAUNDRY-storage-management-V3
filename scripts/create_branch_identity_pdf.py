from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.colors import HexColor, Color, white
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.utils import ImageReader
from PIL import Image
import arabic_reshaper
from bidi.algorithm import get_display


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "output" / "pdf" / "IN_OUT_Laundry_New_Branch_Visual_Identity_AR.pdf"
ASSET = ROOT / "output" / "branch_identity"
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

FONT_REG = r"C:\Windows\Fonts\Cairo-Regular.ttf"
FONT_SEMI = r"C:\Windows\Fonts\Cairo-SemiBold.ttf"
FONT_BOLD = r"C:\Windows\Fonts\Cairo-Bold.ttf"
pdfmetrics.registerFont(TTFont("Cairo", FONT_REG))
pdfmetrics.registerFont(TTFont("CairoSemi", FONT_SEMI))
pdfmetrics.registerFont(TTFont("CairoBold", FONT_BOLD))


def ar(s):
    return get_display(arabic_reshaper.reshape(str(s)))


def fit_image(c, path, x, y, w, h, radius=0, darken=0):
    im = Image.open(path)
    iw, ih = im.size
    scale = max(w / iw, h / ih)
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


def rtl_text(c, text, x_right, y, size=11, color=INK, font="Cairo", max_width=None, leading=None):
    c.setFillColor(color)
    c.setFont(font, size)
    if not max_width:
        c.drawRightString(x_right, y, ar(text))
        return y
    leading = leading or size * 1.65
    words = str(text).split()
    lines, current = [], ""
    for word in words:
        trial = word if not current else current + " " + word
        if pdfmetrics.stringWidth(ar(trial), font, size) <= max_width:
            current = trial
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    for line in lines:
        c.drawRightString(x_right, y, ar(line))
        y -= leading
    return y


def pill(c, label, x, y, w, fill=PALE, color=PLUM):
    c.setFillColor(fill)
    c.roundRect(x, y, w, 24, 12, fill=1, stroke=0)
    rtl_text(c, label, x + w - 10, y + 7, 8.5, color, "CairoSemi")


def footer(c, page):
    c.setStrokeColor(LINE)
    c.line(34, 24, W - 34, 24)
    c.setFont("Cairo", 7)
    c.setFillColor(MUTED)
    c.drawString(34, 10, f"IN & OUT LAUNDRY  |  NEW BRANCH CONCEPT  |  23 JUN 2026")
    c.drawRightString(W - 34, 10, str(page))


def header(c, title, kicker, page):
    c.setFillColor(PALE)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    c.setFillColor(PURPLE)
    c.rect(W - 18, 0, 18, H, fill=1, stroke=0)
    c.setFont("CairoSemi", 7.5)
    c.setFillColor(VIOLET)
    c.drawRightString(W - 44, H - 28, kicker.upper())
    rtl_text(c, title, W - 44, H - 57, 22, PLUM, "CairoBold")
    footer(c, page)


def section_card(c, x, y, w, h, title, body, accent=PURPLE):
    c.setFillColor(white)
    c.roundRect(x, y, w, h, 12, fill=1, stroke=0)
    c.setFillColor(accent)
    c.roundRect(x + w - 7, y, 7, h, 3.5, fill=1, stroke=0)
    rtl_text(c, title, x + w - 18, y + h - 26, 12, PLUM, "CairoBold")
    rtl_text(c, body, x + w - 18, y + h - 50, 8.6, MUTED, "Cairo", w - 36, 14)


def bullet_list(c, items, x_right, y, width, size=9.3, gap=9, color=INK):
    for item in items:
        c.setFillColor(PURPLE)
        c.circle(x_right - 3, y + 4, 2.3, fill=1, stroke=0)
        y = rtl_text(c, item, x_right - 13, y, size, color, "Cairo", width - 16, size * 1.55)
        y -= gap
    return y


def wave_mark(c, cx, cy, r, stroke=white):
    c.setStrokeColor(stroke)
    c.setLineWidth(3)
    c.circle(cx, cy, r, fill=0, stroke=1)
    p = c.beginPath()
    p.moveTo(cx - r * .72, cy - r * .05)
    p.curveTo(cx - r * .2, cy - r * .45, cx + r * .1, cy + r * .2, cx + r * .72, cy - r * .08)
    c.drawPath(p, fill=0, stroke=1)
    c.circle(cx + r * .33, cy + r * .33, r * .08, fill=0, stroke=1)
    c.circle(cx + r * .52, cy + r * .5, r * .045, fill=0, stroke=1)


def page_cover(c):
    fit_image(c, ASSET / "03-storefront-3d.png", 0, 0, W, H, darken=.34)
    c.setFillColor(Color(0.13, 0, .18, .82))
    c.rect(0, 0, W * .45, H, fill=1, stroke=0)
    wave_mark(c, 104, H - 110, 42)
    c.setFillColor(white)
    c.setFont("CairoBold", 29)
    c.drawString(52, H - 182, "IN & OUT")
    c.setFont("CairoSemi", 13)
    c.drawString(55, H - 207, "LAUNDRY")
    rtl_text(c, "دليل الهوية البصرية والتصور الداخلي", W * .41, H - 285, 22, white, "CairoBold", W * .34, 35)
    rtl_text(c, "الفرع الجديد - إصدار مبدئي لمهندس الديكور", W * .41, H - 355, 11, LAV, "CairoSemi", W * .34, 20)
    c.setFillColor(PURPLE)
    c.roundRect(52, 64, 190, 34, 17, fill=1, stroke=0)
    rtl_text(c, "هوية ملكية • واضحة • قابلة للتنفيذ", 228, 75, 9, white, "CairoSemi")
    c.setFillColor(white)
    c.setFont("Cairo", 7.5)
    c.drawString(52, 34, "CONCEPT DESIGN / NOT FOR CONSTRUCTION")


def page_strategy(c):
    header(c, "الفكرة التصميمية", "01 / BRAND DIRECTION", 2)
    rtl_text(c, "فخامة نظيفة لا تعيق التشغيل", W - 44, H - 96, 15, PURPLE, "CairoBold")
    rtl_text(c, "يعتمد الفرع على خلفية بيضاء مضيئة ومساحات برقوقية عميقة، بينما يظهر البنفسجي الملكي كخط إرشاد وضوء مميز فقط. النتيجة مكان يبدو راقياً أمام العميل، ويظل عملياً وسهل الصيانة خلف الكاونتر.", W - 44, H - 124, 10.5, INK, "Cairo", 510, 18)
    section_card(c, 554, 267, 240, 104, "الانطباع", "راقي، منظم، موثوق، سريع، ونظيف بصرياً. لا تتحول الهوية إلى إضاءة نيون أو أسطح بنفسجية ثقيلة.")
    section_card(c, 294, 267, 240, 104, "قاعدة اللون", "70% أبيض وخزامي فاتح، 20% برقوقي، 8% فضي، و2% بنفسجي مضيء للتأكيد فقط.", VIOLET)
    section_card(c, 34, 267, 240, 104, "قاعدة التشغيل", "كل قرار جمالي يجب أن يحافظ على الممرات، صيانة المعدات، التهوية، مقاومة الرطوبة، وسهولة التنظيف.", SILVER)
    c.setFillColor(PLUM)
    c.roundRect(34, 62, 760, 170, 18, fill=1, stroke=0)
    wave_mark(c, 116, 147, 51)
    c.setFillColor(white)
    c.setFont("CairoBold", 28)
    c.drawString(190, 164, "IN & OUT")
    c.setFont("CairoSemi", 11)
    c.drawString(193, 137, "LAUNDRY")
    rtl_text(c, "الوعد المكاني", 753, 188, 10, LAV, "CairoSemi")
    rtl_text(c, "العميل يرى النظام والنظافة من أول خطوة، والفريق يجد كل أداة في مكانها دون ازدحام.", 753, 153, 16, white, "CairoBold", 350, 28)


def page_palette(c):
    header(c, "نظام الألوان", "02 / COLOR SYSTEM", 3)
    colors = [
        ("البنفسجي الملكي", "#8F00FF", PURPLE, "تأكيد، خط حركة، ضوء خفيف"),
        ("البرقوقي العميق", "#21002F", PLUM, "الكاونتر، الواجهة، خلفيات قوية"),
        ("البنفسجي الساتان", "#C026D3", VIOLET, "حالات ثانوية ولمسات رقمية"),
        ("الخزامي الفاتح", "#FBF7FF", PALE, "الخلفية العامة والأسقف"),
        ("الأبيض النقي", "#FFFFFF", white, "الجدران وأسطح العمل"),
        ("الفضي الصناعي", "#B9BDC7", SILVER, "الحروف، الركلات، المعدات"),
    ]
    x0, y = 34, H - 128
    for i, (name, code, col, use) in enumerate(colors):
        col_x = x0 + (i % 3) * 254
        row_y = y - (i // 3) * 178
        c.setFillColor(white)
        c.roundRect(col_x, row_y - 124, 234, 145, 14, fill=1, stroke=0)
        c.setFillColor(col)
        c.roundRect(col_x + 12, row_y - 48, 210, 57, 10, fill=1, stroke=0)
        if col == white:
            c.setStrokeColor(LINE); c.roundRect(col_x + 12, row_y - 48, 210, 57, 10, fill=0, stroke=1)
        rtl_text(c, name, col_x + 218, row_y - 72, 11, PLUM, "CairoBold")
        c.setFillColor(MUTED); c.setFont("CairoSemi", 8); c.drawString(col_x + 14, row_y - 72, code)
        rtl_text(c, use, col_x + 218, row_y - 98, 8.2, MUTED, "Cairo", 200, 13)
    c.setFillColor(PLUM)
    c.roundRect(34, 50, 760, 70, 14, fill=1, stroke=0)
    rtl_text(c, "ممنوعات اللون", 760, 91, 10, LAV, "CairoBold")
    rtl_text(c, "لا أزرق أو أخضر أو برتقالي أو ذهبي في عناصر العلامة. لا يستخدم البنفسجي على مساحات كبيرة داخل منطقة العمل.", 760, 65, 9.4, white, "Cairo", 660, 15)


def page_zoning(c):
    header(c, "تقسيم الفراغ ومسار العمل", "03 / SPATIAL LOGIC", 4)
    # Simplified plan based on the supplied drawing.
    px, py, pw, ph = 34, 76, 500, 400
    c.setFillColor(white); c.roundRect(px, py, pw, ph, 14, fill=1, stroke=0)
    c.setStrokeColor(PLUM); c.setLineWidth(2); c.rect(px + 18, py + 18, pw - 36, ph - 36, fill=0, stroke=1)
    # Reception L counter
    c.setFillColor(PLUM); c.roundRect(px + 30, py + 35, 210, 50, 5, fill=1, stroke=0); c.rect(px + 190, py + 35, 50, 170, fill=1, stroke=0)
    rtl_text(c, "الاستقبال", px + 178, py + 53, 9, white, "CairoBold")
    # Conveyor
    c.setFillColor(LAV); c.roundRect(px + 277, py + 52, 70, 250, 12, fill=1, stroke=0)
    c.setStrokeColor(PURPLE); c.roundRect(px + 277, py + 52, 70, 250, 12, fill=0, stroke=1)
    rtl_text(c, "الكونفير", px + 338, py + 166, 9, PLUM, "CairoBold")
    # machines and ironing
    for xx, yy, ww, hh, label in [
        (px+40, py+290, 75, 65, "غسالة صغيرة"), (px+150, py+290, 95, 65, "غسالة كبيرة"),
        (px+275, py+310, 110, 55, "نشافة كبيرة"), (px+385, py+230, 60, 115, "كي عادي"),
        (px+382, py+95, 65, 115, "كي بخار")]:
        c.setFillColor(FLOOR); c.roundRect(xx, yy, ww, hh, 5, fill=1, stroke=0)
        rtl_text(c, label, xx+ww-7, yy+hh/2-3, 7.4, PLUM, "CairoSemi", ww-14, 11)
    c.setStrokeColor(PURPLE); c.setLineWidth(3)
    p = c.beginPath(); p.moveTo(px+65, py+108); p.lineTo(px+260, py+108); p.lineTo(px+260, py+275); p.lineTo(px+410, py+275); c.drawPath(p, stroke=1, fill=0)
    c.setFillColor(PURPLE); c.circle(px+410, py+275, 5, fill=1, stroke=0)
    rtl_text(c, "المخطط إرشادي مستخلص من الرسم المرفق، وليس مخطط تنفيذ.", px+pw-28, py+25, 7.5, MUTED, "Cairo")
    rtl_text(c, "تسلسل مقترح", W - 44, H - 114, 13, PURPLE, "CairoBold")
    items = ["استلام وفحص أولي عند الكاونتر.", "نقل الطلب إلى الغسيل والتجفيف دون تقاطع مع العميل.", "الكي العادي أو البخاري مع تخزين الأدوات فوق محطات العمل.", "تعليق القطع على الكونفير وترتيبها حسب الطلب.", "تسليم من نقطة الاستقبال مع بقاء منطقة الإنتاج واضحة ومنظمة."]
    bullet_list(c, items, W - 44, H - 150, 245, 9.2, 8)
    c.setFillColor(PLUM); c.roundRect(558, 80, 236, 102, 12, fill=1, stroke=0)
    rtl_text(c, "ممرات الحركة", 775, 151, 10, LAV, "CairoBold")
    rtl_text(c, "المستهدف 1000 مم صافي للممر الرئيسي و900 مم كحد أدنى محلي، ويعتمد النهائي على كود البلدية ومتطلبات الدفاع المدني.", 775, 124, 8.7, white, "Cairo", 195, 14)


def page_reception(c):
    header(c, "الكاونتر وحائط الاستقبال", "04 / RECEPTION CONCEPT", 5)
    fit_image(c, ASSET / "01-reception-counter-3d.png", 34, 164, 760, 335, 16)
    c.setFillColor(Color(0.13, 0, .18, .86)); c.roundRect(52, 184, 300, 96, 12, fill=1, stroke=0)
    rtl_text(c, "نقطة العلامة الأقوى", 330, 250, 10, LAV, "CairoBold")
    rtl_text(c, "كتلة برقوقية هادئة، سطح أبيض، خط ضوء بنفسجي مضبوط، وحائط شعار أبيض محزز يظل واضحاً من الشارع.", 330, 223, 9, white, "Cairo", 255, 14)
    pills = [("سطح كوارتز أبيض", 34, 112, 145), ("HPL مقاوم للرطوبة", 190, 112, 158), ("ركلة ستانلس", 359, 112, 125), ("LED قابل للصيانة", 495, 112, 145)]
    for text_, x, y, w in pills: pill(c, text_, x, y, w)
    rtl_text(c, "ملاحظة: الشاشة والأسلاك والطابعة داخل مسار مخفي مع فتحة صيانة، ولا يظهر أي كابل للعميل.", W - 44, 71, 8.8, MUTED, "CairoSemi", 730, 14)


def page_counter_specs(c):
    header(c, "مقاسات الكاونتر المقترحة", "05 / COUNTER ELEVATION", 6)
    # elevation drawing
    x, y, w, h = 34, 122, 500, 315
    c.setFillColor(white); c.roundRect(x, y, w, h, 14, fill=1, stroke=0)
    floor_y = y + 48
    c.setStrokeColor(MUTED); c.line(x+32, floor_y, x+w-30, floor_y)
    c.setFillColor(PLUM); c.roundRect(x+55, floor_y, 355, 156, 6, fill=1, stroke=0)
    c.setFillColor(white); c.rect(x+48, floor_y+156, 370, 18, fill=1, stroke=0)
    c.setFillColor(PURPLE); c.rect(x+55, floor_y+143, 355, 6, fill=1, stroke=0)
    c.setFillColor(SILVER); c.rect(x+55, floor_y, 355, 10, fill=1, stroke=0)
    c.setFillColor(white); c.rect(x+245, floor_y+98, 100, 76, fill=1, stroke=0)
    c.setStrokeColor(PURPLE); c.setLineWidth(1)
    # dimensions
    c.line(x+35, floor_y, x+35, floor_y+174); c.line(x+29, floor_y, x+41, floor_y); c.line(x+29, floor_y+174, x+41, floor_y+174)
    c.saveState(); c.translate(x+20, floor_y+70); c.rotate(90); c.setFont("CairoSemi", 8); c.setFillColor(PLUM); c.drawString(0,0,"1050 mm"); c.restoreState()
    c.line(x+55, floor_y-22, x+410, floor_y-22); c.line(x+55, floor_y-28, x+55, floor_y-16); c.line(x+410, floor_y-28, x+410, floor_y-16)
    c.setFont("CairoSemi", 8); c.setFillColor(PLUM); c.drawCentredString(x+232, floor_y-37, "2450 mm - VERIFY ON SITE")
    rtl_text(c, "قطاع واجهة مبدئي", x+w-28, y+h-31, 10, PLUM, "CairoBold")
    rtl_text(c, "جميع المقاسات بالملليمتر", x+w-28, y+h-51, 7.5, MUTED, "Cairo")
    rtl_text(c, "مواصفات التصنيع", W - 44, H - 114, 13, PURPLE, "CairoBold")
    items = ["ارتفاع سطح الموظف 1050 مم تقريباً، وعمق سطح العمل 650-700 مم.", "جزء عميل منخفض 760-800 مم عند الحاجة لإتاحة أفضل، بعرض لا يقل عن 900 مم.", "سطح كوارتز أو Solid Surface سماكة ظاهرية 30-40 مم وحواف مستديرة خفيفة.", "جسم HPL مقاوم للرطوبة على خشب بحري أو لوح مدمج حسب اعتماد المقاول.", "ركلة ستانلس بارتفاع 100 مم، وLED داخل بروفايل ألمنيوم مع غطاء Opal.", "فتحات كهرباء وبيانات وUPS داخلية، وباب صيانة قابل للقفل من جهة الموظف."]
    bullet_list(c, items, W-44, H-150, 245, 8.8, 6)


def page_storefront(c):
    header(c, "الواجهة الخارجية", "06 / STOREFRONT", 7)
    fit_image(c, ASSET / "03-storefront-3d.png", 34, 154, 760, 345, 16)
    c.setFillColor(Color(0.13, 0, .18, .88)); c.roundRect(52, 174, 282, 105, 12, fill=1, stroke=0)
    rtl_text(c, "حضور واضح من بعيد", 312, 249, 10, LAV, "CairoBold")
    rtl_text(c, "فاشيا برقوقية مطفية، حروف فضية مضيئة، زجاج شفاف، وفيلم موجي مصنفر يحفظ الخصوصية دون إغلاق الواجهة.", 312, 220, 9, white, "Cairo", 236, 14)
    bullet_list(c, ["الحروف Channel Letters بوجه فضي أو أبيض، وإضاءة خلفية بنفسجية خفيفة.", "ارتفاع الحروف يحدد بعد الرفع الميداني؛ مقترح 350-500 مم حسب عرض الفاشيا.", "فيلم الخصوصية بين 850 و1200 مم من منسوب الأرض، مع موجة متكررة بسيطة.", "المدخل خالٍ من العتبات قدر الإمكان، مع إغلاق هادئ ومقبض واضح."], W-44, 119, 720, 8.6, 5)


def page_production(c):
    header(c, "منطقة التشغيل والتخزين العلوي", "07 / PRODUCTION AREA", 8)
    fit_image(c, ASSET / "02-production-area-3d.png", 34, 164, 760, 335, 16)
    c.setFillColor(Color(0.13, 0, .18, .88)); c.roundRect(500, 184, 276, 106, 12, fill=1, stroke=0)
    rtl_text(c, "التخزين جزء من النظام", 754, 260, 10, LAV, "CairoBold")
    rtl_text(c, "خزائن مغلقة فوق طاولتي الكي، ووحدات علوية مهواة فوق منطقة الغسيل مع بقاء الصيانة والتهوية والخدمات مكشوفة عند الحاجة.", 754, 230, 9, white, "Cairo", 230, 14)
    pills = [("عمق 350-400 مم", 34, 112, 144), ("خلوص رأس آمن", 189, 112, 135), ("HPL مقاوم للبخار", 335, 112, 153), ("إضاءة 4000K", 499, 112, 130), ("أبواب Soft-close", 640, 112, 154)]
    for text_, x, y, w in pills: pill(c, text_, x, y, w)
    rtl_text(c, "لا تخزن مواد قابلة للاشتعال أو عبوات حساسة للحرارة فوق معدات البخار. يعتمد الخلوص النهائي على كتالوج كل ماكينة.", W-44, 69, 8.8, MUTED, "CairoSemi", 730, 14)


def page_finishes(c):
    header(c, "جدول المواد والتشطيبات", "08 / FINISHES SCHEDULE", 9)
    rows = [
        ("الأرضية العامة", "بورسلان تجاري رمادي فاتح، تصنيف انزلاق R10، فواصل قليلة ولون جراوت متوسط"),
        ("منطقة المعدات", "نفس الأرضية أو نظام أعلى مقاومة حسب متطلبات الصرف، مع وزرة صحية"),
        ("الجدران", "دهان قابل للغسيل أو ألواح صحية بيضاء في مناطق الرذاذ والبخار"),
        ("الكاونتر", "HPL برقوقي مطفي، سطح كوارتز أبيض، ركلة ستانلس 304"),
        ("حائط الشعار", "ألواح محززة دافئة البياض، قابلة للفك حول نقاط الكهرباء والصيانة"),
        ("الخزائن العلوية", "HPL أبيض مطفي مقاوم للرطوبة، حافة برقوقية، مفصلات Soft-close"),
        ("الفاشيا", "ألواح ACP مطفية بالبرقوقي العميق، تفاصيل تمدد ومقاومة UV"),
        ("الحروف", "ستانلس أو ألمنيوم مطلي، إضاءة LED 4000K وهالة بنفسجية منخفضة الشدة"),
    ]
    x, y, w = 34, H-125, 760
    c.setFillColor(PLUM); c.roundRect(x, y, w, 35, 9, fill=1, stroke=0)
    rtl_text(c, "المواصفة", x+w-18, y+11, 9, white, "CairoBold")
    rtl_text(c, "العنصر", x+205, y+11, 9, white, "CairoBold")
    row_h = 47
    for i,(name,spec) in enumerate(rows):
        ry = y-(i+1)*row_h
        c.setFillColor(white if i%2==0 else PALE); c.rect(x, ry, w, row_h-2, fill=1, stroke=0)
        rtl_text(c, name, x+195, ry+17, 8.5, PLUM, "CairoBold", 160, 12)
        rtl_text(c, spec, x+w-18, ry+23, 8.1, INK, "Cairo", 535, 12)
    rtl_text(c, "يقدم المقاول عينات فعلية واعتماد لون ولمعان قبل أمر الشراء.", W-44, 54, 8.5, MUTED, "CairoSemi")


def page_graphics(c):
    header(c, "اللافتات والإضاءة", "09 / SIGNAGE & LIGHT", 10)
    section_card(c, 554, 330, 240, 125, "حروف العلامة", "استخدم ملف الشعار المتجهي المعتمد. لا يعاد رسم الشعار من صورة التصور. تباعد الحروف مريح، والحروف الثانوية LAUNDRY أصغر بوضوح.")
    section_card(c, 294, 330, 240, 125, "لغة الإرشاد", "عناوين قصيرة بالعربية مع الإنجليزية عند الحاجة. خط Cairo SemiBold. أبيض على برقوقي أو برقوقي على أبيض.", VIOLET)
    section_card(c, 34, 330, 240, 125, "أيقونة الموجة", "تستخدم كعلامة ثانوية على الزجاج والأبواب والزي، ولا تكرر بكثافة داخل الفرع.", SILVER)
    c.setFillColor(white); c.roundRect(34, 70, 500, 225, 14, fill=1, stroke=0)
    rtl_text(c, "طبقات الإضاءة", 510, 266, 12, PLUM, "CairoBold")
    # lighting bars
    lighting = [("إضاءة عامة", "4000K / CRI 90+ / بدون وهج", 0.85), ("إضاءة الكي", "4000K / مستمرة أسفل الخزائن", 0.7), ("حائط الشعار", "3500-4000K / غسيل ضوئي ناعم", .58), ("التأكيد البنفسجي", "شدة منخفضة / Dimmable", .32)]
    yy=225
    for name, spec, ratio in lighting:
        rtl_text(c, name, 495, yy, 9, PLUM, "CairoBold")
        c.setFillColor(LINE); c.roundRect(70, yy-4, 280, 8, 4, fill=1, stroke=0)
        c.setFillColor(PURPLE if ratio<.5 else VIOLET); c.roundRect(70, yy-4, 280*ratio, 8, 4, fill=1, stroke=0)
        c.setFillColor(MUTED); c.setFont("Cairo",7.5); c.drawString(70, yy-20, spec)
        yy -= 46
    c.setFillColor(PLUM); c.roundRect(558, 70, 236, 225, 14, fill=1, stroke=0)
    rtl_text(c, "مبادئ واجبة", 770, 263, 11, LAV, "CairoBold")
    bullet_list(c, ["لا إضاءة بنفسجية مباشرة على الملابس لفترات طويلة.", "لا وميض ولا شرائط LED مكشوفة.", "توحيد حرارة اللون في منطقة العمل.", "دوائر مستقلة للافتة، الديكور، والعمل.", "مخارج السائقين قابلة للصيانة."], 770, 229, 192, 8.4, 6, white)


def page_coordination(c):
    header(c, "تنسيق الخدمات والسلامة", "10 / MEP & SAFETY", 11)
    cols = [
        ("الكهرباء والبيانات", ["أحمال مستقلة لكل ماكينة حسب لوحة المصنع.", "UPS للـPOS والراوتر ونقاط بيانات مخفية.", "لا تمرير كابلات داخل مناطق ساخنة أو رطبة دون حماية."]),
        ("المياه والصرف", ["محابس وصول واضحة، صرف أرضي، وميول معتمدة.", "صواني تسريب أو حساسات حيث يوصي المورد.", "وزرات محكمة وسيليكون صحي عند الاختراقات."]),
        ("التهوية والحرارة", ["اعتماد طرد النشافة والبخار من مهندس MEP.", "عدم إغلاق فتحات الماكينات بالخزائن.", "موازنة الهواء للحفاظ على راحة الموظفين."]),
        ("الحريق والوصول", ["عدم حجب الرشاشات أو الكواشف أو مخارج الطوارئ.", "تثبيت الخزائن العلوية إنشائياً وبأقفال مناسبة.", "مراجعة متطلبات البلدية والدفاع المدني وإتاحة الوصول."]),
    ]
    positions=[(424,286),(34,286),(424,76),(34,76)]
    for (title,items),(x,y) in zip(cols,positions):
        c.setFillColor(white); c.roundRect(x,y,370,180,14,fill=1,stroke=0)
        c.setFillColor(PURPLE); c.roundRect(x+18,y+132,334,34,10,fill=1,stroke=0)
        rtl_text(c,title,x+334,y+143,10,white,"CairoBold")
        bullet_list(c,items,x+334,y+111,310,8.5,5)
    rtl_text(c,"تنبيه: هذه الوثيقة توجه الهوية والفراغ. الحسابات الإنشائية والكهربائية والميكانيكية والحريق مسؤولية الاستشاريين والمقاولين المرخصين.",W-44,48,8.2,MUTED,"CairoSemi",740,13)


def page_handoff(c):
    header(c, "حزمة التسليم لمهندس الديكور", "11 / NEXT ACTIONS", 12)
    rtl_text(c, "قبل بدء الرسومات التنفيذية", W-44, H-108, 15, PURPLE, "CairoBold")
    items = [
        "رفع ميداني كامل: عرض وارتفاع الواجهة، مناسيب الأرض، الأعمدة، الأبواب، والأسقف.",
        "تثبيت موديلات جميع الماكينات ومخططات الخدمات والخلوص والصيانة من المورد.",
        "إعداد مخطط تنفيذي للكاونتر والخزائن واللافتة مع قطاعات وتفاصيل تثبيت.",
        "مراجعة مسار الكونفير وحدود الحركة قبل تثبيت الخزائن أو وحدات الإضاءة.",
        "اعتماد عينات اللون والـHPL والكوارتز وACP والفيلم المصنفر تحت إضاءة الموقع.",
        "تنسيق الكهرباء والمياه والصرف والتهوية والحريق في مخطط واحد Clash-free.",
        "تجربة Mock-up لجزء من الكاونتر وحائط الشعار قبل التصنيع الكامل.",
        "اعتماد ملف الشعار المتجهي النهائي ونظام اللافتات من المالك.",
    ]
    bullet_list(c, items, W-44, H-150, 730, 10, 7)
    c.setFillColor(PLUM); c.roundRect(34, 62, 760, 90, 16, fill=1, stroke=0)
    rtl_text(c, "حالة الوثيقة", 760, 120, 10, LAV, "CairoBold")
    rtl_text(c, "تصور هوية وتصميم مبدئي جاهز للتطوير إلى رسومات تنفيذية. الأبعاد الظاهرة تقديرية وتراجع بالموقع وبكتالوجات المعدات قبل التصنيع.", 760, 90, 10, white, "Cairo", 675, 17)


def build():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(OUT), pagesize=(W,H), pageCompression=1)
    c.setTitle("IN & OUT Laundry - New Branch Visual Identity")
    pages = [page_cover, page_strategy, page_palette, page_zoning, page_reception, page_counter_specs, page_storefront, page_production, page_finishes, page_graphics, page_coordination, page_handoff]
    for fn in pages:
        fn(c)
        c.showPage()
    c.save()
    print(OUT)


if __name__ == "__main__":
    build()
