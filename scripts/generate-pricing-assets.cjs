const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const pricingSourcePath = path.join(root, 'apps', 'customer-site', 'src', 'data', 'pricingData.ts');
const publicRoot = path.join(root, 'apps', 'customer-site', 'public');
const publicPricingDir = path.join(root, 'apps', 'customer-site', 'public', 'pricing');
const iconSourceDir = path.join(publicRoot, 'items_Icons');
const iconThumbDir = path.join(publicPricingDir, 'icon-thumbs');
const workflowPricingKbPath = path.join(root, 'workflows', 'INOUT_LAUNDRY_PRICE_LIST.md');

const PUBLIC_BASE_URL = 'https://www.inandoutuae.com';
const PDF_FILE = 'inout-laundry-price-list.pdf';
const PNG_FILE = 'inout-laundry-price-card.png';
const FULL_HTML_FILE = 'inout-laundry-price-list.html';
const CARD_HTML_FILE = 'inout-laundry-price-card.html';
const PDF_DRAFT_FILE = 'inout-laundry-price-list.next.pdf';
const ICON_THUMB_BASE = './icon-thumbs';
const ICON_SOURCE_BASE = '../items_Icons';

const categoryLabels = {
  men: 'رجالي',
  women: 'نسائي',
  kids: 'أطفال',
  home: 'منزلي',
};

const itemIconPaths = {
  '1': 'Women/women_jallabiya.png',
  '2': 'men_fanela.png',
  '3': 'Women/women_abaya.png',
  '4': 'men_army_uniform.png',
  '5': 'Home/home_bedsheet_big.png',
  '6': 'men_gutra.png',
  '7': 'men_gutra_wool.png',
  '8': 'men_jacket.png',
  '9': 'men_jacket_leather.png',
  '10': 'Women/women_jallabiya.png',
  '11': 'men_jujitsu_uniform.png',
  '12': 'men_kandoora.png',
  '13': 'men_kandoora_tarbosh.png',
  '14': 'Home/home_bedsheet_small.png',
  '15': 'men_kandoora_wool.png',
  '16': 'men_overholl.png',
  '17': 'men_overcoat.png',
  '18': 'men_pants.png',
  '19': 'men_bisht.png',
  '20': 'Home/home_pillow_case.png',
  '21': 'men_police_uniform.png',
  '22': 'Women/women_sheela.png',
  '23': 'Home/home_blanket_big.png',
  '24': 'Home/home_blanket_small.png',
  '25': 'men_shirt.png',
  '26': 'Women/women_blouse.png',
  '27': 'men_short.png',
  '28': 'Women/women_jallabiya.png',
  '29': 'men_socks.png',
  '30': 'men_suit.png',
  '31': 'men_sweater_wool.png',
  '32': 'men_special_takeya.png',
  '33': 'men_t_shirt.png',
  '35': 'OUTTY/outty-order-basket.png',
  '36': 'OUTTY/outty-washing-machine.png',
  '37': 'men_takeya.png',
  '38': 'Women/women_jallabiya.png',
  '58': 'Home/home_curtain_big.png',
  '59': 'men_tie.png',
  '60': 'Home/home_towel.png',
  '61': 'men_underwear.png',
  '62': 'Home/home_curtain_medium.png',
  '63': 'Home/home_curtain_small.png',
  '117': 'Women/women_jallabiya.png',
  '889909': 'men_wezar.png',
  '889910': 'OUTTY/outty-order-basket.png',
  '889911': 'Women/women_jallabiya.png',
  '889913': 'Home/home_bedsheet_single.png',
  '889914': 'Home/home_dovet.png',
  '889915': 'Home/home_pillow.png',
  '889916': 'Women/women_niqab.png',
  '889917': 'Home/home_sofa_cover.png',
};

const categoryIconFallbacks = {
  men: 'men_shirt.png',
  women: 'Women/women_abaya.png',
  kids: 'OUTTY/outty-order-basket.png',
  home: 'Home/home_blanket_big.png',
};

const popularBarcodes = new Set([
  '12',
  '3',
  '25',
  '18',
  '6',
  '22',
  '30',
  '23',
  '24',
  '36',
  '58',
  '117',
]);

