package com.google.zxing.datamatrix.detector;

import com.google.zxing.NotFoundException;
import com.google.zxing.ResultPoint;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.common.DetectorResult;
import com.google.zxing.common.GridSampler;
import com.google.zxing.common.detector.MathUtils;
import com.google.zxing.common.detector.WhiteRectangleDetector;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.Map;

/* JADX INFO: loaded from: classes11.dex */
public final class Detector {
    private final BitMatrix image;
    private final WhiteRectangleDetector rectangleDetector;

    public Detector(BitMatrix image) throws NotFoundException {
        this.image = image;
        this.rectangleDetector = new WhiteRectangleDetector(image);
    }

    public DetectorResult detect() throws NotFoundException {
        ResultPoint resultPoint;
        ResultPoint resultPoint2;
        int i;
        int i2;
        BitMatrix bitMatrixSampleGrid;
        int i3;
        ResultPoint[] resultPointArrDetect = this.rectangleDetector.detect();
        ResultPoint resultPoint3 = resultPointArrDetect[0];
        ResultPoint resultPoint4 = resultPointArrDetect[1];
        ResultPoint resultPoint5 = resultPointArrDetect[2];
        ResultPoint resultPoint6 = resultPointArrDetect[3];
        ArrayList arrayList = new ArrayList(4);
        arrayList.add(transitionsBetween(resultPoint3, resultPoint4));
        arrayList.add(transitionsBetween(resultPoint3, resultPoint5));
        arrayList.add(transitionsBetween(resultPoint4, resultPoint6));
        arrayList.add(transitionsBetween(resultPoint5, resultPoint6));
        ResultPoint resultPoint7 = null;
        Collections.sort(arrayList, new ResultPointsAndTransitionsComparator());
        ResultPointsAndTransitions resultPointsAndTransitions = (ResultPointsAndTransitions) arrayList.get(0);
        ResultPointsAndTransitions resultPointsAndTransitions2 = (ResultPointsAndTransitions) arrayList.get(1);
        HashMap map = new HashMap();
        increment(map, resultPointsAndTransitions.getFrom());
        increment(map, resultPointsAndTransitions.getTo());
        increment(map, resultPointsAndTransitions2.getFrom());
        increment(map, resultPointsAndTransitions2.getTo());
        ResultPoint resultPoint8 = null;
        ResultPoint resultPoint9 = null;
        for (Map.Entry entry : map.entrySet()) {
            ResultPoint resultPoint10 = (ResultPoint) entry.getKey();
            if (((Integer) entry.getValue()).intValue() == 2) {
                resultPoint8 = resultPoint10;
            } else if (resultPoint7 == null) {
                resultPoint7 = resultPoint10;
            } else {
                resultPoint9 = resultPoint10;
            }
        }
        if (resultPoint7 == null || resultPoint8 == null || resultPoint9 == null) {
            throw NotFoundException.getNotFoundInstance();
        }
        ResultPoint[] resultPointArr = {resultPoint7, resultPoint8, resultPoint9};
        ResultPoint.orderBestPatterns(resultPointArr);
        ResultPoint resultPoint11 = resultPointArr[0];
        ResultPoint resultPoint12 = resultPointArr[1];
        ResultPoint resultPoint13 = resultPointArr[2];
        if (!map.containsKey(resultPoint3)) {
            resultPoint = resultPoint3;
        } else if (!map.containsKey(resultPoint4)) {
            resultPoint = resultPoint4;
        } else if (!map.containsKey(resultPoint5)) {
            resultPoint = resultPoint5;
        } else {
            resultPoint = resultPoint6;
        }
        int transitions = transitionsBetween(resultPoint13, resultPoint).getTransitions();
        int transitions2 = transitionsBetween(resultPoint11, resultPoint).getTransitions();
        if ((transitions & 1) == 1) {
            transitions++;
        }
        int i4 = transitions + 2;
        if ((transitions2 & 1) == 1) {
            transitions2++;
        }
        int i5 = transitions2 + 2;
        if (i4 * 4 >= i5 * 7 || i5 * 4 >= i4 * 7) {
            resultPoint2 = resultPoint13;
            ResultPoint resultPointCorrectTopRightRectangular = correctTopRightRectangular(resultPoint12, resultPoint11, resultPoint13, resultPoint, i4, i5);
            if (resultPointCorrectTopRightRectangular != null) {
                resultPoint = resultPointCorrectTopRightRectangular;
            }
            int transitions3 = transitionsBetween(resultPoint2, resultPoint).getTransitions();
            int transitions4 = transitionsBetween(resultPoint11, resultPoint).getTransitions();
            if ((transitions3 & 1) != 1) {
                i = transitions3;
            } else {
                i = transitions3 + 1;
            }
            if ((transitions4 & 1) != 1) {
                i2 = transitions4;
            } else {
                i2 = transitions4 + 1;
            }
            bitMatrixSampleGrid = sampleGrid(this.image, resultPoint2, resultPoint12, resultPoint11, resultPoint, i, i2);
        } else {
            ResultPoint resultPointCorrectTopRight = correctTopRight(resultPoint12, resultPoint11, resultPoint13, resultPoint, Math.min(i5, i4));
            if (resultPointCorrectTopRight != null) {
                resultPoint = resultPointCorrectTopRight;
            }
            int iMax = Math.max(transitionsBetween(resultPoint13, resultPoint).getTransitions(), transitionsBetween(resultPoint11, resultPoint).getTransitions()) + 1;
            if ((iMax & 1) != 1) {
                i3 = iMax;
            } else {
                i3 = iMax + 1;
            }
            bitMatrixSampleGrid = sampleGrid(this.image, resultPoint13, resultPoint12, resultPoint11, resultPoint, i3, i3);
            resultPoint2 = resultPoint13;
        }
        return new DetectorResult(bitMatrixSampleGrid, new ResultPoint[]{resultPoint2, resultPoint12, resultPoint11, resultPoint});
    }

