/**
 * ملف الترجمات - Translations File
 * يحتوي على جميع النصوص بالعربية والإنجليزية
 */

export type Language = "ar" | "en";

export const translations = {
  ar: {
    // ─── Header ───
    clothesSortingSystem: "نظام فرز الملابس",
    clothesSortingSystemEng: "Clothes Sorting System",
    blanketsTitle: "محطة فرز وتعبئة البطانيات",
    blanketsTitleEng: "Blankets Sorting & Packing",
    ironingStationTitle: "محطة كوي الملابس",
    ironingStationTitleEng: "Ironing Station",
    activeOrders: "طلبات نشطة",
    activeBatches: "دفعات نشطة",
    activeItems: "قطع نشطة",
    online: "متصل",

    // ─── Navigation ───
    clothes: "الملابس",
    blankets: "البطانيات",
    ironing: "الكي",

    // ─── Search & Input ───
    searchByOrderNumber: "البحث برقم الطلب",
    searchByStickerNumber: "ماسح الاستيكر",
    search: "بحث",
    clear: "مسح",
    delete: "حذف",
    notFound: "لم يتم العثور على",

    // ─── Order Details ───
    orderNumber: "رقم الطلب",
    clientNumber: "رقم العميل",
    orderDetails: "تفاصيل الطلب",
    itemDetails: "تفاصيل القطعة",
    pieces: "القطع",
    quantity: "الكمية",
    count: "العدد",
    total: "الإجمالي",
    size: "الحجم",
    color: "اللون",
    type: "النوع",
    weight: "الوزن",
    date: "التاريخ",

    // ─── Blankets ───
    batchNumber: "رقم الدفعة",
    totalWeight: "الوزن الإجمالي",
    packingProgress: "تقدم التعبئة",
    packed: "المعبأة",
    remaining: "المتبقية",
    addOne: "إضافة واحدة",
    subtractOne: "إنقاص واحدة",
    updatePacking: "تحديث التعبئة",

    // ─── Ironing ───
    stickerScanner: "ماسح الاستيكر",
    ironingDetails: "تفاصيل القطعة",
    ironingProgress: "تقدم الكي",
    ironed: "المكوية",
    recordIroned: "تسجيل قطعة مكوية",
    lastUpdate: "آخر تحديث",

    // ─── Status ───
    pending: "في الانتظار",
    inProgress: "جاري",
    completed: "مكتمل",
    ready: "جاهز",
    urgent: "عاجل",
    readyForShipping: "جاهز للشحن",

    // ─── Printing ───
    print: "طباعة",
    printOrder: "طباعة الطلب",
    printReport: "طباعة التقرير",
    printLabel: "طباعة الملصق",
    printing: "جاري الطباعة...",

    // ─── Final Label ───
    completedLabel: "مكتمل!",
    allItemsCompletedLabel: "تم إكمال جميع قطع الطلب بنجاح",
    readyForAssemblyLabel: "جاهز للتجميع والشحن",
    printThisLabel: "اطبع هذا الملصق والصقه على الصندوق الخارجي",
    closeLabel: "إغلاق",

    // ─── Keyboard ───
    keyboard: "لوحة المفاتيح",

    // ─── Footer ───
    version: "الإصدار",
    systemVersion: "نظام فرز الملابس — الإصدار 1.0",

    // ─── Messages ───
    noOrderSelected: "لا توجد قطعة محددة",
    searchForOrder: "ابحث برقم الطلب لعرض التفاصيل",
    searchForSticker: "ابحث برقم الاستيكر لعرض التفاصيل",
    examples: "أمثلة",
  },
  en: {
    // ─── Header ───
    clothesSortingSystem: "Clothes Sorting System",
    clothesSortingSystemEng: "Clothes Sorting System",
    blanketsTitle: "Blankets Sorting & Packing",
    blanketsTitleEng: "Blankets Sorting & Packing",
    ironingStationTitle: "Ironing Station",
    ironingStationTitleEng: "Ironing Station",
    activeOrders: "Active Orders",
    activeBatches: "Active Batches",
    activeItems: "Active Items",
    online: "Online",

    // ─── Navigation ───
    clothes: "Clothes",
    blankets: "Blankets",
    ironing: "Ironing",

    // ─── Search & Input ───
    searchByOrderNumber: "Search by Order Number",
    searchByStickerNumber: "Sticker Scanner",
    search: "Search",
    clear: "Clear",
    delete: "Delete",
    notFound: "Not Found",

    // ─── Order Details ───
    orderNumber: "Order Number",
    clientNumber: "Client Number",
    orderDetails: "Order Details",
    itemDetails: "Item Details",
    pieces: "Pieces",
    quantity: "Quantity",
    count: "Count",
    total: "Total",
    size: "Size",
    color: "Color",
    type: "Type",
    weight: "Weight",
    date: "Date",

    // ─── Blankets ───
    batchNumber: "Batch Number",
    totalWeight: "Total Weight",
    packingProgress: "Packing Progress",
    packed: "Packed",
    remaining: "Remaining",
    addOne: "Add One",
    subtractOne: "Subtract One",
    updatePacking: "Update Packing",

    // ─── Ironing ───
    stickerScanner: "Sticker Scanner",
    ironingDetails: "Item Details",
    ironingProgress: "Ironing Progress",
    ironed: "Ironed",
    recordIroned: "Record Ironed Item",
    lastUpdate: "Last Update",

    // ─── Status ───
    pending: "Pending",
    inProgress: "In Progress",
    completed: "Completed",
    ready: "Ready",
    urgent: "Urgent",
    readyForShipping: "Ready for Shipping",

    // ─── Printing ───
    print: "Print",
    printOrder: "Print Order",
    printReport: "Print Report",
    printLabel: "Print Label",
    printing: "Printing...",

    // ─── Final Label ───
    completedLabel: "Completed!",
    allItemsCompletedLabel: "All order items completed successfully",
    readyForAssemblyLabel: "Ready for assembly and shipping",
    printThisLabel: "Print this label and stick it on the outer box",
    closeLabel: "Close",

    // ─── Keyboard ───
    keyboard: "Keyboard",

    // ─── Footer ───
    version: "Version",
    systemVersion: "Clothes Sorting System — Version 1.0",

    // ─── Messages ───
    noOrderSelected: "No item selected",
    searchForOrder: "Search by order number to view details",
    searchForSticker: "Search by sticker number to view details",
    examples: "Examples",
  },
};

export function t(key: keyof typeof translations.ar, language: Language): string {
  return translations[language][key] || translations.ar[key];
}
