package com.google.zxing.qrcode.detector;

import com.google.zxing.DecodeHintType;
import com.google.zxing.NotFoundException;
import com.google.zxing.ResultPoint;
import com.google.zxing.ResultPointCallback;
import com.google.zxing.common.BitMatrix;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

/* JADX INFO: loaded from: classes11.dex */
public class FinderPatternFinder {
    private static final int CENTER_QUORUM = 2;
    protected static final int MAX_MODULES = 97;
    protected static final int MIN_SKIP = 3;
    private final int[] crossCheckStateCount;
    private boolean hasSkipped;
    private final BitMatrix image;
    private final List<FinderPattern> possibleCenters;
    private final ResultPointCallback resultPointCallback;

    public FinderPatternFinder(BitMatrix image) {
        this(image, null);
    }

    public FinderPatternFinder(BitMatrix image, ResultPointCallback resultPointCallback) {
        this.image = image;
        this.possibleCenters = new ArrayList();
        this.crossCheckStateCount = new int[5];
        this.resultPointCallback = resultPointCallback;
    }

    protected final BitMatrix getImage() {
        return this.image;
    }

    protected final List<FinderPattern> getPossibleCenters() {
        return this.possibleCenters;
    }

    final FinderPatternInfo find(Map<DecodeHintType, ?> map) throws NotFoundException {
        boolean z = map != null && map.containsKey(DecodeHintType.TRY_HARDER);
        int height = this.image.getHeight();
        int width = this.image.getWidth();
        int i = (height * 3) / 388;
        if (i < 3 || z) {
            i = 3;
        }
        int[] iArr = new int[5];
        int i2 = i - 1;
        boolean zHaveMultiplyConfirmedCenters = false;
        while (i2 < height && !zHaveMultiplyConfirmedCenters) {
            clearCounts(iArr);
            int i3 = 0;
            int i4 = 0;
            while (i3 < width) {
                if (this.image.get(i3, i2)) {
                    if ((i4 & 1) == 1) {
                        i4++;
                    }
                    iArr[i4] = iArr[i4] + 1;
                } else if ((i4 & 1) == 0) {
                    if (i4 == 4) {
                        if (foundPatternCross(iArr)) {
                            if (handlePossibleCenter(iArr, i2, i3)) {
                                if (this.hasSkipped) {
                                    zHaveMultiplyConfirmedCenters = haveMultiplyConfirmedCenters();
                                } else {
                                    int iFindRowSkip = findRowSkip();
                                    int i5 = iArr[2];
                                    if (iFindRowSkip > i5) {
                                        i2 += (iFindRowSkip - i5) - 2;
                                        i3 = width - 1;
                                    }
                                }
                                clearCounts(iArr);
                                i = 2;
                                i4 = 0;
                            } else {
                                shiftCounts2(iArr);
                                i4 = 3;
                            }
                        } else {
                            shiftCounts2(iArr);
                            i4 = 3;
                        }
                    } else {
                        i4++;
                        iArr[i4] = iArr[i4] + 1;
                    }
                } else {
                    iArr[i4] = iArr[i4] + 1;
                }
                i3++;
            }
            if (foundPatternCross(iArr) && handlePossibleCenter(iArr, i2, width)) {
                i = iArr[0];
                if (this.hasSkipped) {
                    zHaveMultiplyConfirmedCenters = haveMultiplyConfirmedCenters();
                }
            }
            i2 += i;
        }
        FinderPattern[] finderPatternArrSelectBestPatterns = selectBestPatterns();
        ResultPoint.orderBestPatterns(finderPatternArrSelectBestPatterns);
        return new FinderPatternInfo(finderPatternArrSelectBestPatterns);
    }

    private static float centerFromEnd(int[] stateCount, int end) {
        return ((end - stateCount[4]) - stateCount[3]) - (stateCount[2] / 2.0f);
    }

    protected static boolean foundPatternCross(int[] iArr) {
        int i = 0;
        for (int i2 = 0; i2 < 5; i2++) {
            int i3 = iArr[i2];
            if (i3 == 0) {
                return false;
            }
            i += i3;
        }
        if (i < 7) {
            return false;
        }
        float f = i / 7.0f;
        float f2 = f / 2.0f;
        return Math.abs(f - ((float) iArr[0])) < f2 && Math.abs(f - ((float) iArr[1])) < f2 && Math.abs((f * 3.0f) - ((float) iArr[2])) < 3.0f * f2 && Math.abs(f - ((float) iArr[3])) < f2 && Math.abs(f - ((float) iArr[4])) < f2;
    }

