package com.rt.printerlibrary.driver.usb.rw;

/* JADX INFO: loaded from: classes11.dex */
public class TTYTermios {
    public int baudrate;
    public int dataBits;
    public FlowControl flowControl;
    public Parity parity;
    public StopBits stopBits;

    public enum FlowControl {
        NONE,
        DTR_RTS
    }

    public enum Parity {
        NONE,
        ODD,
        EVEN,
        SPACE,
        MARK
    }

    public enum StopBits {
        ONE,
        ONEPFIVE,
        TWO
    }

    public TTYTermios(int i, FlowControl flowControl, Parity parity, StopBits stopBits, int i2) {
        this.baudrate = 9600;
        this.flowControl = FlowControl.NONE;
        this.parity = Parity.NONE;
        this.stopBits = StopBits.ONE;
        this.dataBits = 8;
        this.baudrate = i;
        this.flowControl = flowControl;
        this.parity = parity;
        this.stopBits = stopBits;
        this.dataBits = i2;
    }
}
