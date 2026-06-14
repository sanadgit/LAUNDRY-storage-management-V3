package com.rt.printerlibrary.factory.connect;

import com.rt.printerlibrary.connect.BleInterface;
import com.rt.printerlibrary.connect.BluetoothInterface;
import com.rt.printerlibrary.connect.PrinterInterface;
import com.rt.printerlibrary.enumerate.BluetoothType;

/* JADX INFO: loaded from: classes11.dex */
public class BluetoothFactory extends PIFactory {
    @Override // com.rt.printerlibrary.factory.connect.PIFactory
    public PrinterInterface create() {
        return new BluetoothInterface();
    }

    @Override // com.rt.printerlibrary.factory.connect.PIFactory
    public PrinterInterface create(BluetoothType bluetoothType) {
        if (BluetoothType.BLUETOOTH_EDR == bluetoothType) {
            return new BluetoothInterface();
        }
        if (BluetoothType.BLUETOOTH_BLE == bluetoothType) {
            return new BleInterface();
        }
        return null;
    }
}
