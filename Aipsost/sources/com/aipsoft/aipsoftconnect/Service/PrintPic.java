package com.aipsoft.aipsoftconnect.Service;

import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Paint;
import androidx.core.view.ViewCompat;

/* JADX INFO: loaded from: classes6.dex */
public class PrintPic {
    private static PrintPic instance = new PrintPic();
    public int width;
    public Canvas canvas = null;
    public Paint paint = null;
    public Bitmap bm = null;
    public float length = 0.0f;
    public byte[] bitbuf = null;

    private PrintPic() {
    }

    public static PrintPic getInstance() {
        return instance;
    }

    public int getLength() {
        return ((int) this.length) + 20;
    }

    public void init(Bitmap bitmap) {
        if (bitmap != null) {
            initCanvas(bitmap.getWidth());
        }
        if (this.paint == null) {
            initPaint();
        }
        if (bitmap != null) {
            drawImage(0.0f, 0.0f, bitmap);
        }
    }

    public void initCanvas(int w) {
        int h = w * 10;
        this.bm = Bitmap.createBitmap(w, h, Bitmap.Config.RGB_565);
        Canvas canvas = new Canvas(this.bm);
        this.canvas = canvas;
        canvas.drawColor(-1);
        this.width = w;
        this.bitbuf = new byte[w / 8];
    }

    public void initPaint() {
        Paint paint = new Paint();
        this.paint = paint;
        paint.setAntiAlias(true);
        this.paint.setColor(ViewCompat.MEASURED_STATE_MASK);
        this.paint.setStyle(Paint.Style.STROKE);
    }

    public void drawImage(float x, float y, Bitmap btm) {
        try {
            try {
                this.canvas.drawBitmap(btm, x, y, (Paint) null);
                if (this.length < btm.getHeight() + y) {
                    this.length = btm.getHeight() + y;
                }
                if (btm == null) {
                    return;
                }
            } catch (Exception e) {
                e.printStackTrace();
                if (btm == null) {
                    return;
                }
            }
            btm.recycle();
        } catch (Throwable th) {
            if (btm != null) {
                btm.recycle();
            }
            throw th;
        }
    }

    public byte[] printDraw() {
        int p0;
        int p1;
        int p2;
        int p3;
        int p4;
        int p5;
        int p6;
        int p7;
        int i = 0;
        Bitmap nbm = Bitmap.createBitmap(this.bm, 0, 0, this.width, getLength());
        byte[] imgbuf = new byte[((this.width / 8) * getLength()) + 8];
        imgbuf[0] = PrinterCommands.GS;
        imgbuf[1] = 118;
        imgbuf[2] = 48;
        imgbuf[3] = 0;
        imgbuf[4] = (byte) (this.width / 8);
        imgbuf[5] = 0;
        imgbuf[6] = (byte) (getLength() % 256);
        imgbuf[7] = (byte) (getLength() / 256);
        int s = 7;
        int i2 = 0;
        while (i2 < getLength()) {
            int k = 0;
            while (k < this.width / 8) {
                int c0 = nbm.getPixel((k * 8) + i, i2);
                if (c0 == -1) {
                    p0 = 0;
                } else {
                    p0 = 1;
                }
                int c1 = nbm.getPixel((k * 8) + 1, i2);
                if (c1 == -1) {
                    p1 = 0;
                } else {
                    p1 = 1;
                }
                int c2 = nbm.getPixel((k * 8) + 2, i2);
                if (c2 == -1) {
                    p2 = 0;
                } else {
                    p2 = 1;
                }
                int c3 = nbm.getPixel((k * 8) + 3, i2);
                if (c3 == -1) {
                    p3 = 0;
                } else {
                    p3 = 1;
                }
                int c4 = nbm.getPixel((k * 8) + 4, i2);
                if (c4 == -1) {
                    p4 = 0;
                } else {
                    p4 = 1;
                }
                int c5 = nbm.getPixel((k * 8) + 5, i2);
                if (c5 == -1) {
                    p5 = 0;
                } else {
                    p5 = 1;
                }
                int c6 = nbm.getPixel((k * 8) + 6, i2);
                if (c6 == -1) {
                    p6 = 0;
                } else {
                    p6 = 1;
                }
                int c7 = nbm.getPixel((k * 8) + 7, i2);
                if (c7 == -1) {
                    p7 = 0;
                } else {
                    p7 = 1;
                }
                Bitmap nbm2 = nbm;
                int value = (p0 * 128) + (p1 * 64) + (p2 * 32) + (p3 * 16) + (p4 * 8) + (p5 * 4) + (p6 * 2) + p7;
                this.bitbuf[k] = (byte) value;
                k++;
                nbm = nbm2;
                s = s;
                i = 0;
            }
            Bitmap nbm3 = nbm;
            for (int t = 0; t < this.width / 8; t++) {
                s++;
                imgbuf[s] = this.bitbuf[t];
            }
            i2++;
            nbm = nbm3;
            i = 0;
        }
        Bitmap nbm4 = this.bm;
        if (nbm4 != null) {
            nbm4.recycle();
            this.bm = null;
        }
        return imgbuf;
    }
}