const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const formatPrice = (value) => {
  const raw = String(value ?? '').trim();
  if (!raw || raw === '0' || raw === '0.00') return 'غير متاح';
  if (/sq\s*meter/i.test(raw)) return raw.replace(/10\s*x\s*sq\s*meter/i, '10 لكل م²');
  const number = Number(raw);
  if (Number.isFinite(number)) return `${number.toFixed(number % 1 === 0 ? 0 : 2)} درهم`;
  return raw;
};

const resolveIconRelativePath = (item) =>
  itemIconPaths[String(item.barcode)] || categoryIconFallbacks[item.category] || 'OUTTY/outty-washing-machine.png';

const safeThumbName = (relativeIconPath) => relativeIconPath.replace(/[\\/]/g, '__').replace(/[^a-zA-Z0-9_.-]/g, '_');

const findPowerShell = () => {
  const candidates = [
    process.env.PWSH_PATH,
    'C:\\Program Files\\PowerShell\\7\\pwsh.exe',
    'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe',
  ].filter(Boolean);
  return candidates.find((candidate) => fs.existsSync(candidate));
};

const resizeIconWithPowerShell = (sourcePath, destinationPath) => {
  const shell = findPowerShell();
  if (!shell) return false;

  const resizeScriptPath = path.join(publicPricingDir, '.resize-pricing-icon.ps1');
  const resizeScript = `
param([string]$Source, [string]$Destination, [int]$Size = 128)
Add-Type -AssemblyName System.Drawing
$image = [System.Drawing.Image]::FromFile($Source)
try {
  $canvas = New-Object System.Drawing.Bitmap $Size, $Size
  $canvas.SetResolution(96, 96)
  $graphics = [System.Drawing.Graphics]::FromImage($canvas)
  try {
    $graphics.Clear([System.Drawing.Color]::Transparent)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $scale = [Math]::Min($Size / $image.Width, $Size / $image.Height)
    $width = [int]($image.Width * $scale)
    $height = [int]($image.Height * $scale)
    $x = [int](($Size - $width) / 2)
    $y = [int](($Size - $height) / 2)
    $graphics.DrawImage($image, $x, $y, $width, $height)
    $canvas.Save($Destination, [System.Drawing.Imaging.ImageFormat]::Png)
  } finally {
    $graphics.Dispose()
    $canvas.Dispose()
  }
} finally {
  $image.Dispose()
}
`;

  fs.writeFileSync(resizeScriptPath, resizeScript.trim(), 'utf8');
  const result = spawnSync(shell, ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', resizeScriptPath, sourcePath, destinationPath, '128'], {
    stdio: 'pipe',
    encoding: 'utf8',
  });
  try {
    fs.unlinkSync(resizeScriptPath);
  } catch {
    // Best-effort cleanup only.
  }
  if (result.status !== 0) {
    console.warn(`Icon thumbnail generation failed for ${sourcePath}`);
    if (result.stderr) console.warn(result.stderr.trim());
    return false;
  }
  return true;
};

const iconPathForItem = (item) => {
  const relativeIconPath = resolveIconRelativePath(item);
  const sourcePath = path.join(iconSourceDir, relativeIconPath);
  const thumbName = safeThumbName(relativeIconPath);
  const thumbPath = path.join(iconThumbDir, thumbName);

  if (!fs.existsSync(sourcePath)) return `${ICON_SOURCE_BASE}/${relativeIconPath}`;
  fs.mkdirSync(iconThumbDir, { recursive: true });

  const sourceStat = fs.statSync(sourcePath);
  const thumbIsFresh = fs.existsSync(thumbPath) && fs.statSync(thumbPath).mtimeMs >= sourceStat.mtimeMs;
  if (!thumbIsFresh && !resizeIconWithPowerShell(sourcePath, thumbPath)) return `${ICON_SOURCE_BASE}/${relativeIconPath}`;

  return `${ICON_THUMB_BASE}/${thumbName}`;
};

const readPricingData = () => {
  const source = fs.readFileSync(pricingSourcePath, 'utf8');
  const match = source.match(/RAW_PRICING_DATA\s*:\s*PriceItem\[\]\s*=\s*(\[[\s\S]*?\]);/);
  if (!match) throw new Error(`Could not find RAW_PRICING_DATA in ${pricingSourcePath}`);
  return Function(`"use strict"; return (${match[1]});`)();
};

const groupByCategory = (items) =>
  items.reduce((groups, item) => {
    const category = item.category || 'other';
    if (!groups[category]) groups[category] = [];
    groups[category].push(item);
    return groups;
  }, {});

