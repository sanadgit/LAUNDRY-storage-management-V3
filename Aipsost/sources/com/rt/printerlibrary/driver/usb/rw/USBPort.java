package com.rt.printerlibrary.driver.usb.rw;

import android.app.PendingIntent;
import android.content.Context;
import android.hardware.usb.UsbDevice;
import android.hardware.usb.UsbDeviceConnection;
import android.hardware.usb.UsbEndpoint;
import android.hardware.usb.UsbInterface;
import android.hardware.usb.UsbManager;

/* JADX INFO: loaded from: classes11.dex */
public class USBPort {
    UsbManager a;
    Context b;
    UsbDevice c;
    PendingIntent d;
    UsbInterface e;
    UsbEndpoint f;
    UsbEndpoint g;
    UsbDeviceConnection h;

    public USBPort(UsbManager usbManager, Context context, UsbDevice usbDevice, PendingIntent pendingIntent) {
        this.a = usbManager;
        this.b = context;
        this.c = usbDevice;
        this.d = pendingIntent;
    }
}
