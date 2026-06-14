package com.rt.printerlibrary.bean;

import android.bluetooth.BluetoothDevice;

/* JADX INFO: loaded from: classes11.dex */
public class BluetoothEdrConfigBean {
    public BluetoothDevice mBluetoothDevice;

    public BluetoothEdrConfigBean(BluetoothDevice bluetoothDevice) {
        this.mBluetoothDevice = bluetoothDevice;
    }

    public String toString() {
        return this.mBluetoothDevice.getName() + "|" + this.mBluetoothDevice.getAddress();
    }
}