const priceCells = (item) => `
  <td>${escapeHtml(formatPrice(item.wash_dry))}</td>
  <td>${escapeHtml(formatPrice(item.wash_iron_urgent))}</td>
  <td>${escapeHtml(formatPrice(item.iron))}</td>
  <td>${escapeHtml(formatPrice(item.iron_urgent))}</td>
`;

const renderRows = (items) =>
  items
    .map(
      (item) => `
      <tr>
        <td class="item-cell">
          <span class="icon-wrap">
            <img class="item-icon" src="${escapeHtml(iconPathForItem(item))}" alt="" />
          </span>
          <span>
            <strong>${escapeHtml(item.name_ar)}</strong>
            <em>${escapeHtml(item.name_en)}</em>
          </span>
        </td>
        ${priceCells(item)}
      </tr>`
    )
    .join('\n');

const sharedStyles = `
  @page { size: A4; margin: 14mm; }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: "Aptos Display", "Segoe UI Variable Display", "Segoe UI", Tahoma, Arial, sans-serif;
    color: #180b20;
    background:
      radial-gradient(circle at 10% 8%, rgba(255, 209, 102, .34), transparent 30%),
      radial-gradient(circle at 92% 5%, rgba(38, 224, 230, .32), transparent 34%),
      radial-gradient(circle at 70% 85%, rgba(154, 47, 131, .30), transparent 32%),
      linear-gradient(135deg, #170623 0%, #2b084f 34%, #6f1d63 70%, #083f4a 100%);
    direction: rtl;
  }
  .page {
    min-height: 100vh;
    padding: 28px;
  }
  .sheet {
    background:
      linear-gradient(180deg, rgba(255,255,255,.96), rgba(255,250,255,.93)),
      radial-gradient(circle at top right, rgba(255,255,255,.92), transparent 45%);
    border: 1px solid rgba(255, 223, 150, .34);
    border-radius: 28px;
    box-shadow: 0 28px 95px rgba(7, 0, 18, .28);
    overflow: hidden;
  }
  .hero {
    padding: 28px 32px;
    background:
      radial-gradient(circle at 14% 16%, rgba(255, 220, 140, .34), transparent 30%),
      radial-gradient(circle at 86% 0%, rgba(72, 226, 231, .24), transparent 28%),
      linear-gradient(135deg, rgba(43,8,79,.98), rgba(111,29,99,.96) 58%, rgba(8,63,74,.94));
    color: white;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
  }
  .brand {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .brand-mark {
    width: 62px;
    height: 62px;
    border-radius: 20px;
    background: linear-gradient(145deg, #ffffff, #fff4dc);
    padding: 8px;
    object-fit: contain;
    box-shadow: 0 18px 38px rgba(0, 0, 0, .20);
  }
  .eyebrow {
    margin: 0 0 8px;
    font-size: 12px;
    letter-spacing: .18em;
    text-transform: uppercase;
    opacity: .78;
  }
  h1 {
    margin: 0;
    font-size: 34px;
    line-height: 1.15;
    font-weight: 900;
    letter-spacing: -.02em;
    text-shadow: 0 6px 26px rgba(0, 0, 0, .22);
  }
  .subtitle {
    margin: 10px 0 0;
    opacity: .9;
    font-size: 15px;
  }
  .badge {
    padding: 10px 14px;
    border-radius: 999px;
    background: rgba(255, 231, 169, .18);
    border: 1px solid rgba(255, 223, 150, .36);
    font-size: 13px;
    white-space: nowrap;
  }
  .note {
    margin: 20px 24px 0;
    padding: 14px 18px;
    border-radius: 18px;
    background: linear-gradient(135deg, #fff8e6, #fff1f8);
    color: #51310a;
    font-size: 13px;
    border: 1px solid rgba(158,111,10,.18);
  }
  .section {
    padding: 22px 24px 6px;
  }
  h2 {
    margin: 0 0 14px;
    font-size: 19px;
    color: #62124f;
    font-weight: 900;
  }
  table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    overflow: hidden;
    border-radius: 18px;
    border: 1px solid #ead9ea;
    background: white;
    font-size: 12px;
  }
  th {
    background: linear-gradient(135deg, #f9ecfb, #fff5df);
    color: #4f0e42;
    font-size: 11px;
    padding: 10px 8px;
    text-align: right;
    white-space: nowrap;
  }
  td {
    padding: 10px 8px;
    border-top: 1px solid #f0e7f0;
    vertical-align: middle;
  }
  tr:nth-child(even) td { background: #fcf8fc; }
  .item-cell {
    min-width: 185px;
    display: flex;
    align-items: center;
    gap: 9px;
  }
  .icon-wrap {
    width: 34px;
    height: 34px;
    flex: 0 0 34px;
    border-radius: 12px;
    display: grid;
    place-items: center;
    background: radial-gradient(circle at 30% 20%, #ffffff, #f5eaf7 58%, #f3dba5);
    border: 1px solid rgba(98, 18, 79, .12);
    box-shadow: inset 0 1px 0 rgba(255,255,255,.8), 0 8px 20px rgba(69, 15, 72, .08);
    overflow: hidden;
  }
  .item-icon {
    width: 28px;
    height: 28px;
    object-fit: contain;
    display: block;
  }
  strong { display: block; font-size: 13px; color: #190a21; font-weight: 850; }
  em { display: block; font-family: "Segoe UI", Arial, sans-serif; font-style: normal; color: #6f6073; font-size: 10px; margin-top: 2px; direction: ltr; text-align: right; font-weight: 700; }
  .footer {
    padding: 18px 24px 24px;
    display: flex;
    justify-content: space-between;
    gap: 12px;
    color: #6d6170;
    font-size: 11px;
  }
  .ltr { direction: ltr; }
`;