    protected static boolean foundPatternDiagonal(int[] iArr) {
        int i = 0;
        for (int i2 = 0; i2 < 5; i2++) {
            int i3 = iArr[i2];
            if (i3 == 0) {
                return false;
            }
            i += i3;
        }
        if (i < 7) {
            return false;
        }
        float f = i / 7.0f;
        float f2 = f / 1.333f;
        return Math.abs(f - ((float) iArr[0])) < f2 && Math.abs(f - ((float) iArr[1])) < f2 && Math.abs((f * 3.0f) - ((float) iArr[2])) < 3.0f * f2 && Math.abs(f - ((float) iArr[3])) < f2 && Math.abs(f - ((float) iArr[4])) < f2;
    }

    private int[] getCrossCheckStateCount() {
        clearCounts(this.crossCheckStateCount);
        return this.crossCheckStateCount;
    }

    protected final void clearCounts(int[] counts) {
        for (int x = 0; x < counts.length; x++) {
            counts[x] = 0;
        }
    }

    protected final void shiftCounts2(int[] stateCount) {
        stateCount[0] = stateCount[2];
        stateCount[1] = stateCount[3];
        stateCount[2] = stateCount[4];
        stateCount[3] = 1;
        stateCount[4] = 0;
    }

    private boolean crossCheckDiagonal(int centerI, int centerJ) {
        int[] stateCount = getCrossCheckStateCount();
        int i = 0;
        while (centerI >= i && centerJ >= i && this.image.get(centerJ - i, centerI - i)) {
            stateCount[2] = stateCount[2] + 1;
            i++;
        }
        if (stateCount[2] == 0) {
            return false;
        }
        while (centerI >= i && centerJ >= i && !this.image.get(centerJ - i, centerI - i)) {
            stateCount[1] = stateCount[1] + 1;
            i++;
        }
        if (stateCount[1] == 0) {
            return false;
        }
        while (centerI >= i && centerJ >= i && this.image.get(centerJ - i, centerI - i)) {
            stateCount[0] = stateCount[0] + 1;
            i++;
        }
        if (stateCount[0] == 0) {
            return false;
        }
        int maxI = this.image.getHeight();
        int maxJ = this.image.getWidth();
        int i2 = 1;
        while (centerI + i2 < maxI && centerJ + i2 < maxJ && this.image.get(centerJ + i2, centerI + i2)) {
            stateCount[2] = stateCount[2] + 1;
            i2++;
        }
        while (centerI + i2 < maxI && centerJ + i2 < maxJ && !this.image.get(centerJ + i2, centerI + i2)) {
            stateCount[3] = stateCount[3] + 1;
            i2++;
        }
        if (stateCount[3] == 0) {
            return false;
        }
        while (centerI + i2 < maxI && centerJ + i2 < maxJ && this.image.get(centerJ + i2, centerI + i2)) {
            stateCount[4] = stateCount[4] + 1;
            i2++;
        }
        if (stateCount[4] == 0) {
            return false;
        }
        return foundPatternDiagonal(stateCount);
    }

    private float crossCheckVertical(int startI, int centerJ, int maxCount, int originalStateCountTotal) {
        BitMatrix image = this.image;
        int maxI = image.getHeight();
        int[] stateCount = getCrossCheckStateCount();
        int i = startI;
        while (i >= 0 && image.get(centerJ, i)) {
            stateCount[2] = stateCount[2] + 1;
            i--;
        }
        if (i < 0) {
            return Float.NaN;
        }
        while (i >= 0 && !image.get(centerJ, i) && stateCount[1] <= maxCount) {
            stateCount[1] = stateCount[1] + 1;
            i--;
        }
        if (i >= 0 && stateCount[1] <= maxCount) {
            while (i >= 0 && image.get(centerJ, i) && stateCount[0] <= maxCount) {
                stateCount[0] = stateCount[0] + 1;
                i--;
            }
            if (stateCount[0] > maxCount) {
                return Float.NaN;
            }
            int i2 = startI + 1;
            while (i2 < maxI && image.get(centerJ, i2)) {
                stateCount[2] = stateCount[2] + 1;
                i2++;
            }
            if (i2 != maxI) {
                while (i2 < maxI && !image.get(centerJ, i2) && stateCount[3] < maxCount) {
                    stateCount[3] = stateCount[3] + 1;
                    i2++;
                }
                if (i2 != maxI && stateCount[3] < maxCount) {
                    while (i2 < maxI && image.get(centerJ, i2) && stateCount[4] < maxCount) {
                        stateCount[4] = stateCount[4] + 1;
                        i2++;
                    }
                    if (stateCount[4] >= maxCount) {
                        return Float.NaN;
                    }
                    int stateCountTotal = stateCount[0] + stateCount[1] + stateCount[2] + stateCount[3] + stateCount[4];
                    if (Math.abs(stateCountTotal - originalStateCountTotal) * 5 < originalStateCountTotal * 2 && foundPatternCross(stateCount)) {
                        return centerFromEnd(stateCount, i2);
                    }
                    return Float.NaN;
                }
                return Float.NaN;
            }
            return Float.NaN;
        }
        return Float.NaN;
    }

