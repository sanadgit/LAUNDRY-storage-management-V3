package com.rt.printerlibrary.bean;

import android.app.PendingIntent;
import android.content.Context;
import android.hardware.usb.UsbDevice;

/* JADX INFO: loaded from: classes11.dex */
public class UsbConfigBean {
    public Context context;
    public PendingIntent pendingIntent;
    public UsbDevice usbDevice;

    public UsbConfigBean(Context context, UsbDevice usbDevice, PendingIntent pendingIntent) {
        this.context = context;
        this.usbDevice = usbDevice;
        this.pendingIntent = pendingIntent;
    }

    public Context getContext() {
        return this.context;
    }

    public PendingIntent getPendingIntent() {
        return this.pendingIntent;
    }

    public UsbDevice getUsbDevice() {
        return this.usbDevice;
    }

    public void setContext(Context context) {
        this.context = context;
    }

    public void setPendingIntent(PendingIntent pendingIntent) {
        this.pendingIntent = pendingIntent;
    }

    public void setUsbDevice(UsbDevice usbDevice) {
        this.usbDevice = usbDevice;
    }

    public String toString() {
        return "USB Device:" + this.usbDevice.getDeviceId() + "";
    }
}
