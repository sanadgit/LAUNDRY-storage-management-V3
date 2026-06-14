package com.rt.printerlibrary.factory.connect;

import com.rt.printerlibrary.connect.PrinterInterface;
import com.rt.printerlibrary.enumerate.BluetoothType;

/* JADX INFO: loaded from: classes11.dex */
public abstract class PIFactory {
    public abstract PrinterInterface create();

    public abstract PrinterInterface create(BluetoothType bluetoothType);
}
