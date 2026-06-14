package com.rt.printerlibrary.connect;

import com.rt.printerlibrary.bean.BluetoothEdrConfigBean;
import com.rt.printerlibrary.driver.bluetooth.EdrDriver;
import com.rt.printerlibrary.enumerate.ConnectStateEnum;
import com.rt.printerlibrary.utils.PrintListener;

/* JADX INFO: loaded from: classes11.dex */
public class BluetoothInterface extends PrinterInterface {
    private EdrDriver a;

    @Override // com.rt.printerlibrary.connect.PrinterInterface
    public void connect(Object obj) throws Exception {
        System.out.println("com.rt.printerlibrary.connect.BluetoothInterface.connect:" + obj.toString());
        if (!(obj instanceof BluetoothEdrConfigBean)) {
            throw new Exception("Method com.rt.printerlibrary.connect.BluetoothInterface.connect's param must be BluetoothEdrConfigBean");
        }
        BluetoothEdrConfigBean bluetoothEdrConfigBean = (BluetoothEdrConfigBean) obj;
        EdrDriver edrDriver = this.a;
        if (edrDriver == null) {
            this.a = new EdrDriver(bluetoothEdrConfigBean);
        } else {
            edrDriver.interrupt();
        }
        this.a.start();
        this.a.setPrinterInterface(this);
    }

    @Override // com.rt.printerlibrary.connect.PrinterInterface
    public void disConnect() {
        EdrDriver edrDriver = this.a;
        if (edrDriver != null) {
            edrDriver.close();
        }
    }

    @Override // com.rt.printerlibrary.connect.PrinterInterface
    public ConnectStateEnum getConnectState() {
        EdrDriver edrDriver = this.a;
        this.curState = edrDriver == null ? ConnectStateEnum.NoConnect : edrDriver.getConnectState();
        return this.curState;
    }

    @Override // com.rt.printerlibrary.connect.PrinterInterface
    public boolean getIsPrinting() {
        return this.a.getIsPrinting();
    }

    @Override // com.rt.printerlibrary.connect.PrinterInterface
    public boolean getisAlwaysReadInputStream() {
        EdrDriver edrDriver = this.a;
        if (edrDriver != null) {
            return edrDriver.getisAlwaysReadInputStream();
        }
        return true;
    }

    @Override // com.rt.printerlibrary.connect.PrinterInterface
    public byte[] readMsg() {
        EdrDriver edrDriver = this.a;
        if (edrDriver != null) {
            return edrDriver.readMsg();
        }
        return null;
    }

    @Override // com.rt.printerlibrary.connect.PrinterInterface
    public void setAlwaysReadInputStream(boolean z) {
        EdrDriver edrDriver = this.a;
        if (edrDriver != null) {
            edrDriver.setAlwaysReadInputStream(z);
        }
    }

    @Override // com.rt.printerlibrary.connect.PrinterInterface
    public void setPrintListener(PrintListener printListener) {
        EdrDriver edrDriver = this.a;
        if (edrDriver != null) {
            edrDriver.setPrintListener(printListener);
        }
    }

    @Override // com.rt.printerlibrary.connect.PrinterInterface
    public void writeMsg(byte[] bArr) {
        EdrDriver edrDriver = this.a;
        if (edrDriver != null) {
            edrDriver.write(bArr);
        }
    }

    @Override // com.rt.printerlibrary.connect.PrinterInterface
    public void writeMsgAsync(byte[] bArr) {
        EdrDriver edrDriver = this.a;
        if (edrDriver != null) {
            edrDriver.writeASync(bArr);
        }
    }
}
