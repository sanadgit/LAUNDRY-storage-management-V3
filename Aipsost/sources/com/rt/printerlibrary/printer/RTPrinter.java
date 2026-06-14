package com.rt.printerlibrary.printer;

import com.rt.printerlibrary.connect.PrinterInterface;
import com.rt.printerlibrary.enumerate.ConnectStateEnum;
import com.rt.printerlibrary.utils.PrintListener;

/* JADX INFO: loaded from: classes11.dex */
public abstract class RTPrinter<T> {
    public String piName;
    public PrinterInterface printerInterface;

    public abstract void connect(T t) throws Exception;

    public abstract void disConnect();

    public abstract ConnectStateEnum getConnectState();

    public boolean getIsPrinting() {
        return this.printerInterface.getIsPrinting();
    }

    public String getPiName() {
        return this.piName;
    }

    public PrinterInterface getPrinterInterface() {
        return this.printerInterface;
    }

    public byte[] getprinterStausMsg(byte[] bArr) {
        byte[] bArr2 = new byte[0];
        PrinterInterface printerInterface = this.printerInterface;
        if (printerInterface == null) {
            return bArr2;
        }
        boolean z = printerInterface.getisAlwaysReadInputStream();
        if (z) {
            setAlwaysReadInputStream(false);
        }
        try {
            writeMsg(bArr);
            return readMsg();
        } finally {
            if (z) {
                setAlwaysReadInputStream(true);
            }
        }
    }

    public abstract byte[] readMsg();

    public void setAlwaysReadInputStream(boolean z) {
        PrinterInterface printerInterface = this.printerInterface;
        if (printerInterface != null) {
            printerInterface.setAlwaysReadInputStream(z);
        }
    }

    public void setPiName(String str) {
        this.piName = str;
    }

    public void setPrintListener(PrintListener printListener) {
        this.printerInterface.setPrintListener(printListener);
    }

    public void setPrinterInterface(PrinterInterface printerInterface) {
        this.printerInterface = printerInterface;
    }

    public abstract void writeMsg(byte[] bArr);

    public abstract void writeMsgAsync(byte[] bArr);
}
