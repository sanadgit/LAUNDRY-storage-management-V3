package com.rt.printerlibrary.observer;

import com.rt.printerlibrary.connect.PrinterInterface;

/* JADX INFO: loaded from: classes11.dex */
public interface PrinterObserver {
    void printerObserverCallback(PrinterInterface printerInterface, int i);

    void printerReadMsgCallback(PrinterInterface printerInterface, byte[] bArr);
}