const renderFullHtml = (items) => {
  const groups = groupByCategory(items);
  const categories = ['men', 'women', 'kids', 'home'].filter((category) => groups[category]?.length);
  return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>In & Out Laundry Price List</title>
  <style>${sharedStyles}</style>
</head>
<body>
  <main class="page">
    <section class="sheet">
      <header class="hero">
        <div class="brand">
          <img class="brand-mark" src="../brand/logo-in-and-out-laundry.png" alt="In & Out Laundry" />
          <div>
            <p class="eyebrow">IN & OUT LAUNDRY</p>
            <h1>قائمة الأسعار</h1>
            <p class="subtitle">غسيل، كي، وخدمات مستعجلة حسب نوع القطعة</p>
          </div>
        </div>
        <div class="badge">AED • شامل الأسعار الأساسية</div>
      </header>
      <p class="note">ملاحظة: الأسعار من قائمة الموقع الحالية. القطع الحساسة أو المزينة أو الحالات الخاصة قد تحتاج فحصًا قبل تأكيد الخدمة النهائية.</p>
      ${categories
        .map(
          (category) => `
      <section class="section">
        <h2>${categoryLabels[category] || category}</h2>
        <table>
          <thead>
            <tr>
              <th>القطعة</th>
              <th>غسيل وتجفيف</th>
              <th>غسيل وكي مستعجل</th>
              <th>كي فقط</th>
              <th>كي مستعجل</th>
            </tr>
          </thead>
          <tbody>${renderRows(groups[category])}</tbody>
        </table>
      </section>`
        )
        .join('\n')}
      <footer class="footer">
        <span>In & Out Laundry • خدمة عملاء واتساب</span>
        <span class="ltr">${PUBLIC_BASE_URL}/pricing/${PDF_FILE}</span>
      </footer>
    </section>
  </main>
</body>
</html>`;
};

const renderCardHtml = (items) => {
  const popular = items.filter((item) => popularBarcodes.has(String(item.barcode))).slice(0, 10);
  return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>In & Out Laundry Price Card</title>
  <style>
    ${sharedStyles}
    body { width: 1080px; height: 1440px; overflow: hidden; }
    .page { width: 1080px; height: 1440px; padding: 44px; }
    .sheet { height: 100%; border-radius: 42px; position: relative; }
    .sheet::before {
      content: "";
      position: absolute;
      inset: 0;
      pointer-events: none;
      background:
        radial-gradient(circle at 8% 12%, rgba(255, 219, 140, .18), transparent 18%),
        radial-gradient(circle at 92% 78%, rgba(37, 219, 226, .16), transparent 22%);
      z-index: 0;
    }
    .sheet > * { position: relative; z-index: 1; }
    .hero { padding: 42px 48px; }
    .brand-mark { width: 86px; height: 86px; border-radius: 26px; }
    h1 { font-size: 60px; }
    .subtitle { font-size: 25px; }
    .badge { font-size: 20px; padding: 16px 22px; }
    .note { margin: 28px 36px 0; font-size: 21px; line-height: 1.55; padding: 22px 26px; }
    .grid { padding: 34px 36px; display: grid; grid-template-columns: repeat(2, 1fr); gap: 18px; }
    .card {
      border-radius: 26px;
      background: linear-gradient(145deg, rgba(255,255,255,.98), rgba(255,247,254,.96));
      border: 1px solid rgba(111,29,99,.13);
      padding: 20px;
      display: grid;
      grid-template-columns: 78px 1fr;
      gap: 16px;
      align-items: start;
      box-shadow: 0 16px 38px rgba(35, 8, 52, .11);
    }
    .card .icon-wrap {
      width: 78px;
      height: 78px;
      border-radius: 24px;
      display: grid;
      place-items: center;
      background:
        radial-gradient(circle at 26% 20%, #ffffff, #fff8e8 44%, #edd8f0 78%),
        linear-gradient(135deg, #fff6dc, #f1e1f5);
      border: 1px solid rgba(255, 210, 120, .50);
      box-shadow: inset 0 1px 0 rgba(255,255,255,.9), 0 14px 30px rgba(50, 13, 62, .14);
      overflow: hidden;
    }
    .card .item-icon {
      width: 64px;
      height: 64px;
      object-fit: contain;
    }
    .card h3 { margin: 0; font-size: 27px; color: #170723; font-weight: 900; }
    .card p { margin: 4px 0 12px; font-size: 15px; color: #67546c; direction: ltr; text-align: right; font-weight: 800; }
    .prices { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
    .pill { border-radius: 14px; background: linear-gradient(135deg, #fbf6ff, #fff8e9); padding: 9px 10px; border: 1px solid rgba(111, 29, 99, .08); }
    .pill span { display: block; font-size: 12px; color: #755c79; font-weight: 800; }
    .pill strong { font-size: 17px; color: #7a145f; font-weight: 950; }
    .footer { padding: 0 38px 32px; font-size: 20px; align-items: center; }
  </style>
</head>
<body>
  <main class="page">
    <section class="sheet">
      <header class="hero">
        <div class="brand">
          <img class="brand-mark" src="../brand/logo-in-and-out-laundry.png" alt="In & Out Laundry" />
          <div>
            <p class="eyebrow">IN & OUT LAUNDRY</p>
            <h1>أسعارنا المختصرة</h1>
            <p class="subtitle">أشهر القطع المطلوبة عبر واتساب</p>
          </div>
        </div>
      </header>
      <p class="note">للقائمة الكاملة: اطلب “قائمة الأسعار” أو افتح ملف PDF المرفق. الأسعار بالدرهم وقد تتطلب القطع الحساسة فحصًا قبل التأكيد.</p>
      <section class="grid">
        ${popular
          .map(
            (item) => `
        <article class="card">
          <div class="icon-wrap">
            <img class="item-icon" src="${escapeHtml(iconPathForItem(item))}" alt="" />
          </div>
          <div>
            <h3>${escapeHtml(item.name_ar)}</h3>
            <p>${escapeHtml(item.name_en)}</p>
            <div class="prices">
              <div class="pill"><span>غسيل وتجفيف</span><strong>${escapeHtml(formatPrice(item.wash_dry))}</strong></div>
              <div class="pill"><span>كي فقط</span><strong>${escapeHtml(formatPrice(item.iron))}</strong></div>
            </div>
          </div>
        </article>`
          )
          .join('\n')}
      </section>
      <footer class="footer">
        <span>In & Out Laundry</span>
        <span class="ltr">${PUBLIC_BASE_URL}</span>
      </footer>
    </section>
  </main>
</body>
</html>`;
};

