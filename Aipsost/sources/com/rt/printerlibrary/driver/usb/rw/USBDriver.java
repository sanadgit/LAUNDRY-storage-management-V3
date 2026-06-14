package com.rt.printerlibrary.driver.usb.rw;

import android.hardware.usb.UsbEndpoint;
import androidx.core.app.NotificationManagerCompat;

/* JADX INFO: loaded from: classes11.dex */
public class USBDriver {
    static final USBDeviceId a = new USBDeviceId(1659, 8963);
    static final USBDeviceId b = new USBDeviceId(4070, 33054);
    static final USBDeviceId c = new USBDeviceId(4070, 847);
    static final USBDeviceId d = new USBDeviceId(8137, 8210);
    static final USBDeviceId e = new USBDeviceId(1208, 514);
    private boolean f = false;

    int a(USBPort uSBPort, int i, int i2, int i3, int i4, byte[] bArr, int i5, int i6) {
        if (!this.f) {
            return -1005;
        }
        if (uSBPort == null || uSBPort.h == null) {
            return -1003;
        }
        try {
            return uSBPort.h.controlTransfer(i, i2, i3, i4, bArr, i5, i6);
        } catch (Exception e2) {
            return -1004;
        }
    }

    int a(USBPort uSBPort, byte[] bArr, int i, int i2, int i3) {
        if (!this.f) {
            return -1005;
        }
        if (uSBPort == null || bArr == null || uSBPort.f == null || uSBPort.h == null) {
            return -1001;
        }
        if (i2 < 0 || i < 0 || i3 <= 0) {
            return -1003;
        }
        byte[] bArr2 = new byte[i2];
        DataUtils.copyBytes(bArr, i, bArr2, 0, i2);
        try {
            return uSBPort.h.bulkTransfer(uSBPort.f, bArr2, i2, i3);
        } catch (Exception e2) {
            return -1004;
        }
    }

    int a(USBPort uSBPort, USBDeviceId[] uSBDeviceIdArr) {
        if (uSBPort == null || uSBDeviceIdArr == null || uSBPort.a == null || uSBPort.b == null || uSBPort.c == null || uSBPort.d == null) {
            return -1001;
        }
        for (int i = 0; i < uSBDeviceIdArr.length; i++) {
            if (uSBDeviceIdArr[i].a == uSBPort.c.getVendorId() && uSBDeviceIdArr[i].b == uSBPort.c.getProductId()) {
                uSBPort.a.requestPermission(uSBPort.c, uSBPort.d);
                if (!uSBPort.a.hasPermission(uSBPort.c)) {
                    return -1002;
                }
                loop1: for (int i2 = 0; i2 < uSBPort.c.getInterfaceCount(); i2++) {
                    uSBPort.e = uSBPort.c.getInterface(i2);
                    uSBPort.f = null;
                    uSBPort.g = null;
                    for (int i3 = 0; i3 < uSBPort.e.getEndpointCount(); i3++) {
                        UsbEndpoint endpoint = uSBPort.e.getEndpoint(i3);
                        if (endpoint.getDirection() == 0 && endpoint.getType() == 2) {
                            uSBPort.f = endpoint;
                        } else if (endpoint.getDirection() == 128 && endpoint.getType() == 2) {
                            uSBPort.g = endpoint;
                        }
                        if (uSBPort.f != null && uSBPort.g != null) {
                            break loop1;
                        }
                        if (uSBPort.f != null) {
                            int vendorId = uSBPort.c.getVendorId();
                            USBDeviceId uSBDeviceId = b;
                            if (vendorId == uSBDeviceId.a && uSBPort.c.getProductId() == uSBDeviceId.b) {
                                break loop1;
                            }
                        }
                    }
                }
                if (uSBPort.e == null || uSBPort.f == null) {
                    return -1001;
                }
                if (uSBPort.g == null) {
                    int vendorId2 = uSBPort.c.getVendorId();
                    USBDeviceId uSBDeviceId2 = b;
                    if (vendorId2 != uSBDeviceId2.a && uSBPort.c.getProductId() != uSBDeviceId2.b) {
                        return -1001;
                    }
                }
                uSBPort.h = uSBPort.a.openDevice(uSBPort.c);
                if (uSBPort.h == null) {
                    return -1001;
                }
                uSBPort.h.claimInterface(uSBPort.e, true);
                this.f = true;
                return 0;
            }
        }
        return NotificationManagerCompat.IMPORTANCE_UNSPECIFIED;
    }

    int b(USBPort uSBPort, byte[] bArr, int i, int i2, int i3) {
        if (!this.f) {
            return -1005;
        }
        if (uSBPort == null || bArr == null || uSBPort.g == null || uSBPort.h == null) {
            return -1001;
        }
        if (i2 < 0 || i < 0 || i3 <= 0) {
            return -1003;
        }
        byte[] bArr2 = new byte[i2];
        try {
            int iBulkTransfer = uSBPort.h.bulkTransfer(uSBPort.g, bArr2, i2, i3);
            DataUtils.copyBytes(bArr2, 0, bArr, i, iBulkTransfer);
            return iBulkTransfer;
        } catch (Exception e2) {
            return -1004;
        }
    }

    void b(USBPort uSBPort) {
        this.f = false;
        if (uSBPort == null || uSBPort.e == null || uSBPort.h == null) {
            return;
        }
        uSBPort.h.controlTransfer(33, 255, 0, 0, null, 0, 1000);
    }
}
