package com.rt.printerlibrary.connect;

import com.rt.printerlibrary.enumerate.ConnectStateEnum;
import com.rt.printerlibrary.utils.PrintListener;

/* JADX INFO: loaded from: classes11.dex */
public abstract class PrinterInterface<T> {
    private T configObject;
    ConnectStateEnum curState;
    private String mName = "";

    public abstract void connect(T t) throws Exception;

    public abstract void disConnect();

    public T getConfigObject() {
        return this.configObject;
    }

    public abstract ConnectStateEnum getConnectState();

    public abstract boolean getIsPrinting();

    public abstract boolean getisAlwaysReadInputStream();

    public String getmName() {
        return this.mName;
    }

    public abstract byte[] readMsg();

    public abstract void setAlwaysReadInputStream(boolean z);

    public void setConfigObject(T t) {
        this.configObject = t;
    }

    public abstract void setPrintListener(PrintListener printListener);

    public void setmName(String str) {
        this.mName = str;
    }

    public abstract void writeMsg(byte[] bArr);

    public abstract void writeMsgAsync(byte[] bArr);
}
