package com.rt.printerlibrary.driver.usb.rw;

/* JADX INFO: loaded from: classes11.dex */
public class USBSerialPort {
    public USBPort port;
    public TTYTermios termios;

    public USBSerialPort(USBPort uSBPort, TTYTermios tTYTermios) {
        this.port = uSBPort;
        this.termios = tTYTermios;
    }
}
