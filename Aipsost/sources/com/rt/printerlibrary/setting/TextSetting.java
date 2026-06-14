package com.rt.printerlibrary.setting;

import com.rt.printerlibrary.bean.Position;
import com.rt.printerlibrary.enumerate.CpclFontTypeEnum;
import com.rt.printerlibrary.enumerate.ESCFontTypeEnum;
import com.rt.printerlibrary.enumerate.PrintRotation;
import com.rt.printerlibrary.enumerate.SettingEnum;
import com.rt.printerlibrary.enumerate.TscFontTypeEnum;
import com.rt.printerlibrary.enumerate.ZplFontTypeEnum;

/* JADX INFO: loaded from: classes11.dex */
public class TextSetting {
    private CpclFontTypeEnum cpclFontTypeEnum;
    private ESCFontTypeEnum escFontType;
    private TscFontTypeEnum tscFontTypeEnum;
    private Position txtPrintPosition;
    private ZplFontTypeEnum zplFontTypeEnum;
    private SettingEnum bold = SettingEnum.NoSetting;
    private SettingEnum italic = SettingEnum.NoSetting;
    private SettingEnum underline = SettingEnum.NoSetting;
    private SettingEnum doublePrinting = SettingEnum.NoSetting;
    private int align = -1;
    private SettingEnum doubleWidth = SettingEnum.NoSetting;
    private SettingEnum doubleHeight = SettingEnum.NoSetting;
    private int fontStyle = -1;
    private int pinPrintMode = -1;
    private SettingEnum doubleSizeChineseCharctor = SettingEnum.NoSetting;
    private SettingEnum isAntiWhite = SettingEnum.NoSetting;
    private SettingEnum isEscSmallCharactor = SettingEnum.NoSetting;
    private PrintRotation printRotation = PrintRotation.Rotate0;
    private int cpclFontSize = 0;
    private int zplWidthFactor = 10;
    private int zplHeightFactor = 10;
    private int cpclTextSpacing = -1;
    private int xMultiplication = 1;
    private int yMultiplication = 1;

    public int getAlign() {
        return this.align;
    }

    public SettingEnum getBold() {
        return this.bold;
    }

    public int getCpclFontSize() {
        return this.cpclFontSize;
    }

    public CpclFontTypeEnum getCpclFontTypeEnum() {
        return this.cpclFontTypeEnum;
    }

    public int getCpclTextSpacing() {
        return this.cpclTextSpacing;
    }

    public SettingEnum getDoubleHeight() {
        return this.doubleHeight;
    }

    public SettingEnum getDoublePrinting() {
        return this.doublePrinting;
    }

    public SettingEnum getDoubleSizeChineseCharctor() {
        return this.doubleSizeChineseCharctor;
    }

    public SettingEnum getDoubleWidth() {
        return this.doubleWidth;
    }

    public ESCFontTypeEnum getEscFontType() {
        return this.escFontType;
    }

    public int getFontStyle() {
        return this.fontStyle;
    }

    public SettingEnum getIsAntiWhite() {
        return this.isAntiWhite;
    }

    public SettingEnum getIsEscSmallCharactor() {
        return this.isEscSmallCharactor;
    }

    public SettingEnum getItalic() {
        return this.italic;
    }

    public int getPinPrintMode() {
        return this.pinPrintMode;
    }

    public PrintRotation getPrintRotation() {
        return this.printRotation;
    }

    public TscFontTypeEnum getTscFontTypeEnum() {
        return this.tscFontTypeEnum;
    }

    public Position getTxtPrintPosition() {
        return this.txtPrintPosition;
    }

    public SettingEnum getUnderline() {
        return this.underline;
    }

    public ZplFontTypeEnum getZplFontTypeEnum() {
        return this.zplFontTypeEnum;
    }

    public int getZplHeightFactor() {
        return this.zplHeightFactor;
    }

    public int getZplWidthFactor() {
        return this.zplWidthFactor;
    }

    public int getxMultiplication() {
        return this.xMultiplication;
    }

    public int getyMultiplication() {
        return this.yMultiplication;
    }

    public void setAlign(int i) {
        this.align = i;
    }

    public void setBold(SettingEnum settingEnum) {
        this.bold = settingEnum;
    }

    public void setCpclFontSize(int i) {
        this.cpclFontSize = i;
    }

    public void setCpclFontTypeEnum(CpclFontTypeEnum cpclFontTypeEnum) {
        this.cpclFontTypeEnum = cpclFontTypeEnum;
    }

    public void setCpclTextSpacing(int i) {
        this.cpclTextSpacing = i;
    }

    public void setDoubleHeight(SettingEnum settingEnum) {
        this.doubleHeight = settingEnum;
    }

    public void setDoublePrinting(SettingEnum settingEnum) {
        this.doublePrinting = settingEnum;
    }

    @Deprecated
    public void setDoubleSizeChineseCharctor(SettingEnum settingEnum) {
        this.doubleSizeChineseCharctor = settingEnum;
    }

    public void setDoubleWidth(SettingEnum settingEnum) {
        this.doubleWidth = settingEnum;
    }

    public void setEscFontType(ESCFontTypeEnum eSCFontTypeEnum) {
        this.escFontType = eSCFontTypeEnum;
    }

    public void setFontStyle(int i) {
        this.fontStyle = i;
    }

    public void setIsAntiWhite(SettingEnum settingEnum) {
        this.isAntiWhite = settingEnum;
    }

    public void setIsEscSmallCharactor(SettingEnum settingEnum) {
        this.isEscSmallCharactor = settingEnum;
    }

    public void setItalic(SettingEnum settingEnum) {
        this.italic = settingEnum;
    }

    public void setPinPrintMode(int i) {
        this.pinPrintMode = i;
    }

    public void setPrintRotation(PrintRotation printRotation) {
        this.printRotation = printRotation;
    }

    public void setTscFontTypeEnum(TscFontTypeEnum tscFontTypeEnum) {
        this.tscFontTypeEnum = tscFontTypeEnum;
    }

    public void setTxtPrintPosition(Position position) {
        this.txtPrintPosition = position;
    }

    public void setUnderline(SettingEnum settingEnum) {
        this.underline = settingEnum;
    }

    public void setZplFontTypeEnum(ZplFontTypeEnum zplFontTypeEnum) {
        this.zplFontTypeEnum = zplFontTypeEnum;
    }

    public void setZplHeightFactor(int i) {
        this.zplHeightFactor = i;
    }

    public void setZplWidthFactor(int i) {
        this.zplWidthFactor = i;
    }

    public void setxMultiplication(int i) {
        this.xMultiplication = i;
    }

    public void setyMultiplication(int i) {
        this.yMultiplication = i;
    }
}
