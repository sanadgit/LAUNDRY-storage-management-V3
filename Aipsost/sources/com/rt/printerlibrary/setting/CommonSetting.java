package com.rt.printerlibrary.setting;

import com.rt.printerlibrary.bean.LableSizeBean;
import com.rt.printerlibrary.enumerate.PageLengthEnum;
import com.rt.printerlibrary.enumerate.PinLineSpaceEnum;
import com.rt.printerlibrary.enumerate.PrintDirection;
import com.rt.printerlibrary.enumerate.SpeedEnum;

/* JADX INFO: loaded from: classes11.dex */
public class CommonSetting {
    private LableSizeBean lableSizeBean;
    private int pageWidth;
    private PrintDirection printDirection;
    private int absolutionPositionN = -1;
    private int pageHigh = -1;
    private int unitType = -1;
    private PageLengthEnum pageLengthEnum = PageLengthEnum.NO_SETTING;
    private SpeedEnum speedEnum = SpeedEnum.SPEED_NOT_SET;
    private int blackMarkSwitch = -1;
    private PinLineSpaceEnum pinLineSpaceEnum = null;
    private int nLineSpace = 1;
    private int escLineSpacing = 30;
    private int labelGap = 2;
    private int align = -1;

    public int getAbsolutionPositionN() {
        return this.absolutionPositionN;
    }

    public int getAlign() {
        return this.align;
    }

    public int getBlackMarkSwitch() {
        return this.blackMarkSwitch;
    }

    public int getEscLineSpacing() {
        if (this.escLineSpacing < 0) {
            this.escLineSpacing = 0;
        }
        if (this.escLineSpacing > 255) {
            this.escLineSpacing = 255;
        }
        return this.escLineSpacing;
    }

    public int getLabelGap() {
        return this.labelGap;
    }

    public LableSizeBean getLableSizeBean() {
        return this.lableSizeBean;
    }

    public int getPageHigh() {
        return this.pageHigh;
    }

    public PageLengthEnum getPageLengthEnum() {
        return this.pageLengthEnum;
    }

    public int getPageWidth() {
        return this.pageWidth;
    }

    public PinLineSpaceEnum getPinLineSpaceEnum() {
        return this.pinLineSpaceEnum;
    }

    public PrintDirection getPrintDirection() {
        return this.printDirection;
    }

    public SpeedEnum getSpeedEnum() {
        return this.speedEnum;
    }

    public int getUnitType() {
        return this.unitType;
    }

    public int getnLineSpace() {
        return this.nLineSpace;
    }

    public void setAbsolutionPositionN(int i) {
        this.absolutionPositionN = i;
    }

    public void setAlign(int i) {
        this.align = i;
    }

    public void setBlackMarkSwitch(int i) {
        this.blackMarkSwitch = i;
    }

    public void setEscLineSpacing(int i) {
        this.escLineSpacing = i;
    }

    public void setLabelGap(int i) {
        this.labelGap = i;
    }

    public void setLableSizeBean(LableSizeBean lableSizeBean) {
        this.lableSizeBean = lableSizeBean;
    }

    @Deprecated
    public void setPageHigh(int i, int i2) {
        this.pageHigh = i;
        this.unitType = i2;
    }

    public void setPageLengthEnum(PageLengthEnum pageLengthEnum) {
        this.pageLengthEnum = pageLengthEnum;
    }

    public void setPageWidth(int i) {
        this.pageWidth = i;
    }

    public void setPinLineSpaceEnum(PinLineSpaceEnum pinLineSpaceEnum, int i) {
        this.pinLineSpaceEnum = pinLineSpaceEnum;
        if (i < 1) {
            i = 1;
        }
        setnLineSpace(i);
    }

    public void setPrintDirection(PrintDirection printDirection) {
        this.printDirection = printDirection;
    }

    public void setSpeedEnum(SpeedEnum speedEnum) {
        this.speedEnum = speedEnum;
    }

    public void setnLineSpace(int i) {
        this.nLineSpace = i;
    }
}
