package com.rt.printerlibrary.driver.usb.rw;

import com.google.android.gms.common.util.GmsVersion;
import com.rt.printerlibrary.driver.usb.rw.TTYTermios;
import kotlin.UByte;
import kotlin.jvm.internal.ByteCompanionObject;

/* JADX INFO: loaded from: classes11.dex */
public class PL2303Driver extends USBSerialDriver {
    public String lasterror = null;
    private USBDeviceId[] f = {a, b, d, c, e};
    public pl2303_type type = pl2303_type.HX;
    private boolean g = false;
    private boolean h = false;
    private boolean i = true;

    enum pl2303_type {
        type_0,
        type_1,
        HX
    }

    private boolean a(TTYTermios tTYTermios, TTYTermios tTYTermios2) {
        return (tTYTermios.baudrate == tTYTermios2.baudrate && tTYTermios.dataBits == tTYTermios2.dataBits && tTYTermios.flowControl == tTYTermios2.flowControl && tTYTermios.parity == tTYTermios2.parity && tTYTermios.stopBits == tTYTermios2.stopBits) ? false : true;
    }

    int a(USBPort uSBPort) {
        return super.a(uSBPort, this.f);
    }

    /* JADX WARN: Removed duplicated region for block: B:20:0x0074  */
    /* JADX WARN: Removed duplicated region for block: B:21:0x0077  */
    @Override // com.rt.printerlibrary.driver.usb.rw.USBSerialDriver
    /*
        Code decompiled incorrectly, please refer to instructions dump.
        To view partially-correct code enable 'Show inconsistent code' option in preferences
    */
    int a(com.rt.printerlibrary.driver.usb.rw.USBSerialPort r8) {
        /*
            r7 = this;
            if (r8 != 0) goto L5
            r8 = -1003(0xfffffffffffffc15, float:NaN)
            return r8
        L5:
            com.rt.printerlibrary.driver.usb.rw.PL2303Driver$pl2303_type r0 = com.rt.printerlibrary.driver.usb.rw.PL2303Driver.pl2303_type.type_0
            r7.type = r0
            r0 = 256(0x100, float:3.59E-43)
            byte[] r0 = new byte[r0]
            com.rt.printerlibrary.driver.usb.rw.USBPort r1 = r8.port
            android.hardware.usb.UsbDevice r1 = r1.c
            int r1 = r1.getDeviceClass()
            r2 = 2
            if (r1 != r2) goto L1d
            com.rt.printerlibrary.driver.usb.rw.PL2303Driver$pl2303_type r1 = com.rt.printerlibrary.driver.usb.rw.PL2303Driver.pl2303_type.type_0
        L1a:
            r7.type = r1
            goto L46
        L1d:
            com.rt.printerlibrary.driver.usb.rw.USBPort r1 = r8.port
            android.hardware.usb.UsbEndpoint r1 = r1.f
            int r1 = r1.getMaxPacketSize()
            r3 = 64
            if (r1 != r3) goto L2c
            com.rt.printerlibrary.driver.usb.rw.PL2303Driver$pl2303_type r1 = com.rt.printerlibrary.driver.usb.rw.PL2303Driver.pl2303_type.HX
            goto L1a
        L2c:
            com.rt.printerlibrary.driver.usb.rw.USBPort r1 = r8.port
            android.hardware.usb.UsbDevice r1 = r1.c
            int r1 = r1.getDeviceClass()
            if (r1 != 0) goto L39
        L36:
            com.rt.printerlibrary.driver.usb.rw.PL2303Driver$pl2303_type r1 = com.rt.printerlibrary.driver.usb.rw.PL2303Driver.pl2303_type.type_1
            goto L1a
        L39:
            com.rt.printerlibrary.driver.usb.rw.USBPort r1 = r8.port
            android.hardware.usb.UsbDevice r1 = r1.c
            int r1 = r1.getDeviceClass()
            r3 = 255(0xff, float:3.57E-43)
            if (r1 != r3) goto L46
            goto L36
        L46:
            r1 = 33924(0x8484, float:4.7538E-41)
            r3 = 0
            r7.a(r8, r1, r3, r0)
            r4 = 1028(0x404, float:1.44E-42)
            r7.a(r8, r4, r3)
            r7.a(r8, r1, r3, r0)
            r5 = 33667(0x8383, float:4.7178E-41)
            r7.a(r8, r5, r3, r0)
            r7.a(r8, r1, r3, r0)
            r6 = 1
            r7.a(r8, r4, r6)
            r7.a(r8, r1, r3, r0)
            r7.a(r8, r5, r3, r0)
            r7.a(r8, r3, r6)
            r7.a(r8, r6, r3)
            com.rt.printerlibrary.driver.usb.rw.PL2303Driver$pl2303_type r0 = r7.type
            com.rt.printerlibrary.driver.usb.rw.PL2303Driver$pl2303_type r1 = com.rt.printerlibrary.driver.usb.rw.PL2303Driver.pl2303_type.HX
            if (r0 != r1) goto L77
            r0 = 68
            goto L79
        L77:
            r0 = 36
        L79:
            r7.a(r8, r2, r0)
            return r3
        */
        throw new UnsupportedOperationException("Method not decompiled: com.rt.printerlibrary.driver.usb.rw.PL2303Driver.a(com.rt.printerlibrary.driver.usb.rw.USBSerialPort):int");
    }