const renderMarkdown = (items) => {
  const rows = items
    .map(
      (item) =>
        `| ${item.barcode} | ${item.name_ar} | ${item.name_en} | ${categoryLabels[item.category] || item.category} | ${formatPrice(item.wash_dry)} | ${formatPrice(item.wash_iron_urgent)} | ${formatPrice(item.iron)} | ${formatPrice(item.iron_urgent)} |`
    )
    .join('\n');

  return `### قائمة الأسعار المعتمدة | Approved Price List

هذه القائمة مولدة من \`apps/customer-site/src/data/pricingData.ts\` ولا يجب تعديلها يدويًا إلا بتحديث مصدر أسعار الموقع ثم إعادة توليدها.

## Price List Media

- PDF: ${PUBLIC_BASE_URL}/pricing/${PDF_FILE}
- Image: ${PUBLIC_BASE_URL}/pricing/${PNG_FILE}

## Agent Pricing Rule

عند سؤال العميل عن الأسعار أو قائمة الأسعار:

1. لا تخترع أي سعر خارج هذه القائمة.
2. أرسل ردًا قصيرًا بلغة العميل.
3. أرفق ملف PDF: \`${PUBLIC_BASE_URL}/pricing/${PDF_FILE}\`.
4. إذا تعذر إرسال PDF، أرسل الصورة: \`${PUBLIC_BASE_URL}/pricing/${PNG_FILE}\`.
5. إذا سأل عن قطعة غير موجودة، اطلب اسم القطعة أو حوّل لتأكيد الموظف/POS.
6. القطع الحساسة أو المزينة أو الحالات الخاصة تحتاج فحصًا قبل التأكيد النهائي.

رد عربي مقترح:
تفضل قائمة أسعار In & Out Laundry المرفقة. الأسعار حسب نوع القطعة والخدمة، والقطع الحساسة أو الخاصة قد تحتاج فحصًا قبل التأكيد النهائي.

English suggested reply:
Here is the In & Out Laundry price list. Prices depend on the item and service type. Delicate or special items may require inspection before final confirmation.

## Prices

| Barcode | العربية | English | Category | Wash & Dry | Urgent Wash & Iron | Iron Only | Urgent Iron |
|---|---|---|---|---|---|---|---|
${rows}
`;
};

