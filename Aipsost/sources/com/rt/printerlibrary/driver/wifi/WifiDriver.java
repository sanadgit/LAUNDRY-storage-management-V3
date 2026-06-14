package com.rt.printerlibrary.driver.wifi;

import android.os.Handler;
import android.os.Looper;
import android.util.Log;
import androidx.vectordrawable.graphics.drawable.PathInterpolatorCompat;
import com.rt.printerlibrary.bean.PrinterStatusBean;
import com.rt.printerlibrary.bean.WiFiConfigBean;
import com.rt.printerlibrary.connect.WiFiInterface;
import com.rt.printerlibrary.driver.BaseDriver;
import com.rt.printerlibrary.enumerate.ConnectStateEnum;
import com.rt.printerlibrary.observer.PrinterObserver;
import com.rt.printerlibrary.observer.PrinterObserverManager;
import com.rt.printerlibrary.utils.FuncUtils;
import com.rt.printerlibrary.utils.PrintStatusCmd;
import com.rt.printerlibrary.utils.PrinterStatusPareseUtils;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.Socket;

/* JADX INFO: loaded from: classes11.dex */
public class WifiDriver extends BaseDriver {
    private Socket a = null;
    private String b;
    private int c;
    private InputStream d;
    private OutputStream e;
    private WiFiInterface f;
    private WiFiConfigBean g;

    public WifiDriver(String str, int i) {
        this.b = str;
        this.c = i;
    }

    private void a() {
        while (this.a != null && isAlive()) {
            if (getisAlwaysReadInputStream()) {
                byte[] bArr = new byte[1024];
                try {
                    if (this.d.available() == 0) {
                        Thread.currentThread();
                    } else {
                        int i = this.d.read(bArr);
                        if (i != -1) {
                            System.out.println("instream read");
                            byte[] bArrHexToByteArr = FuncUtils.HexToByteArr(FuncUtils.ByteArrToHex(bArr, 0, i));
                            for (PrinterObserver printerObserver : PrinterObserverManager.getInstance().getObservers()) {
                                WiFiInterface wiFiInterface = this.f;
                                if (wiFiInterface != null) {
                                    wiFiInterface.setConfigObject(this.g);
                                }
                                printerObserver.printerReadMsgCallback(this.f, bArrHexToByteArr);
                                a(bArrHexToByteArr);
                            }
                        }
                    }
                    Thread.sleep(200L);
                } catch (IOException e) {
                    e.printStackTrace();
                    close();
                    return;
                } catch (InterruptedException e2) {
                    e2.printStackTrace();
                    close();
                    return;
                } catch (Exception e3) {
                    e3.printStackTrace();
                    close();
                }
            } else {
                try {
                    Thread.currentThread();
                    Thread.sleep(200L);
                } catch (InterruptedException e4) {
                    e4.printStackTrace();
                }
            }
        }
    }

    private void a(byte[] bArr) {
        if (this.printListener != null) {
            final PrinterStatusBean printerStatusResult = PrinterStatusPareseUtils.parsePrinterStatusResult(bArr);
            if (printerStatusResult.printStatusCmd != PrintStatusCmd.cmd_UnKnow) {
                new Handler(Looper.getMainLooper()).post(new Runnable() { // from class: com.rt.printerlibrary.driver.wifi.WifiDriver.1
                    @Override // java.lang.Runnable
                    public void run() {
                        WifiDriver.this.printListener.onPrinterStatus(printerStatusResult);
                    }
                });
            }
        }
    }

    private void b() {
        for (PrinterObserver printerObserver : PrinterObserverManager.getInstance().getObservers()) {
            WiFiInterface wiFiInterface = this.f;
            if (wiFiInterface != null) {
                wiFiInterface.setConfigObject(this.g);
            }
            printerObserver.printerObserverCallback(this.f, 1);
        }
    }

    private void c() {
        for (PrinterObserver printerObserver : PrinterObserverManager.getInstance().getObservers()) {
            WiFiInterface wiFiInterface = this.f;
            if (wiFiInterface != null) {
                wiFiInterface.setConfigObject(this.g);
            }
            printerObserver.printerObserverCallback(this.f, 0);
        }
    }

    public void close() {
        try {
            InputStream inputStream = this.d;
            if (inputStream != null) {
                inputStream.close();
                this.d = null;
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        try {
            OutputStream outputStream = this.e;
            if (outputStream != null) {
                outputStream.close();
                this.e = null;
            }
        } catch (Exception e2) {
            e2.printStackTrace();
        }
        try {
            Socket socket = this.a;
            if (socket != null) {
                socket.close();
                this.a = null;
            }
        } catch (Exception e3) {
            e3.printStackTrace();
        }
        c();
    }

    public void connect(String str, int i) {
        Socket socket = this.a;
        if (socket != null) {
            try {
                socket.close();
            } catch (IOException e) {
                e.printStackTrace();
            }
            this.a = null;
        }
        try {
            Socket socket2 = new Socket();
            this.a = socket2;
            socket2.connect(new InetSocketAddress(str, i), PathInterpolatorCompat.MAX_NUM_POINTS);
            this.d = this.a.getInputStream();
            this.e = this.a.getOutputStream();
            this.g = new WiFiConfigBean(str, i);
            b();
        } catch (IOException e2) {
            e2.printStackTrace();
            close();
        } catch (Exception e3) {
            e3.printStackTrace();
            close();
        }
    }

    @Override // com.rt.printerlibrary.driver.BaseDriver
    public ConnectStateEnum getConnectState() {
        Socket socket = this.a;
        if (socket != null && socket.isConnected()) {
            return ConnectStateEnum.Connected;
        }
        return ConnectStateEnum.NoConnect;
    }

    public String getIp() {
        return this.b;
    }

    public int getPort() {
        return this.c;
    }

    public WiFiInterface getWiFiInterface() {
        return this.f;
    }

    public byte[] readMsg() {
        try {
            InputStream inputStream = this.d;
            if (inputStream == null) {
                return null;
            }
            byte[] bArrInput2byte = input2byte(inputStream);
            Log.e("rrr", "w-rev data:" + FuncUtils.ByteArrToHex(bArrInput2byte));
            return bArrInput2byte;
        } catch (Exception e) {
            e.printStackTrace();
            close();
            return null;
        }
    }

    @Override // java.lang.Thread, java.lang.Runnable
    public void run() {
        super.run();
        connect(this.b, this.c);
        a();
    }

    public void setIp(String str) {
        this.b = str;
    }

    public void setPort(int i) {
        this.c = i;
    }

    public void setWiFiInterface(WiFiInterface wiFiInterface) {
        this.f = wiFiInterface;
    }

    public synchronized void write(byte[] bArr) {
        if (this.e != null) {
            seIsPrinting(true);
            try {
                this.e.write(bArr);
                seIsPrinting(false);
            } catch (IOException e) {
                e.printStackTrace();
                close();
                seIsPrinting(false);
            }
            seIsPrinting(false);
        } else {
            seIsPrinting(false);
        }
    }

    public void writeASync(final byte[] bArr) {
        seIsPrinting(true);
        new Thread(new Runnable() { // from class: com.rt.printerlibrary.driver.wifi.WifiDriver.2
            @Override // java.lang.Runnable
            public void run() {
                WifiDriver.this.write(bArr);
            }
        }).start();
    }
}