    int a(USBSerialPort uSBSerialPort, int i) {
        if (uSBSerialPort == null) {
            return -1003;
        }
        USBPort uSBPort = uSBSerialPort.port;
        return a(uSBPort, 33, 34, i, 0, null, 0, 100);
    }

    int a(USBSerialPort uSBSerialPort, int i, int i2) {
        if (uSBSerialPort == null) {
            return -1003;
        }
        USBPort uSBPort = uSBSerialPort.port;
        return a(uSBPort, 64, 1, i, i2, null, 0, 100);
    }

    int a(USBSerialPort uSBSerialPort, int i, int i2, byte[] bArr) {
        if (uSBSerialPort == null) {
            return -1003;
        }
        return a(uSBSerialPort.port, 192, 1, i, i2, bArr, 1, 100);
    }

    @Override // com.rt.printerlibrary.driver.usb.rw.USBSerialDriver
    int a(USBSerialPort uSBSerialPort, TTYTermios tTYTermios) {
        if (uSBSerialPort == null) {
            return -1003;
        }
        if (this.type == pl2303_type.HX) {
            a(uSBSerialPort, 8, 0);
            a(uSBSerialPort, 9, 0);
        }
        b(uSBSerialPort, tTYTermios);
        return 0;
    }

    @Override // com.rt.printerlibrary.driver.usb.rw.USBSerialDriver
    int b(USBSerialPort uSBSerialPort) {
        return uSBSerialPort == null ? -1003 : 0;
    }

    @Override // com.rt.printerlibrary.driver.usb.rw.USBSerialDriver
    int b(USBSerialPort uSBSerialPort, TTYTermios tTYTermios) {
        int[] iArr = {75, 150, 300, 600, 1200, 1800, 2400, 3600, 4800, 7200, 9600, 14400, 19200, 28800, 38400, 57600, 115200, 230400, 460800, 614400, 921600, 1228800, 2457600, 3000000, GmsVersion.VERSION_MANCHEGO};
        if (uSBSerialPort == null || uSBSerialPort.termios == null || tTYTermios == null) {
            return -1003;
        }
        TTYTermios tTYTermios2 = uSBSerialPort.termios;
        if (!a(tTYTermios2, tTYTermios)) {
            return 0;
        }
        byte[] bArr = new byte[7];
        a(uSBSerialPort.port, 161, 33, 0, 0, bArr, 7, 100);
        switch (tTYTermios2.dataBits) {
            case 5:
                bArr[6] = 5;
                break;
            case 6:
                bArr[6] = 6;
                break;
            case 7:
                bArr[6] = 7;
                break;
            default:
                bArr[6] = 8;
                break;
        }
        int i = 0;
        while (i < 25 && iArr[i] != tTYTermios2.baudrate) {
            i++;
        }
        if (i == 25) {
            tTYTermios2.baudrate = 9600;
        }
        if (tTYTermios2.baudrate > 1228800) {
            if (this.type != pl2303_type.HX) {
                tTYTermios2.baudrate = 1228800;
            } else if (tTYTermios2.baudrate > 6000000) {
                tTYTermios2.baudrate = tTYTermios2.baudrate;
            }
        }
        if (tTYTermios2.baudrate <= 115200) {
            bArr[0] = (byte) (tTYTermios2.baudrate & 255);
            bArr[1] = (byte) ((tTYTermios2.baudrate >> 8) & 255);
            bArr[2] = (byte) ((tTYTermios2.baudrate >> 16) & 255);
            bArr[3] = (byte) ((tTYTermios2.baudrate >> 24) & 255);
        } else {
            long j = 384000000 / tTYTermios2.baudrate;
            bArr[3] = ByteCompanionObject.MIN_VALUE;
            bArr[2] = 0;
            bArr[1] = (byte) (j >= 256 ? 1 : 0);
            while (j >= 256) {
                j >>= 2;
                bArr[1] = (byte) ((bArr[1] & UByte.MAX_VALUE) << 1);
            }
            if (j > 256) {
                j %= 256;
            }
            bArr[0] = (byte) j;
        }
        switch (tTYTermios2.stopBits.ordinal()) {
            case 1:
                bArr[4] = 0;
                break;
            case 2:
                bArr[4] = 1;
                break;
            case 3:
                bArr[4] = 2;
                break;
        }
        switch (tTYTermios2.parity.ordinal()) {
            case 1:
                bArr[5] = 0;
                break;
            case 2:
                bArr[5] = 1;
                break;
            case 3:
                bArr[5] = 2;
                break;
            case 4:
                bArr[5] = 4;
                break;
            case 5:
                bArr[5] = 3;
                break;
        }
        a(uSBSerialPort.port, 33, 32, 0, 0, bArr, 7, 100);
        int i2 = (tTYTermios2.baudrate != 0 && tTYTermios.baudrate == 0) ? 3 : 0;
        if (i2 != 0) {
            a(uSBSerialPort, i2);
        }
        bArr[6] = 0;
        bArr[5] = 0;
        bArr[4] = 0;
        bArr[3] = 0;
        bArr[2] = 0;
        bArr[1] = 0;
        bArr[0] = 0;
        a(uSBSerialPort.port, 161, 33, 0, 0, bArr, 7, 100);
        if (tTYTermios2.flowControl == TTYTermios.FlowControl.DTR_RTS) {
            a(uSBSerialPort, 0, this.type == pl2303_type.HX ? 97 : 65);
        } else {
            a(uSBSerialPort, 0, 0);
        }
        return 0;
    }

