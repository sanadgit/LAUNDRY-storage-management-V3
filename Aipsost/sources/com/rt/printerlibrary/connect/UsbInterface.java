package com.rt.printerlibrary.connect;

import com.rt.printerlibrary.bean.UsbConfigBean;
import com.rt.printerlibrary.driver.usb.UsbPrintDriver;
import com.rt.printerlibrary.enumerate.ConnectStateEnum;
import com.rt.printerlibrary.utils.PrintListener;

/* JADX INFO: loaded from: classes11.dex */
public class UsbInterface extends PrinterInterface {
    private UsbPrintDriver a;

    @Override // com.rt.printerlibrary.connect.PrinterInterface
    public void connect(Object obj) throws Exception {
        if (!(obj instanceof UsbConfigBean)) {
            throw new Exception("Method com.rt.printerlibrary.connect.UsbInterface.connect's param must be UsbConfigBean");
        }
        UsbConfigBean usbConfigBean = (UsbConfigBean) obj;
        UsbPrintDriver usbPrintDriver = this.a;
        if (usbPrintDriver == null) {
            this.a = new UsbPrintDriver(usbConfigBean);
        } else {
            usbPrintDriver.interrupt();
        }
        this.a.start();
        this.a.setPrinterInterface(this);
    }

    @Override // com.rt.printerlibrary.connect.PrinterInterface
    public void disConnect() {
        UsbPrintDriver usbPrintDriver = this.a;
        if (usbPrintDriver != null) {
            usbPrintDriver.disconnect();
        }
    }

    @Override // com.rt.printerlibrary.connect.PrinterInterface
    public ConnectStateEnum getConnectState() {
        this.curState = this.a.getConnectState();
        return this.curState;
    }

    @Override // com.rt.printerlibrary.connect.PrinterInterface
    public boolean getIsPrinting() {
        return this.a.getIsPrinting();
    }

    @Override // com.rt.printerlibrary.connect.PrinterInterface
    public boolean getisAlwaysReadInputStream() {
        UsbPrintDriver usbPrintDriver = this.a;
        if (usbPrintDriver != null) {
            return usbPrintDriver.getisAlwaysReadInputStream();
        }
        return true;
    }

    @Override // com.rt.printerlibrary.connect.PrinterInterface
    public byte[] readMsg() {
        UsbPrintDriver usbPrintDriver = this.a;
        return usbPrintDriver != null ? usbPrintDriver.readMsg(64) : new byte[0];
    }

    @Override // com.rt.printerlibrary.connect.PrinterInterface
    public void setAlwaysReadInputStream(boolean z) {
        UsbPrintDriver usbPrintDriver = this.a;
        if (usbPrintDriver != null) {
            usbPrintDriver.setAlwaysReadInputStream(z);
        }
    }

    @Override // com.rt.printerlibrary.connect.PrinterInterface
    public void setPrintListener(PrintListener printListener) {
        this.a.setPrintListener(printListener);
    }

    @Override // com.rt.printerlibrary.connect.PrinterInterface
    public void writeMsg(byte[] bArr) {
        UsbPrintDriver usbPrintDriver = this.a;
        if (usbPrintDriver != null) {
            usbPrintDriver.writeMsg(bArr);
        }
    }

    @Override // com.rt.printerlibrary.connect.PrinterInterface
    public void writeMsgAsync(byte[] bArr) {
        UsbPrintDriver usbPrintDriver = this.a;
        if (usbPrintDriver != null) {
            usbPrintDriver.writeMsgAsync(bArr);
        }
    }
}
