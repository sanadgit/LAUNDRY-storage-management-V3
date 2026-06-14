package com.rt.printerlibrary.enumerate;

/* JADX INFO: loaded from: classes11.dex */
public enum PrinterAskStatusEnum {
    Printer_Status(1),
    Offline_status(2),
    Trans_status(3),
    Paper_status(4);

    private int value;

    PrinterAskStatusEnum(int i) {
        this.value = 0;
        this.value = i;
    }

    public int value() {
        return this.value;
    }
}
