package com.aipsoft.aipsoftconnect.model;

import com.google.gson.annotations.SerializedName;
import java.io.Serializable;
import java.util.List;

/* JADX INFO: loaded from: classes3.dex */
public class PrintData implements Serializable {

    @SerializedName("Align")
    private String align;

    @SerializedName("Font")
    private String font;

    @SerializedName("Next")
    private String next;

    @SerializedName("Style")
    private List<String> style;

    @SerializedName("Text")
    private boolean text;

    @SerializedName("Value")
    private String value;

    public PrintData(boolean text, String font, List<String> style, String align, String value, String next) {
        this.text = text;
        this.font = font;
        this.style = style;
        this.align = align;
        this.value = value;
        this.next = next;
    }

    public boolean isText() {
        return this.text;
    }

    public void setText(boolean text) {
        this.text = text;
    }

    public String getFont() {
        return this.font;
    }

    public void setFont(String font) {
        this.font = font;
    }

    public List<String> getStyle() {
        return this.style;
    }

    public void setStyle(List<String> style) {
        this.style = style;
    }

    public String getAlign() {
        return this.align;
    }

    public void setAlign(String align) {
        this.align = align;
    }

    public String getValue() {
        return this.value;
    }

    public void setValue(String value) {
        this.value = value;
    }

    public String getNext() {
        return this.next;
    }

    public void setNext(String next) {
        this.next = next;
    }
}
