package com.rt.printerlibrary.factory.connect;

import com.rt.printerlibrary.connect.PrinterInterface;
import com.rt.printerlibrary.connect.WiFiInterface;
import com.rt.printerlibrary.enumerate.BluetoothType;

/* JADX INFO: loaded from: classes11.dex */
public class WiFiFactory extends PIFactory {
    @Override // com.rt.printerlibrary.factory.connect.PIFactory
    public PrinterInterface create() {
        return new WiFiInterface();
    }

    @Override // com.rt.printerlibrary.factory.connect.PIFactory
    public PrinterInterface create(BluetoothType bluetoothType) {
        return null;
    }
}
