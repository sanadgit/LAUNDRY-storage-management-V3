package com.rt.printerlibrary.utils;

import com.rt.printerlibrary.bean.PrinterStatusBean;

/* JADX INFO: loaded from: classes11.dex */
public class PrinterStatusPareseUtils {
    public static final String STATUS_LOW_POWER = "Low power";
    public static final String STATUS_MOVEMENT_ERROR = "Printer movement error";
    public static final String STATUS_NO_PAPER_ERROR = "No Paper";
    public static final String STATUS_OVERHEATED_ERROR = "The printer is overheated ";
    public static final String STATUS_PAPER_JAMMED_ERROR = "Paper jammed error";
    public static final String STATUS_PRINTER_BUSY = "Printer is printing";
    public static final String STATUS_PRINTER_LID_OPEN = "The printer's lid is open";
    public static final String STATUS_PRINTER_PAUSE = "Printer Pause";
    public static final String STATUS_Ready = "The printer is ready";

    public static String byteToBit(byte b) {
        return "" + ((int) ((byte) ((b >> 7) & 1))) + ((int) ((byte) ((b >> 6) & 1))) + ((int) ((byte) ((b >> 5) & 1))) + ((int) ((byte) ((b >> 4) & 1))) + ((int) ((byte) ((b >> 3) & 1))) + ((int) ((byte) ((b >> 2) & 1))) + ((int) ((byte) ((b >> 1) & 1))) + ((int) ((byte) ((b >> 0) & 1)));
    }

    public static String getPrinterStatusStr(PrinterStatusBean printerStatusBean) {
        return printerStatusBean != null ? printerStatusBean.blMoveMentErr ? STATUS_MOVEMENT_ERROR : printerStatusBean.blPaperJammed ? STATUS_PAPER_JAMMED_ERROR : printerStatusBean.blNoPaper ? STATUS_NO_PAPER_ERROR : printerStatusBean.blLowPower ? STATUS_LOW_POWER : printerStatusBean.blPrinterPause ? STATUS_PRINTER_PAUSE : printerStatusBean.blPrinting ? STATUS_PRINTER_BUSY : printerStatusBean.blLidOpened ? STATUS_PRINTER_LID_OPEN : printerStatusBean.blOverHeated ? STATUS_OVERHEATED_ERROR : printerStatusBean.blPrintReady ? STATUS_Ready : "" : "";
    }

    public static boolean parseIsPrintSuccess(byte[] bArr) {
        return bArr[3] == 1;
    }

    public static boolean parseIsVowelEnable(byte[] bArr) {
        return bArr[4] == 1;
    }

    public static boolean parsePaperTypeChange(byte[] bArr) {
        return bArr[3] == 2;
    }

    public static void parsePrinterState(byte[] bArr) {
        PrinterStatusBean printerStatusResult = parsePrinterStatusResult(bArr);
        if (printerStatusResult != null) {
            boolean z = printerStatusResult.blMoveMentErr;
            boolean z2 = printerStatusResult.blPaperJammed;
            boolean z3 = printerStatusResult.blNoPaper;
            boolean z4 = printerStatusResult.blLowPower;
            boolean z5 = printerStatusResult.blPrinterPause;
            boolean z6 = printerStatusResult.blPrinting;
            boolean z7 = printerStatusResult.blLidOpened;
            boolean z8 = printerStatusResult.blOverHeated;
        }
    }

    /* JADX WARN: Removed duplicated region for block: B:38:0x0066  */
    /*
        Code decompiled incorrectly, please refer to instructions dump.
        To view partially-correct code enable 'Show inconsistent code' option in preferences
    */
    public static com.rt.printerlibrary.bean.PrinterStatusBean parsePrinterStatusResult(byte[] r8) {
        /*
            Method dump skipped, instruction units count: 340
            To view this dump change 'Code comments level' option to 'DEBUG'
        */
        throw new UnsupportedOperationException("Method not decompiled: com.rt.printerlibrary.utils.PrinterStatusPareseUtils.parsePrinterStatusResult(byte[]):com.rt.printerlibrary.bean.PrinterStatusBean");
    }
}