    private ResultPoint correctTopRightRectangular(ResultPoint bottomLeft, ResultPoint bottomRight, ResultPoint topLeft, ResultPoint topRight, int dimensionTop, int dimensionRight) {
        float corr = distance(bottomLeft, bottomRight) / dimensionTop;
        int norm = distance(topLeft, topRight);
        float cos = (topRight.getX() - topLeft.getX()) / norm;
        float sin = (topRight.getY() - topLeft.getY()) / norm;
        ResultPoint c1 = new ResultPoint(topRight.getX() + (corr * cos), topRight.getY() + (corr * sin));
        float corr2 = distance(bottomLeft, topLeft) / dimensionRight;
        int norm2 = distance(bottomRight, topRight);
        float cos2 = (topRight.getX() - bottomRight.getX()) / norm2;
        float cos3 = topRight.getY();
        float sin2 = (cos3 - bottomRight.getY()) / norm2;
        ResultPoint c2 = new ResultPoint(topRight.getX() + (corr2 * cos2), topRight.getY() + (corr2 * sin2));
        if (!isValid(c1)) {
            if (isValid(c2)) {
                return c2;
            }
            return null;
        }
        if (!isValid(c2)) {
            return c1;
        }
        int l1 = Math.abs(dimensionTop - transitionsBetween(topLeft, c1).getTransitions()) + Math.abs(dimensionRight - transitionsBetween(bottomRight, c1).getTransitions());
        int l2 = Math.abs(dimensionTop - transitionsBetween(topLeft, c2).getTransitions()) + Math.abs(dimensionRight - transitionsBetween(bottomRight, c2).getTransitions());
        if (l1 <= l2) {
            return c1;
        }
        return c2;
    }

    private ResultPoint correctTopRight(ResultPoint bottomLeft, ResultPoint bottomRight, ResultPoint topLeft, ResultPoint topRight, int dimension) {
        float corr = distance(bottomLeft, bottomRight) / dimension;
        int norm = distance(topLeft, topRight);
        float cos = (topRight.getX() - topLeft.getX()) / norm;
        float sin = (topRight.getY() - topLeft.getY()) / norm;
        ResultPoint c1 = new ResultPoint(topRight.getX() + (corr * cos), topRight.getY() + (corr * sin));
        float corr2 = distance(bottomLeft, topLeft) / dimension;
        int norm2 = distance(bottomRight, topRight);
        float cos2 = (topRight.getX() - bottomRight.getX()) / norm2;
        float cos3 = topRight.getY();
        float sin2 = (cos3 - bottomRight.getY()) / norm2;
        ResultPoint c2 = new ResultPoint(topRight.getX() + (corr2 * cos2), topRight.getY() + (corr2 * sin2));
        if (!isValid(c1)) {
            if (isValid(c2)) {
                return c2;
            }
            return null;
        }
        if (!isValid(c2)) {
            return c1;
        }
        int l1 = Math.abs(transitionsBetween(topLeft, c1).getTransitions() - transitionsBetween(bottomRight, c1).getTransitions());
        int l2 = Math.abs(transitionsBetween(topLeft, c2).getTransitions() - transitionsBetween(bottomRight, c2).getTransitions());
        return l1 <= l2 ? c1 : c2;
    }

