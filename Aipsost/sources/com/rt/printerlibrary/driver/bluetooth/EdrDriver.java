package com.rt.printerlibrary.driver.bluetooth;

import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothSocket;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;
import com.rt.printerlibrary.bean.BluetoothEdrConfigBean;
import com.rt.printerlibrary.bean.PrinterStatusBean;
import com.rt.printerlibrary.connect.BluetoothInterface;
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
import java.util.UUID;

/* JADX INFO: loaded from: classes11.dex */
public class EdrDriver extends BaseDriver {
    private final UUID a = UUID.fromString("00001101-0000-1000-8000-00805F9B34FB");
    private BluetoothEdrConfigBean b;
    private BluetoothSocket c;
    private InputStream d;
    private BluetoothInterface e;
    private OutputStream f;

    public EdrDriver(BluetoothEdrConfigBean bluetoothEdrConfigBean) {
        this.b = bluetoothEdrConfigBean;
    }

    private void a() {
        while (this.c != null && isAlive()) {
            if (getisAlwaysReadInputStream()) {
                byte[] bArr = new byte[1024];
                try {
                    if (this.d.available() == 0) {
                        Thread.currentThread();
                    } else {
                        int i = this.d.read(bArr);
                        if (i != -1) {
                            byte[] bArrHexToByteArr = FuncUtils.HexToByteArr(FuncUtils.ByteArrToHex(bArr, 0, i));
                            for (PrinterObserver printerObserver : PrinterObserverManager.getInstance().getObservers()) {
                                BluetoothInterface bluetoothInterface = this.e;
                                if (bluetoothInterface != null) {
                                    bluetoothInterface.setConfigObject(this.b);
                                }
                                printerObserver.printerReadMsgCallback(this.e, bArrHexToByteArr);
                            }
                            a(bArrHexToByteArr);
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
                    return;
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

    private void a(BluetoothEdrConfigBean bluetoothEdrConfigBean) {
        BluetoothAdapter.getDefaultAdapter().cancelDiscovery();
        try {
            BluetoothSocket bluetoothSocketCreateRfcommSocketToServiceRecord = bluetoothEdrConfigBean.mBluetoothDevice.createRfcommSocketToServiceRecord(this.a);
            this.c = bluetoothSocketCreateRfcommSocketToServiceRecord;
            bluetoothSocketCreateRfcommSocketToServiceRecord.connect();
            this.d = this.c.getInputStream();
            this.f = this.c.getOutputStream();
            b();
        } catch (IOException e) {
            e.printStackTrace();
            close();
        }
    }

    private void a(byte[] bArr) {
        if (this.printListener != null) {
            final PrinterStatusBean printerStatusResult = PrinterStatusPareseUtils.parsePrinterStatusResult(bArr);
            if (printerStatusResult.printStatusCmd != PrintStatusCmd.cmd_UnKnow) {
                new Handler(Looper.getMainLooper()).post(new Runnable() { // from class: com.rt.printerlibrary.driver.bluetooth.EdrDriver.1
                    @Override // java.lang.Runnable
                    public void run() {
                        EdrDriver.this.printListener.onPrinterStatus(printerStatusResult);
                    }
                });
            }
        }
    }

    private void b() {
        for (PrinterObserver printerObserver : PrinterObserverManager.getInstance().getObservers()) {
            BluetoothInterface bluetoothInterface = this.e;
            if (bluetoothInterface != null) {
                bluetoothInterface.setConfigObject(this.b);
            }
            printerObserver.printerObserverCallback(this.e, 1);
        }
    }

    private void c() {
        for (PrinterObserver printerObserver : PrinterObserverManager.getInstance().getObservers()) {
            BluetoothInterface bluetoothInterface = this.e;
            if (bluetoothInterface != null) {
                bluetoothInterface.setConfigObject(this.b);
            }
            printerObserver.printerObserverCallback(this.e, 0);
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
            OutputStream outputStream = this.f;
            if (outputStream != null) {
                outputStream.close();
                this.f = null;
            }
        } catch (Exception e2) {
            e2.printStackTrace();
        }
        try {
            BluetoothSocket bluetoothSocket = this.c;
            if (bluetoothSocket != null) {
                bluetoothSocket.close();
                this.c = null;
            }
        } catch (Exception e3) {
            e3.printStackTrace();
        }
        c();
    }

    @Override // com.rt.printerlibrary.driver.BaseDriver
    public ConnectStateEnum getConnectState() {
        BluetoothSocket bluetoothSocket = this.c;
        if (bluetoothSocket != null && bluetoothSocket.isConnected()) {
            return ConnectStateEnum.Connected;
        }
        return ConnectStateEnum.NoConnect;
    }

    public BluetoothInterface getPrinterInterface() {
        return this.e;
    }

    public byte[] readMsg() {
        InputStream inputStream;
        int i = 0;
        while (this.d.available() == 0 && i < 10) {
            try {
                i++;
                Thread.sleep(100L);
            } catch (Exception e) {
                e.printStackTrace();
                close();
                return null;
            }
        }
        if (this.d.available() == 0 || (inputStream = this.d) == null) {
            return null;
        }
        byte[] bArrInput2byte = input2byte(inputStream);
        Log.e("rrr", "e-rev data:" + FuncUtils.ByteArrToHex(bArrInput2byte));
        return bArrInput2byte;
    }

    @Override // java.lang.Thread, java.lang.Runnable
    public void run() {
        super.run();
        a(this.b);
        a();
    }

    public void setPrinterInterface(BluetoothInterface bluetoothInterface) {
        this.e = bluetoothInterface;
    }

    public synchronized void write(byte[] bArr) {
        seIsPrinting(true);
        if (this.f != null) {
            try {
                int length = bArr.length;
                int i = length / 256;
                int i2 = length % 256;
                for (int i3 = 0; i3 < i; i3++) {
                    byte[] bArr2 = new byte[256];
                    for (int i4 = 0; i4 < 256; i4++) {
                        bArr2[i4] = bArr[(i3 * 256) + i4];
                    }
                    this.f.write(bArr2);
                    Thread.sleep(10L);
                }
                byte[] bArr3 = new byte[i2];
                for (int i5 = 0; i5 < i2; i5++) {
                    bArr3[i5] = bArr[(i * 256) + i5];
                }
                this.f.write(bArr3);
                seIsPrinting(false);
            } catch (IOException e) {
                e.printStackTrace();
                close();
                seIsPrinting(false);
            } catch (InterruptedException e2) {
                e2.printStackTrace();
                seIsPrinting(false);
            }
            seIsPrinting(false);
        } else {
            seIsPrinting(false);
        }
    }

    public void writeASync(final byte[] bArr) {
        seIsPrinting(true);
        new Thread(new Runnable() { // from class: com.rt.printerlibrary.driver.bluetooth.EdrDriver.2
            @Override // java.lang.Runnable
            public void run() {
                EdrDriver.this.write(bArr);
            }
        }).start();
    }
}
