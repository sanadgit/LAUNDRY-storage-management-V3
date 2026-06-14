package com.rt.printerlibrary.driver;

import android.util.Log;
import com.rt.printerlibrary.enumerate.ConnectStateEnum;
import com.rt.printerlibrary.utils.FuncUtils;
import com.rt.printerlibrary.utils.PrintListener;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;

/* JADX INFO: loaded from: classes11.dex */
public abstract class BaseDriver extends Thread {
    private volatile boolean a = true;
    private boolean b = true;
    public PrintListener printListener;

    public static final byte[] input2byte(InputStream inputStream) throws IOException {
        ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
        byte[] bArr = new byte[1024];
        int i = inputStream.read(bArr);
        if (i != -1) {
            byteArrayOutputStream.write(bArr, 0, i);
        }
        byte[] byteArray = byteArrayOutputStream.toByteArray();
        byteArrayOutputStream.close();
        Log.e("Fuuu", "Rev:" + FuncUtils.ByteArrToHex(byteArray));
        return byteArray;
    }

    public abstract ConnectStateEnum getConnectState();

    public boolean getIsPrinting() {
        return this.a;
    }

    public PrintListener getPrintListener() {
        return this.printListener;
    }

    public boolean getisAlwaysReadInputStream() {
        return this.b;
    }

    public void seIsPrinting(boolean z) {
        this.a = z;
    }

    public void setAlwaysReadInputStream(boolean z) {
        this.b = z;
    }

    public void setPrintListener(PrintListener printListener) {
        this.printListener = printListener;
    }
}
