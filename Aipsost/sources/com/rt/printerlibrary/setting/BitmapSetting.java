package com.rt.printerlibrary.setting;

import com.rt.printerlibrary.bean.BitmapLimitSizeBean;
import com.rt.printerlibrary.bean.Position;
import com.rt.printerlibrary.enumerate.BmpPrintMode;

/* JADX INFO: loaded from: classes11.dex */
public class BitmapSetting {
    private int bimtapLimitWidth;

    @Deprecated
    private BitmapLimitSizeBean bitmapLimitSizeBean;
    private BmpPrintMode bmpPrintMode = BmpPrintMode.MODE_MULTI_COLOR;
    private Position printPostion;

    public int getBimtapLimitWidth() {
        return this.bimtapLimitWidth;
    }

    public BitmapLimitSizeBean getBitmapLimitSizeBean() {
        return this.bitmapLimitSizeBean;
    }

    public BmpPrintMode getBmpPrintMode() {
        return this.bmpPrintMode;
    }

    public Position getPrintPostion() {
        return this.printPostion;
    }

    public void setBimtapLimitWidth(int i) {
        this.bimtapLimitWidth = i;
    }

    @Deprecated
    public void setBitmapLimitSizeBean(BitmapLimitSizeBean bitmapLimitSizeBean) {
        this.bitmapLimitSizeBean = bitmapLimitSizeBean;
        if (bitmapLimitSizeBean == null || bitmapLimitSizeBean.limitWidth == 0) {
            return;
        }
        setBimtapLimitWidth(bitmapLimitSizeBean.limitWidth);
    }

    public void setBmpPrintMode(BmpPrintMode bmpPrintMode) {
        this.bmpPrintMode = bmpPrintMode;
    }

    public void setPrintPostion(Position position) {
        this.printPostion = position;
    }
}
