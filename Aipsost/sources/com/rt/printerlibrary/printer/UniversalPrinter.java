package com.rt.printerlibrary.printer;

import com.rt.printerlibrary.enumerate.ConnectStateEnum;

/* JADX INFO: loaded from: classes11.dex */
public class UniversalPrinter extends RTPrinter {
    @Override // com.rt.printerlibrary.printer.RTPrinter
    public void connect(Object obj) throws Exception {
        if (this.printerInterface != null) {
            this.printerInterface.connect(obj);
        }
    }

    @Override // com.rt.printerlibrary.printer.RTPrinter
    public void disConnect() {
        if (this.printerInterface != null) {
            this.printerInterface.disConnect();
        }
    }

    @Override // com.rt.printerlibrary.printer.RTPrinter
    public ConnectStateEnum getConnectState() {
        return this.printerInterface == null ? ConnectStateEnum.NoConnect : this.printerInterface.getConnectState();
    }

    @Override // com.rt.printerlibrary.printer.RTPrinter
    public byte[] readMsg() {
        return this.printerInterface.readMsg();
    }

    @Override // com.rt.printerlibrary.printer.RTPrinter
    public synchronized void writeMsg(byte[] bArr) {
        this.printerInterface.writeMsg(bArr);
    }

    @Override // com.rt.printerlibrary.printer.RTPrinter
    public synchronized void writeMsgAsync(byte[] bArr) {
        this.printerInterface.writeMsgAsync(bArr);
    }
}
