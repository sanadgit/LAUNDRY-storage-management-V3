package com.rt.printerlibrary.factory.printer;

import com.rt.printerlibrary.printer.LabelPrinter;
import com.rt.printerlibrary.printer.RTPrinter;

/* JADX INFO: loaded from: classes11.dex */
public class LabelPrinterFactory extends PrinterFactory {
    @Override // com.rt.printerlibrary.factory.printer.PrinterFactory
    public RTPrinter create() {
        return new LabelPrinter();
    }
}