    @Override // com.rt.printerlibrary.driver.usb.rw.USBSerialDriver
    int c(USBSerialPort uSBSerialPort) {
        return uSBSerialPort == null ? -1003 : 0;
    }

    public int pl2303_close(USBSerialPort uSBSerialPort) {
        this.h = false;
        if (uSBSerialPort == null) {
            return -1003;
        }
        c(uSBSerialPort);
        return 0;
    }

    public void pl2303_disconnect(USBSerialPort uSBSerialPort) {
        pl2303_close(uSBSerialPort);
        this.g = false;
        if (uSBSerialPort != null) {
            b(uSBSerialPort);
            b(uSBSerialPort.port);
        }
    }

    public boolean pl2303_isOpen(USBSerialPort uSBSerialPort) {
        return (!this.g || !this.h || uSBSerialPort == null || uSBSerialPort.port == null || uSBSerialPort.port.h == null) ? false : true;
    }

    public int pl2303_open(USBSerialPort uSBSerialPort, TTYTermios tTYTermios) {
        if (uSBSerialPort == null) {
            return -1003;
        }
        if (!this.g) {
            this.h = false;
            return -1005;
        }
        if ((!this.i ? a(uSBSerialPort, tTYTermios) : 0) == 0) {
            this.h = true;
        } else {
            this.h = false;
        }
        return 0;
    }

    public int pl2303_probe(USBSerialPort uSBSerialPort) {
        if (uSBSerialPort == null) {
            return -1003;
        }
        int iA = a(uSBSerialPort.port);
        if (iA == 0) {
            if ((uSBSerialPort.port.c.getVendorId() == b.a && uSBSerialPort.port.c.getProductId() == b.b) || (uSBSerialPort.port.c.getVendorId() == d.a && uSBSerialPort.port.c.getProductId() == d.b)) {
                this.i = true;
            } else if (uSBSerialPort.port.c.getVendorId() == a.a && uSBSerialPort.port.c.getProductId() == a.b) {
                this.i = false;
            }
            if (!this.i) {
                iA = a(uSBSerialPort);
            }
        }
        if (iA == 0) {
            this.g = true;
        } else {
            this.g = false;
        }
        return iA;
    }

    public int pl2303_read(USBSerialPort uSBSerialPort, byte[] bArr, int i, int i2, int i3) {
        if (uSBSerialPort == null) {
            return -1003;
        }
        if (!pl2303_isOpen(uSBSerialPort)) {
            return -1006;
        }
        try {
            return b(uSBSerialPort.port, bArr, i, i2, i3);
        } catch (Exception e) {
            return -1004;
        }
    }

    public int pl2303_write(USBSerialPort uSBSerialPort, byte[] bArr, int i, int i2, int i3) {
        if (uSBSerialPort == null) {
            return -1003;
        }
        if (!pl2303_isOpen(uSBSerialPort)) {
            return -1006;
        }
        try {
            return a(uSBSerialPort.port, bArr, i, i2, i3);
        } catch (Exception e) {
            return -1004;
        }
    }
}
