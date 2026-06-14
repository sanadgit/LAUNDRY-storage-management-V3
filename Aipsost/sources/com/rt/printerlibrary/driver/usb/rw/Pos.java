package com.rt.printerlibrary.driver.usb.rw;

/* JADX INFO: loaded from: classes11.dex */
public class Pos extends GMPos {
    USBSerialPort e;
    PL2303Driver f;

    public Pos(USBSerialPort uSBSerialPort, PL2303Driver pL2303Driver) {
        this.e = uSBSerialPort;
        this.f = pL2303Driver;
    }

    @Override // com.rt.printerlibrary.driver.usb.rw.GMPos
    public boolean POS_IsOpen() {
        PL2303Driver pL2303Driver = this.f;
        if (pL2303Driver == null) {
            return false;
        }
        return pL2303Driver.pl2303_isOpen(this.e);
    }

    @Override // com.rt.printerlibrary.driver.usb.rw.GMPos
    public int POS_Read(byte[] bArr, int i, int i2, int i3) {
        PL2303Driver pL2303Driver = this.f;
        if (pL2303Driver == null) {
            return -1001;
        }
        int iPl2303_read = pL2303Driver.pl2303_read(this.e, bArr, i, i2, i3);
        if (this.b) {
            POS_WriteToFile(bArr, i, iPl2303_read, this.c);
        }
        return iPl2303_read;
    }

    @Override // com.rt.printerlibrary.driver.usb.rw.GMPos
    public int POS_Write(byte[] bArr, int i, int i2, int i3) {
        PL2303Driver pL2303Driver = this.f;
        if (pL2303Driver == null) {
            return -1001;
        }
        int iPl2303_write = pL2303Driver.pl2303_write(this.e, bArr, i, i2, i3);
        if (this.b) {
            POS_WriteToFile(bArr, i, iPl2303_write, this.d);
        }
        return iPl2303_write;
    }

    @Override // com.rt.printerlibrary.driver.usb.rw.GMPos
    public /* bridge */ /* synthetic */ void POS_WriteToFile(String str, String str2) {
        super.POS_WriteToFile(str, str2);
    }

    @Override // com.rt.printerlibrary.driver.usb.rw.GMPos
    public /* bridge */ /* synthetic */ void POS_WriteToFile(byte[] bArr, int i, int i2, String str) {
        super.POS_WriteToFile(bArr, i, i2, str);
    }
}