const findChrome = () => {
  const candidates = [
    process.env.CHROME_PATH,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
  ].filter(Boolean);
  return candidates.find((candidate) => fs.existsSync(candidate));
};

const runChrome = (args) => {
  const chrome = findChrome();
  if (!chrome) {
    console.warn('Chrome/Edge not found. HTML and Markdown were generated; PDF/PNG export skipped.');
    return false;
  }
  const result = spawnSync(chrome, args, { stdio: 'inherit' });
  if (result.status !== 0) throw new Error(`Chrome export failed with code ${result.status}`);
  return true;
};

const main = () => {
  const items = readPricingData();
  fs.mkdirSync(publicPricingDir, { recursive: true });

  const fullHtmlPath = path.join(publicPricingDir, FULL_HTML_FILE);
  const cardHtmlPath = path.join(publicPricingDir, CARD_HTML_FILE);
  const pdfPath = path.join(publicPricingDir, PDF_FILE);
  const pdfDraftPath = path.join(publicPricingDir, PDF_DRAFT_FILE);
  const pngPath = path.join(publicPricingDir, PNG_FILE);

  fs.writeFileSync(fullHtmlPath, renderFullHtml(items), 'utf8');
  fs.writeFileSync(cardHtmlPath, renderCardHtml(items), 'utf8');
  fs.writeFileSync(workflowPricingKbPath, renderMarkdown(items), 'utf8');

  const fullUrl = `file:///${fullHtmlPath.replace(/\\/g, '/')}`;
  const cardUrl = `file:///${cardHtmlPath.replace(/\\/g, '/')}`;

  runChrome([
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--print-to-pdf-no-header',
    `--print-to-pdf=${pdfDraftPath}`,
    fullUrl,
  ]);

  try {
    fs.copyFileSync(pdfDraftPath, pdfPath);
    fs.unlinkSync(pdfDraftPath);
  } catch (error) {
    console.warn(`Could not replace ${PDF_FILE}. Close any open PDF viewer and rerun this script. Draft saved at ${pdfDraftPath}`);
    console.warn(error.message);
  }

  runChrome([
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--hide-scrollbars',
    '--window-size=1080,1440',
    `--screenshot=${pngPath}`,
    cardUrl,
  ]);

  console.log(`Generated pricing assets:
- ${fullHtmlPath}
- ${cardHtmlPath}
- ${pdfPath}
- ${fs.existsSync(pdfDraftPath) ? pdfDraftPath : ''}
- ${pngPath}
- ${workflowPricingKbPath}`);
};

main();
