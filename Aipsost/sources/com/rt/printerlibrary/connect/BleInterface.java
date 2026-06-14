package com.rt.printerlibrary.connect;

import com.rt.printerlibrary.enumerate.ConnectStateEnum;
import com.rt.printerlibrary.utils.PrintListener;

/* JADX INFO: loaded from: classes11.dex */
public class BleInterface extends PrinterInterface {
    @Override // com.rt.printerlibrary.connect.PrinterInterface
    public void connect(Object obj) {
        System.out.println("com.rt.printerlibrary.connect.BluetoothInterface.connect:" + obj.toString());
    }

    @Override // com.rt.printerlibrary.connect.PrinterInterface
    public void disConnect() {
    }

    @Override // com.rt.printerlibrary.connect.PrinterInterface
    public ConnectStateEnum getConnectState() {
        return this.curState;
    }

    @Override // com.rt.printerlibrary.connect.PrinterInterface
    public boolean getIsPrinting() {
        return false;
    }

    @Override // com.rt.printerlibrary.connect.PrinterInterface
    public boolean getisAlwaysReadInputStream() {
        return false;
    }

    @Override // com.rt.printerlibrary.connect.PrinterInterface
    public byte[] readMsg() {
        return null;
    }

    @Override // com.rt.printerlibrary.connect.PrinterInterface
    public void setAlwaysReadInputStream(boolean z) {
    }

    @Override // com.rt.printerlibrary.connect.PrinterInterface
    public void setPrintListener(PrintListener printListener) {
    }

    @Override // com.rt.printerlibrary.connect.PrinterInterface
    public void writeMsg(byte[] bArr) {
    }

    @Override // com.rt.printerlibrary.connect.PrinterInterface
    public void writeMsgAsync(byte[] bArr) {
    }
}
