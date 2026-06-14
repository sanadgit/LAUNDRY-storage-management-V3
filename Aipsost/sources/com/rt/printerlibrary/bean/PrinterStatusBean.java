package com.rt.printerlibrary.bean;

import com.rt.printerlibrary.utils.PrintStatusCmd;

/* JADX INFO: loaded from: classes11.dex */
public class PrinterStatusBean {
    public PrintStatusCmd printStatusCmd = PrintStatusCmd.cmd_UnKnow;
    public boolean blMoveMentErr = false;
    public boolean blPaperJammed = false;
    public boolean blNoPaper = false;
    public boolean blLowPower = false;
    public boolean blPrinterPause = false;
    public boolean blPrinting = false;
    public boolean blLidOpened = false;
    public boolean blOverHeated = false;
    public boolean blPrintReady = false;
    public boolean blPrintSucc = false;
}
