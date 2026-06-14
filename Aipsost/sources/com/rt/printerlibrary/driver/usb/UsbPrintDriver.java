package com.rt.printerlibrary.driver.usb;

import android.app.PendingIntent;
import android.content.Context;
import android.hardware.usb.UsbDevice;
import android.hardware.usb.UsbManager;
import com.rt.printerlibrary.bean.UsbConfigBean;
import com.rt.printerlibrary.connect.UsbInterface;
import com.rt.printerlibrary.driver.BaseDriver;
import com.rt.printerlibrary.driver.usb.rw.PL2303Driver;
import com.rt.printerlibrary.driver.usb.rw.Pos;
import com.rt.printerlibrary.driver.usb.rw.TTYTermios;
import com.rt.printerlibrary.driver.usb.rw.USBPort;
import com.rt.printerlibrary.driver.usb.rw.USBSerialPort;
import com.rt.printerlibrary.enumerate.ConnectStateEnum;
import com.rt.printerlibrary.observer.PrinterObserver;
import com.rt.printerlibrary.observer.PrinterObserverManager;

/* JADX INFO: loaded from: classes11.dex */
public class UsbPrintDriver extends BaseDriver {
    protected static USBSerialPort a;
    protected static PL2303Driver b;
    protected static Pos c;
    private static long h = -1;
    private UsbManager e;
    private UsbConfigBean f;
    private UsbInterface g;
    private WriteRunnable j;
    private final String d = "HsUsbPrintDriver";
    private boolean i = false;

    private class WriteRunnable implements Runnable {
        byte[] a;

        private WriteRunnable() {
        }

        @Override // java.lang.Runnable
        public void run() {
            UsbPrintDriver.this.writeMsg(this.a);
        }

        public void setOut(byte[] bArr) {
            this.a = bArr;
        }
    }

    public UsbPrintDriver(UsbConfigBean usbConfigBean) {
        this.f = usbConfigBean;
        this.e = (UsbManager) usbConfigBean.context.getApplicationContext().getSystemService("usb");
        if (b == null) {
            b = new PL2303Driver();
            USBSerialPort uSBSerialPort = new USBSerialPort(null, null);
            a = uSBSerialPort;
            c = new Pos(uSBSerialPort, b);
        }
    }

    private int a(int i, TTYTermios.Parity parity) {
        TTYTermios tTYTermios = a.termios;
        a.termios = new TTYTermios(i, TTYTermios.FlowControl.NONE, parity, TTYTermios.StopBits.ONE, 8);
        return b.pl2303_open(a, tTYTermios);
    }

    private void a() {
        b.pl2303_close(a);
    }

    private void b() {
        for (PrinterObserver printerObserver : PrinterObserverManager.getInstance().getObservers()) {
            UsbInterface usbInterface = this.g;
            if (usbInterface != null) {
                usbInterface.setConfigObject(this.f);
            }
            printerObserver.printerObserverCallback(this.g, 1);
        }
    }

    private void c() {
        for (PrinterObserver printerObserver : PrinterObserverManager.getInstance().getObservers()) {
            UsbInterface usbInterface = this.g;
            if (usbInterface != null) {
                usbInterface.setConfigObject(this.f);
            }
            printerObserver.printerObserverCallback(this.g, 0);
        }
    }

    public boolean connect(UsbDevice usbDevice, Context context, PendingIntent pendingIntent) throws Exception {
        UsbManager usbManager = this.e;
        if (usbManager == null) {
            throw new Exception("the UsbManager has not been set,please invoke setUsbManager mothod to set UsbManager");
        }
        a.port = new USBPort(usbManager, context, usbDevice, pendingIntent);
        if (b.pl2303_probe(a) == 0) {
            b();
            return true;
        }
        c();
        return false;
    }

    public void disconnect() {
        a();
        b.pl2303_disconnect(a);
        c();
    }

    @Override // com.rt.printerlibrary.driver.BaseDriver
    public ConnectStateEnum getConnectState() {
        PL2303Driver pL2303Driver = b;
        if (pL2303Driver != null && pL2303Driver.pl2303_probe(a) == 0) {
            return ConnectStateEnum.Connected;
        }
        return ConnectStateEnum.NoConnect;
    }

    public UsbInterface getPrinterInterface() {
        return this.g;
    }

    public byte[] readMsg(int i) {
        byte[] bArr = new byte[i];
        a(115200, TTYTermios.Parity.NONE);
        c.POS_Read(bArr, 0, i, 5000);
        a();
        return bArr;
    }

    @Override // java.lang.Thread, java.lang.Runnable
    public void run() {
        super.run();
        try {
            connect(this.f.usbDevice, this.f.context, this.f.pendingIntent);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public void setPrinterInterface(UsbInterface usbInterface) {
        this.g = usbInterface;
    }

    public synchronized void writeMsg(byte[] bArr) {
        a(115200, TTYTermios.Parity.NONE);
        seIsPrinting(true);
        int length = bArr.length;
        int i = length / 1024;
        int i2 = length % 1024;
        for (int i3 = 0; i3 < i; i3++) {
            byte[] bArr2 = new byte[1024];
            for (int i4 = 0; i4 < 1024; i4++) {
                bArr2[i4] = bArr[(i3 * 1024) + i4];
            }
            c.POS_Write(bArr2, 0, 1024, 5000);
        }
        byte[] bArr3 = new byte[i2];
        for (int i5 = 0; i5 < i2; i5++) {
            bArr3[i5] = bArr[(i * 1024) + i5];
        }
        c.POS_Write(bArr3, 0, i2, 5000);
        a();
        seIsPrinting(false);
    }

    public void writeMsgAsync(byte[] bArr) {
        if (this.j == null) {
            this.j = new WriteRunnable();
        }
        seIsPrinting(true);
        this.j.setOut(bArr);
        new Thread(this.j).start();
    }
}
