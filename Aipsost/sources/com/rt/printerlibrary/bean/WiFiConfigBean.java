package com.rt.printerlibrary.bean;

/* JADX INFO: loaded from: classes11.dex */
public class WiFiConfigBean {
    public String ip;
    public int port;

    public WiFiConfigBean(String str, int i) {
        this.ip = str;
        this.port = i;
    }

    public String toString() {
        return this.ip + ":" + this.port + " ";
    }
}