    private float crossCheckHorizontal(int startJ, int centerI, int maxCount, int originalStateCountTotal) {
        BitMatrix image = this.image;
        int maxJ = image.getWidth();
        int[] stateCount = getCrossCheckStateCount();
        int j = startJ;
        while (j >= 0 && image.get(j, centerI)) {
            stateCount[2] = stateCount[2] + 1;
            j--;
        }
        if (j < 0) {
            return Float.NaN;
        }
        while (j >= 0 && !image.get(j, centerI) && stateCount[1] <= maxCount) {
            stateCount[1] = stateCount[1] + 1;
            j--;
        }
        if (j >= 0 && stateCount[1] <= maxCount) {
            while (j >= 0 && image.get(j, centerI) && stateCount[0] <= maxCount) {
                stateCount[0] = stateCount[0] + 1;
                j--;
            }
            if (stateCount[0] > maxCount) {
                return Float.NaN;
            }
            int j2 = startJ + 1;
            while (j2 < maxJ && image.get(j2, centerI)) {
                stateCount[2] = stateCount[2] + 1;
                j2++;
            }
            if (j2 != maxJ) {
                while (j2 < maxJ && !image.get(j2, centerI) && stateCount[3] < maxCount) {
                    stateCount[3] = stateCount[3] + 1;
                    j2++;
                }
                if (j2 != maxJ && stateCount[3] < maxCount) {
                    while (j2 < maxJ && image.get(j2, centerI) && stateCount[4] < maxCount) {
                        stateCount[4] = stateCount[4] + 1;
                        j2++;
                    }
                    if (stateCount[4] >= maxCount) {
                        return Float.NaN;
                    }
                    int stateCountTotal = stateCount[0] + stateCount[1] + stateCount[2] + stateCount[3] + stateCount[4];
                    if (Math.abs(stateCountTotal - originalStateCountTotal) * 5 < originalStateCountTotal && foundPatternCross(stateCount)) {
                        return centerFromEnd(stateCount, j2);
                    }
                    return Float.NaN;
                }
                return Float.NaN;
            }
            return Float.NaN;
        }
        return Float.NaN;
    }

    @Deprecated
    protected final boolean handlePossibleCenter(int[] stateCount, int i, int j, boolean pureBarcode) {
        return handlePossibleCenter(stateCount, i, j);
    }

    protected final boolean handlePossibleCenter(int[] stateCount, int i, int j) {
        int stateCountTotal = stateCount[0] + stateCount[1] + stateCount[2] + stateCount[3] + stateCount[4];
        float centerJ = centerFromEnd(stateCount, j);
        float centerI = crossCheckVertical(i, (int) centerJ, stateCount[2], stateCountTotal);
        if (!Float.isNaN(centerI)) {
            float centerJ2 = crossCheckHorizontal((int) centerJ, (int) centerI, stateCount[2], stateCountTotal);
            if (!Float.isNaN(centerJ2) && crossCheckDiagonal((int) centerI, (int) centerJ2)) {
                float estimatedModuleSize = stateCountTotal / 7.0f;
                boolean found = false;
                int index = 0;
                while (true) {
                    if (index >= this.possibleCenters.size()) {
                        break;
                    }
                    FinderPattern center = this.possibleCenters.get(index);
                    if (center.aboutEquals(estimatedModuleSize, centerI, centerJ2)) {
                        this.possibleCenters.set(index, center.combineEstimate(centerI, centerJ2, estimatedModuleSize));
                        found = true;
                        break;
                    }
                    index++;
                }
                if (!found) {
                    FinderPattern point = new FinderPattern(centerJ2, centerI, estimatedModuleSize);
                    this.possibleCenters.add(point);
                    ResultPointCallback resultPointCallback = this.resultPointCallback;
                    if (resultPointCallback != null) {
                        resultPointCallback.foundPossibleResultPoint(point);
                    }
                }
                return true;
            }
        }
        return false;
    }

