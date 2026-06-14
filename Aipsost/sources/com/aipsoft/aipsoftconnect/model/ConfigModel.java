package com.aipsoft.aipsoftconnect.model;

import com.google.gson.annotations.SerializedName;
import java.io.Serializable;

/* JADX INFO: loaded from: classes3.dex */
public class ConfigModel implements Serializable {

    @SerializedName("CashDrawer")
    private boolean cashDrawer;

    @SerializedName("Cut")
    private boolean cut;

    @SerializedName("NoOfCopy")
    private int noOfCopy;

    @SerializedName("Sound")
    private int sound;

    public ConfigModel(int noOfCopy, int sound, boolean cut, boolean cashDrawer) {
        this.noOfCopy = noOfCopy;
        this.sound = sound;
        this.cut = cut;
        this.cashDrawer = cashDrawer;
    }

    public int getNoOfCopy() {
        return this.noOfCopy;
    }

    public void setNoOfCopy(int noOfCopy) {
        this.noOfCopy = noOfCopy;
    }

    public int getSound() {
        return this.sound;
    }

    public void setSound(int sound) {
        this.sound = sound;
    }

    public boolean isCut() {
        return this.cut;
    }

    public void setCut(boolean cut) {
        this.cut = cut;
    }

    public boolean isCashDrawer() {
        return this.cashDrawer;
    }

    public void setCashDrawer(boolean cashDrawer) {
        this.cashDrawer = cashDrawer;
    }
}
