package com.rt.printerlibrary.driver.usb.rw;

/* JADX INFO: loaded from: classes11.dex */
public abstract class USBSerialDriver extends USBDriver {
    abstract int a(USBSerialPort uSBSerialPort);

    abstract int a(USBSerialPort uSBSerialPort, TTYTermios tTYTermios);

    abstract int b(USBSerialPort uSBSerialPort);

    abstract int b(USBSerialPort uSBSerialPort, TTYTermios tTYTermios);

    abstract int c(USBSerialPort uSBSerialPort);
}
