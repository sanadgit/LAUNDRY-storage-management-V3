package com.rt.printerlibrary.bean;

import com.clj.fastble.data.BleDevice;

/* JADX INFO: loaded from: classes11.dex */
public class BleConfigBean {
    public BleDevice bleDevice;

    public BleConfigBean(BleDevice bleDevice) {
        this.bleDevice = bleDevice;
    }

    public String toString() {
        return this.bleDevice.getName() + "|" + this.bleDevice.getMac();
    }
}
