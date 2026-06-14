package com.rt.printerlibrary.connect;

import com.rt.printerlibrary.bean.WiFiConfigBean;
import com.rt.printerlibrary.driver.wifi.WifiDriver;
import com.rt.printerlibrary.enumerate.ConnectStateEnum;
import com.rt.printerlibrary.utils.PrintListener;

/* JADX INFO: loaded from: classes11.dex */
public class WiFiInterface extends PrinterInterface {
    private WifiDriver a;

    @Override // com.rt.printerlibrary.connect.PrinterInterface
    public void connect(Object obj) throws Exception {
        if (!(obj instanceof WiFiConfigBean)) {
            throw new Exception("Method com.rt.printerlibrary.connect.WiFiInterface.connect's param must be WiFiConfigBean");
        }
        WiFiConfigBean wiFiConfigBean = (WiFiConfigBean) obj;
        WifiDriver wifiDriver = this.a;
        if (wifiDriver == null) {
            this.a = new WifiDriver(wiFiConfigBean.ip, wiFiConfigBean.port);
        } else {
            wifiDriver.interrupt();
        }
        this.a.start();
        this.a.setWiFiInterface(this);
    }

    @Override // com.rt.printerlibrary.connect.PrinterInterface
    public void disConnect() {
        WifiDriver wifiDriver = this.a;
        if (wifiDriver != null) {
            wifiDriver.close();
        }
    }

    @Override // com.rt.printerlibrary.connect.PrinterInterface
    public ConnectStateEnum getConnectState() {
        return this.a.getConnectState();
    }

    @Override // com.rt.printerlibrary.connect.PrinterInterface
    public boolean getIsPrinting() {
        return this.a.getIsPrinting();
    }

    @Override // com.rt.printerlibrary.connect.PrinterInterface
    public boolean getisAlwaysReadInputStream() {
        WifiDriver wifiDriver = this.a;
        if (wifiDriver != null) {
            return wifiDriver.getisAlwaysReadInputStream();
        }
        return true;
    }

    @Override // com.rt.printerlibrary.connect.PrinterInterface
    public byte[] readMsg() {
        WifiDriver wifiDriver = this.a;
        if (wifiDriver != null) {
            return wifiDriver.readMsg();
        }
        return null;
    }

    @Override // com.rt.printerlibrary.connect.PrinterInterface
    public void setAlwaysReadInputStream(boolean z) {
        WifiDriver wifiDriver = this.a;
        if (wifiDriver != null) {
            wifiDriver.setAlwaysReadInputStream(z);
        }
    }

    @Override // com.rt.printerlibrary.connect.PrinterInterface
    public void setPrintListener(PrintListener printListener) {
        WifiDriver wifiDriver = this.a;
        if (wifiDriver != null) {
            wifiDriver.setPrintListener(printListener);
        }
    }

    @Override // com.rt.printerlibrary.connect.PrinterInterface
    public void writeMsg(byte[] bArr) {
        WifiDriver wifiDriver = this.a;
        if (wifiDriver != null) {
            wifiDriver.write(bArr);
        }
    }

    @Override // com.rt.printerlibrary.connect.PrinterInterface
    public void writeMsgAsync(byte[] bArr) {
        WifiDriver wifiDriver = this.a;
        if (wifiDriver != null) {
            wifiDriver.writeASync(bArr);
        }
    }
}