    private boolean isValid(ResultPoint p) {
        return p.getX() >= 0.0f && p.getX() < ((float) this.image.getWidth()) && p.getY() > 0.0f && p.getY() < ((float) this.image.getHeight());
    }

    private static int distance(ResultPoint a, ResultPoint b) {
        return MathUtils.round(ResultPoint.distance(a, b));
    }

    private static void increment(Map<ResultPoint, Integer> table, ResultPoint key) {
        Integer value = table.get(key);
        table.put(key, Integer.valueOf(value != null ? 1 + value.intValue() : 1));
    }

    private static BitMatrix sampleGrid(BitMatrix image, ResultPoint topLeft, ResultPoint bottomLeft, ResultPoint bottomRight, ResultPoint topRight, int dimensionX, int dimensionY) throws NotFoundException {
        return GridSampler.getInstance().sampleGrid(image, dimensionX, dimensionY, 0.5f, 0.5f, dimensionX - 0.5f, 0.5f, dimensionX - 0.5f, dimensionY - 0.5f, 0.5f, dimensionY - 0.5f, topLeft.getX(), topLeft.getY(), topRight.getX(), topRight.getY(), bottomRight.getX(), bottomRight.getY(), bottomLeft.getX(), bottomLeft.getY());
    }

    private ResultPointsAndTransitions transitionsBetween(ResultPoint from, ResultPoint to) {
        Detector detector = this;
        int fromX = (int) from.getX();
        int fromY = (int) from.getY();
        int toX = (int) to.getX();
        int y = (int) to.getY();
        boolean isBlack = false;
        int toY = y;
        boolean z = Math.abs(y - fromY) > Math.abs(toX - fromX);
        boolean steep = z;
        if (z) {
            fromX = fromY;
            fromY = fromX;
            toX = toY;
            toY = toX;
        }
        int temp = toX - fromX;
        int dx = Math.abs(temp);
        int dy = Math.abs(toY - fromY);
        int error = (-dx) / 2;
        int ystep = fromY < toY ? 1 : -1;
        int xstep = fromX >= toX ? -1 : 1;
        int transitions = 0;
        boolean inBlack = detector.image.get(steep ? fromY : fromX, steep ? fromX : fromY);
        int x = fromX;
        int y2 = fromY;
        while (x != toX) {
            int fromX2 = fromX;
            int fromY2 = fromY;
            boolean z2 = detector.image.get(steep ? y2 : x, steep ? x : y2);
            isBlack = z2;
            if (z2 != inBlack) {
                transitions++;
                inBlack = isBlack;
            }
            int i = error + dy;
            error = i;
            if (i > 0) {
                if (y2 == toY) {
                    break;
                }
                y2 += ystep;
                error -= dx;
            }
            x += xstep;
            detector = this;
            fromX = fromX2;
            fromY = fromY2;
        }
        return new ResultPointsAndTransitions(from, to, transitions);
    }

    private static final class ResultPointsAndTransitions {
        private final ResultPoint from;
        private final ResultPoint to;
        private final int transitions;

        private ResultPointsAndTransitions(ResultPoint from, ResultPoint to, int transitions) {
            this.from = from;
            this.to = to;
            this.transitions = transitions;
        }

        ResultPoint getFrom() {
            return this.from;
        }

        ResultPoint getTo() {
            return this.to;
        }

        int getTransitions() {
            return this.transitions;
        }

        public String toString() {
            return this.from + "/" + this.to + '/' + this.transitions;
        }
    }

    private static final class ResultPointsAndTransitionsComparator implements Serializable, Comparator<ResultPointsAndTransitions> {
        private ResultPointsAndTransitionsComparator() {
        }

        @Override // java.util.Comparator
        public int compare(ResultPointsAndTransitions o1, ResultPointsAndTransitions o2) {
            return o1.getTransitions() - o2.getTransitions();
        }
    }
}
