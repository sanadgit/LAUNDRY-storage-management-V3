package com.rt.printerlibrary.bean;

/* JADX INFO: loaded from: classes11.dex */
public class LableSizeBean {
    private int labelHeightInMM;
    private int labelWidthInMM;

    public LableSizeBean(int i, int i2) {
        this.labelWidthInMM = i;
        this.labelHeightInMM = i2;
    }

    public int getLabelHeightInMM() {
        return this.labelHeightInMM;
    }

    public int getLabelWidthInMM() {
        return this.labelWidthInMM;
    }

    public void setLabelHeightInMM(int i) {
        this.labelHeightInMM = i;
    }

    public void setLabelWidthInMM(int i) {
        this.labelWidthInMM = i;
    }
}
