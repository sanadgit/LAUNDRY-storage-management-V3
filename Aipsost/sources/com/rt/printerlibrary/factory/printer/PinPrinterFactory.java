package com.rt.printerlibrary.factory.printer;

import com.rt.printerlibrary.printer.PinPrinter;
import com.rt.printerlibrary.printer.RTPrinter;

/* JADX INFO: loaded from: classes11.dex */
public class PinPrinterFactory extends PrinterFactory {
    @Override // com.rt.printerlibrary.factory.printer.PrinterFactory
    public RTPrinter create() {
        return new PinPrinter();
    }
}
