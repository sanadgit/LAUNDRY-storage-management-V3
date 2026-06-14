package com.rt.printerlibrary.factory.printer;

import com.rt.printerlibrary.printer.RTPrinter;
import com.rt.printerlibrary.printer.UniversalPrinter;

/* JADX INFO: loaded from: classes11.dex */
public class UniversalPrinterFactory extends PrinterFactory {
    @Override // com.rt.printerlibrary.factory.printer.PrinterFactory
    public RTPrinter create() {
        return new UniversalPrinter();
    }
}
