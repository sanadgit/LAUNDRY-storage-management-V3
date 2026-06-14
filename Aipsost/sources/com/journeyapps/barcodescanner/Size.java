package com.journeyapps.barcodescanner;

/* JADX INFO: loaded from: classes11.dex */
public class Size implements Comparable<Size> {
    public final int height;
    public final int width;

    public Size(int width, int height) {
        this.width = width;
        this.height = height;
    }

    public Size rotate() {
        return new Size(this.height, this.width);
    }

    public Size scale(int n, int d) {
        return new Size((this.width * n) / d, (this.height * n) / d);
    }

    public Size scaleFit(Size into) {
        int i = this.width;
        int i2 = into.height;
        int i3 = i * i2;
        int i4 = into.width;
        int i5 = this.height;
        if (i3 >= i4 * i5) {
            return new Size(i4, (i5 * i4) / i);
        }
        return new Size((i * i2) / i5, i2);
    }

    public Size scaleCrop(Size into) {
        int i = this.width;
        int i2 = into.height;
        int i3 = i * i2;
        int i4 = into.width;
        int i5 = this.height;
        if (i3 <= i4 * i5) {
            return new Size(i4, (i5 * i4) / i);
        }
        return new Size((i * i2) / i5, i2);
    }

    public boolean fitsIn(Size other) {
        return this.width <= other.width && this.height <= other.height;
    }

    @Override // java.lang.Comparable
    public int compareTo(Size other) {
        int aPixels = this.height * this.width;
        int bPixels = other.height * other.width;
        if (bPixels < aPixels) {
            return 1;
        }
        if (bPixels > aPixels) {
            return -1;
        }
        return 0;
    }

    public String toString() {
        return this.width + "x" + this.height;
    }

    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        Size size = (Size) o;
        return this.width == size.width && this.height == size.height;
    }

    public int hashCode() {
        int result = this.width;
        return (result * 31) + this.height;
    }
}