    private int findRowSkip() {
        if (this.possibleCenters.size() <= 1) {
            return 0;
        }
        ResultPoint firstConfirmedCenter = null;
        for (FinderPattern center : this.possibleCenters) {
            if (center.getCount() >= 2) {
                if (firstConfirmedCenter == null) {
                    firstConfirmedCenter = center;
                } else {
                    this.hasSkipped = true;
                    return ((int) (Math.abs(firstConfirmedCenter.getX() - center.getX()) - Math.abs(firstConfirmedCenter.getY() - center.getY()))) / 2;
                }
            }
        }
        return 0;
    }

    private boolean haveMultiplyConfirmedCenters() {
        int size = this.possibleCenters.size();
        float fAbs = 0.0f;
        int i = 0;
        float estimatedModuleSize = 0.0f;
        for (FinderPattern finderPattern : this.possibleCenters) {
            if (finderPattern.getCount() >= 2) {
                i++;
                estimatedModuleSize += finderPattern.getEstimatedModuleSize();
            }
        }
        if (i < 3) {
            return false;
        }
        float f = estimatedModuleSize / size;
        Iterator<FinderPattern> it = this.possibleCenters.iterator();
        while (it.hasNext()) {
            fAbs += Math.abs(it.next().getEstimatedModuleSize() - f);
        }
        return fAbs <= estimatedModuleSize * 0.05f;
    }

    private FinderPattern[] selectBestPatterns() throws NotFoundException {
        int size = this.possibleCenters.size();
        if (size < 3) {
            throw NotFoundException.getNotFoundInstance();
        }
        float estimatedModuleSize = 0.0f;
        if (size > 3) {
            Iterator<FinderPattern> it = this.possibleCenters.iterator();
            float f = 0.0f;
            float f2 = 0.0f;
            while (it.hasNext()) {
                float estimatedModuleSize2 = it.next().getEstimatedModuleSize();
                f += estimatedModuleSize2;
                f2 += estimatedModuleSize2 * estimatedModuleSize2;
            }
            float f3 = f / size;
            float fSqrt = (float) Math.sqrt((f2 / r0) - (f3 * f3));
            Collections.sort(this.possibleCenters, new FurthestFromAverageComparator(f3));
            float fMax = Math.max(0.2f * f3, fSqrt);
            int i = 0;
            while (i < this.possibleCenters.size() && this.possibleCenters.size() > 3) {
                if (Math.abs(this.possibleCenters.get(i).getEstimatedModuleSize() - f3) > fMax) {
                    this.possibleCenters.remove(i);
                    i--;
                }
                i++;
            }
        }
        if (this.possibleCenters.size() > 3) {
            Iterator<FinderPattern> it2 = this.possibleCenters.iterator();
            while (it2.hasNext()) {
                estimatedModuleSize += it2.next().getEstimatedModuleSize();
            }
            Collections.sort(this.possibleCenters, new CenterComparator(estimatedModuleSize / this.possibleCenters.size()));
            List<FinderPattern> list = this.possibleCenters;
            list.subList(3, list.size()).clear();
        }
        return new FinderPattern[]{this.possibleCenters.get(0), this.possibleCenters.get(1), this.possibleCenters.get(2)};
    }

    private static final class FurthestFromAverageComparator implements Serializable, Comparator<FinderPattern> {
        private final float average;

        private FurthestFromAverageComparator(float f) {
            this.average = f;
        }

        @Override // java.util.Comparator
        public int compare(FinderPattern center1, FinderPattern center2) {
            return Float.compare(Math.abs(center2.getEstimatedModuleSize() - this.average), Math.abs(center1.getEstimatedModuleSize() - this.average));
        }
    }

    private static final class CenterComparator implements Serializable, Comparator<FinderPattern> {
        private final float average;

        private CenterComparator(float f) {
            this.average = f;
        }

        @Override // java.util.Comparator
        public int compare(FinderPattern center1, FinderPattern center2) {
            int countCompare = Integer.compare(center2.getCount(), center1.getCount());
            if (countCompare != 0) {
                return countCompare;
            }
            return Float.compare(Math.abs(center1.getEstimatedModuleSize() - this.average), Math.abs(center2.getEstimatedModuleSize() - this.average));
        }
    }
}
