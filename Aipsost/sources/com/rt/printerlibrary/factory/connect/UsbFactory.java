package com.rt.printerlibrary.factory.connect;

import com.rt.printerlibrary.connect.PrinterInterface;
import com.rt.printerlibrary.connect.UsbInterface;
import com.rt.printerlibrary.enumerate.BluetoothType;

/* JADX INFO: loaded from: classes11.dex */
public class UsbFactory extends PIFactory {
    @Override // com.rt.printerlibrary.factory.connect.PIFactory
    public PrinterInterface create() {
        return new UsbInterface();
    }

    @Override // com.rt.printerlibrary.factory.connect.PIFactory
    public PrinterInterface create(BluetoothType bluetoothType) {
        return null;
    }
}
