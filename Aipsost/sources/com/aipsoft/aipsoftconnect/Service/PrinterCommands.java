package com.aipsoft.aipsoftconnect.Service;

/* JADX INFO: loaded from: classes6.dex */
public class PrinterCommands {
    public static final byte CLR = 12;
    public static final byte CR = 13;
    public static final byte EOT = 4;
    public static final byte HT = 9;
    public static final byte LF = 10;
    public static final byte STX = 2;
    public static final byte US = 31;
    public static final byte ESC = 27;
    public static final byte[] INIT = {ESC, 64};
    public static byte[] FEED_LINE = {10};
    public static byte[] SELECT_FONT_A = {20, 33, 0};
    public static final byte GS = 29;
    public static byte[] SET_BAR_CODE_HEIGHT = {GS, 104, 100};
    public static byte[] PRINT_BAR_CODE_1 = {GS, 107, 2};
    public static byte[] SEND_NULL_BYTE = {0};
    public static byte[] SELECT_PRINT_SHEET = {ESC, 99, 48, 2};
    public static byte[] FEED_PAPER_AND_CUT = {GS, 86, 66, 0};
    public static byte[] SELECT_CYRILLIC_CHARACTER_CODE_TABLE = {ESC, 116, 17};
    public static byte[] SELECT_BIT_IMAGE_MODE = {ESC, 42, 33, -1, 3};
    public static final byte CAN = 24;
    public static byte[] SET_LINE_SPACING_24 = {ESC, 51, CAN};
    public static byte[] SET_LINE_SPACING_30 = {ESC, 51, 30};
    public static final byte DLE = 16;
    public static byte[] TRANSMIT_DLE_PRINTER_STATUS = {DLE, 4, 1};
    public static byte[] TRANSMIT_DLE_OFFLINE_PRINTER_STATUS = {DLE, 4, 2};
    public static byte[] TRANSMIT_DLE_ERROR_STATUS = {DLE, 4, 3};
    public static byte[] TRANSMIT_DLE_ROLL_PAPER_SENSOR_STATUS = {DLE, 4, 4};
    public static final byte[] ESC_FONT_COLOR_DEFAULT = {ESC, 114, 0};
    public static final byte FS = 28;
    public static final byte[] FS_FONT_ALIGN = {FS, 33, 1, ESC, 33, 1};
    public static final byte[] ESC_ALIGN_LEFT = {ESC, 97, 0};
    public static final byte[] ESC_ALIGN_RIGHT = {ESC, 97, 2};
    public static final byte[] ESC_ALIGN_CENTER = {ESC, 97, 1};
    public static final byte[] ESC_CANCEL_BOLD = {ESC, 69, 0};
    public static final byte[] ESC_HORIZONTAL_CENTERS = {ESC, 68, 20, FS, 0};
    public static final byte[] ESC_CANCLE_HORIZONTAL_CENTERS = {ESC, 68, 0};
    public static final byte[] ESC_ENTER = {ESC, 74, 64};
    public static final byte[] PRINTE_TEST = {GS, 40, 65};
}
