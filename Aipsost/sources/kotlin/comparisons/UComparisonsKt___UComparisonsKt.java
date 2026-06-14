package kotlin.comparisons;

import androidx.constraintlayout.widget.ConstraintLayout;
import kotlin.Metadata;
import kotlin.UByte;
import kotlin.UByteArray;
import kotlin.UIntArray;
import kotlin.ULongArray;
import kotlin.UShort;
import kotlin.UShortArray;
import kotlin.jvm.internal.Intrinsics;

/* JADX INFO: Access modifiers changed from: package-private */
/* JADX INFO: compiled from: _UComparisons.kt */
/* JADX INFO: loaded from: classes11.dex */
@Metadata(d1 = {"\u0000B\n\u0000\n\u0002\u0018\u0002\n\u0002\b\b\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0002\b\u0004\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0002\b\u0004\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0002\b\u0004\n\u0002\u0018\u0002\n\u0002\b\u0010\u001a\"\u0010\u0000\u001a\u00020\u00012\u0006\u0010\u0002\u001a\u00020\u00012\u0006\u0010\u0003\u001a\u00020\u0001H\u0007ø\u0001\u0000¢\u0006\u0004\b\u0004\u0010\u0005\u001a+\u0010\u0000\u001a\u00020\u00012\u0006\u0010\u0002\u001a\u00020\u00012\u0006\u0010\u0003\u001a\u00020\u00012\u0006\u0010\u0006\u001a\u00020\u0001H\u0087\bø\u0001\u0000¢\u0006\u0004\b\u0007\u0010\b\u001a&\u0010\u0000\u001a\u00020\u00012\u0006\u0010\u0002\u001a\u00020\u00012\n\u0010\t\u001a\u00020\n\"\u00020\u0001H\u0007ø\u0001\u0000¢\u0006\u0004\b\u000b\u0010\f\u001a\"\u0010\u0000\u001a\u00020\r2\u0006\u0010\u0002\u001a\u00020\r2\u0006\u0010\u0003\u001a\u00020\rH\u0007ø\u0001\u0000¢\u0006\u0004\b\u000e\u0010\u000f\u001a+\u0010\u0000\u001a\u00020\r2\u0006\u0010\u0002\u001a\u00020\r2\u0006\u0010\u0003\u001a\u00020\r2\u0006\u0010\u0006\u001a\u00020\rH\u0087\bø\u0001\u0000¢\u0006\u0004\b\u0010\u0010\u0011\u001a&\u0010\u0000\u001a\u00020\r2\u0006\u0010\u0002\u001a\u00020\r2\n\u0010\t\u001a\u00020\u0012\"\u00020\rH\u0007ø\u0001\u0000¢\u0006\u0004\b\u0013\u0010\u0014\u001a\"\u0010\u0000\u001a\u00020\u00152\u0006\u0010\u0002\u001a\u00020\u00152\u0006\u0010\u0003\u001a\u00020\u0015H\u0007ø\u0001\u0000¢\u0006\u0004\b\u0016\u0010\u0017\u001a+\u0010\u0000\u001a\u00020\u00152\u0006\u0010\u0002\u001a\u00020\u00152\u0006\u0010\u0003\u001a\u00020\u00152\u0006\u0010\u0006\u001a\u00020\u0015H\u0087\bø\u0001\u0000¢\u0006\u0004\b\u0018\u0010\u0019\u001a&\u0010\u0000\u001a\u00020\u00152\u0006\u0010\u0002\u001a\u00020\u00152\n\u0010\t\u001a\u00020\u001a\"\u00020\u0015H\u0007ø\u0001\u0000¢\u0006\u0004\b\u001b\u0010\u001c\u001a\"\u0010\u0000\u001a\u00020\u001d2\u0006\u0010\u0002\u001a\u00020\u001d2\u0006\u0010\u0003\u001a\u00020\u001dH\u0007ø\u0001\u0000¢\u0006\u0004\b\u001e\u0010\u001f\u001a+\u0010\u0000\u001a\u00020\u001d2\u0006\u0010\u0002\u001a\u00020\u001d2\u0006\u0010\u0003\u001a\u00020\u001d2\u0006\u0010\u0006\u001a\u00020\u001dH\u0087\bø\u0001\u0000¢\u0006\u0004\b \u0010!\u001a&\u0010\u0000\u001a\u00020\u001d2\u0006\u0010\u0002\u001a\u00020\u001d2\n\u0010\t\u001a\u00020\"\"\u00020\u001dH\u0007ø\u0001\u0000¢\u0006\u0004\b#\u0010$\u001a\"\u0010%\u001a\u00020\u00012\u0006\u0010\u0002\u001a\u00020\u00012\u0006\u0010\u0003\u001a\u00020\u0001H\u0007ø\u0001\u0000¢\u0006\u0004\b&\u0010\u0005\u001a+\u0010%\u001a\u00020\u00012\u0006\u0010\u0002\u001a\u00020\u00012\u0006\u0010\u0003\u001a\u00020\u00012\u0006\u0010\u0006\u001a\u00020\u0001H\u0087\bø\u0001\u0000¢\u0006\u0004\b'\u0010\b\u001a&\u0010%\u001a\u00020\u00012\u0006\u0010\u0002\u001a\u00020\u00012\n\u0010\t\u001a\u00020\n\"\u00020\u0001H\u0007ø\u0001\u0000¢\u0006\u0004\b(\u0010\f\u001a\"\u0010%\u001a\u00020\r2\u0006\u0010\u0002\u001a\u00020\r2\u0006\u0010\u0003\u001a\u00020\rH\u0007ø\u0001\u0000¢\u0006\u0004\b)\u0010\u000f\u001a+\u0010%\u001a\u00020\r2\u0006\u0010\u0002\u001a\u00020\r2\u0006\u0010\u0003\u001a\u00020\r2\u0006\u0010\u0006\u001a\u00020\rH\u0087\bø\u0001\u0000¢\u0006\u0004\b*\u0010\u0011\u001a&\u0010%\u001a\u00020\r2\u0006\u0010\u0002\u001a\u00020\r2\n\u0010\t\u001a\u00020\u0012\"\u00020\rH\u0007ø\u0001\u0000¢\u0006\u0004\b+\u0010\u0014\u001a\"\u0010%\u001a\u00020\u00152\u0006\u0010\u0002\u001a\u00020\u00152\u0006\u0010\u0003\u001a\u00020\u0015H\u0007ø\u0001\u0000¢\u0006\u0004\b,\u0010\u0017\u001a+\u0010%\u001a\u00020\u00152\u0006\u0010\u0002\u001a\u00020\u00152\u0006\u0010\u0003\u001a\u00020\u00152\u0006\u0010\u0006\u001a\u00020\u0015H\u0087\bø\u0001\u0000¢\u0006\u0004\b-\u0010\u0019\u001a&\u0010%\u001a\u00020\u00152\u0006\u0010\u0002\u001a\u00020\u00152\n\u0010\t\u001a\u00020\u001a\"\u00020\u0015H\u0007ø\u0001\u0000¢\u0006\u0004\b.\u0010\u001c\u001a\"\u0010%\u001a\u00020\u001d2\u0006\u0010\u0002\u001a\u00020\u001d2\u0006\u0010\u0003\u001a\u00020\u001dH\u0007ø\u0001\u0000¢\u0006\u0004\b/\u0010\u001f\u001a+\u0010%\u001a\u00020\u001d2\u0006\u0010\u0002\u001a\u00020\u001d2\u0006\u0010\u0003\u001a\u00020\u001d2\u0006\u0010\u0006\u001a\u00020\u001dH\u0087\bø\u0001\u0000¢\u0006\u0004\b0\u0010!\u001a&\u0010%\u001a\u00020\u001d2\u0006\u0010\u0002\u001a\u00020\u001d2\n\u0010\t\u001a\u00020\"\"\u00020\u001dH\u0007ø\u0001\u0000¢\u0006\u0004\b1\u0010$\u0082\u0002\u0004\n\u0002\b\u0019¨\u00062"}, d2 = {"maxOf", "Lkotlin/UByte;", "a", "b", "maxOf-Kr8caGY", "(BB)B", "c", "maxOf-b33U2AM", "(BBB)B", "other", "Lkotlin/UByteArray;", "maxOf-Wr6uiD8", "(B[B)B", "Lkotlin/UInt;", "maxOf-J1ME1BU", "(II)I", "maxOf-WZ9TVnA", "(III)I", "Lkotlin/UIntArray;", "maxOf-Md2H83M", "(I[I)I", "Lkotlin/ULong;", "maxOf-eb3DHEI", "(JJ)J", "maxOf-sambcqE", "(JJJ)J", "Lkotlin/ULongArray;", "maxOf-R03FKyM", "(J[J)J", "Lkotlin/UShort;", "maxOf-5PvTz6A", "(SS)S", "maxOf-VKSA0NQ", "(SSS)S", "Lkotlin/UShortArray;", "maxOf-t1qELG4", "(S[S)S", "minOf", "minOf-Kr8caGY", "minOf-b33U2AM", "minOf-Wr6uiD8", "minOf-J1ME1BU", "minOf-WZ9TVnA", "minOf-Md2H83M", "minOf-eb3DHEI", "minOf-sambcqE", "minOf-R03FKyM", "minOf-5PvTz6A", "minOf-VKSA0NQ", "minOf-t1qELG4", "kotlin-stdlib"}, k = 5, mv = {1, 9, 0}, xi = ConstraintLayout.LayoutParams.Table.LAYOUT_EDITOR_ABSOLUTEX, xs = "kotlin/comparisons/UComparisonsKt")
public class UComparisonsKt___UComparisonsKt {
    /* JADX INFO: renamed from: maxOf-J1ME1BU, reason: not valid java name */
    public static final int m1299maxOfJ1ME1BU(int a, int b) {
        return Integer.compare(a ^ Integer.MIN_VALUE, b ^ Integer.MIN_VALUE) >= 0 ? a : b;
    }

    /* JADX INFO: renamed from: maxOf-eb3DHEI, reason: not valid java name */
    public static final long m1307maxOfeb3DHEI(long a, long b) {
        return Long.compare(a ^ Long.MIN_VALUE, b ^ Long.MIN_VALUE) >= 0 ? a : b;
    }

    /* JADX INFO: renamed from: maxOf-Kr8caGY, reason: not valid java name */
    public static final byte m1300maxOfKr8caGY(byte a, byte b) {
        return Intrinsics.compare(a & UByte.MAX_VALUE, b & UByte.MAX_VALUE) >= 0 ? a : b;
    }

    /* JADX INFO: renamed from: maxOf-5PvTz6A, reason: not valid java name */
    public static final short m1298maxOf5PvTz6A(short a, short b) {
        return Intrinsics.compare(a & UShort.MAX_VALUE, 65535 & b) >= 0 ? a : b;
    }

    /* JADX INFO: renamed from: maxOf-WZ9TVnA, reason: not valid java name */
    private static final int m1304maxOfWZ9TVnA(int a, int b, int c) {
        return UComparisonsKt.m1299maxOfJ1ME1BU(a, UComparisonsKt.m1299maxOfJ1ME1BU(b, c));
    }

    /* JADX INFO: renamed from: maxOf-sambcqE, reason: not valid java name */
    private static final long m1308maxOfsambcqE(long a, long b, long c) {
        return UComparisonsKt.m1307maxOfeb3DHEI(a, UComparisonsKt.m1307maxOfeb3DHEI(b, c));
    }

    /* JADX INFO: renamed from: maxOf-b33U2AM, reason: not valid java name */
    private static final byte m1306maxOfb33U2AM(byte a, byte b, byte c) {
        return UComparisonsKt.m1300maxOfKr8caGY(a, UComparisonsKt.m1300maxOfKr8caGY(b, c));
    }

    /* JADX INFO: renamed from: maxOf-VKSA0NQ, reason: not valid java name */
    private static final short m1303maxOfVKSA0NQ(short a, short b, short c) {
        return UComparisonsKt.m1298maxOf5PvTz6A(a, UComparisonsKt.m1298maxOf5PvTz6A(b, c));
    }

    /* JADX INFO: renamed from: maxOf-Md2H83M, reason: not valid java name */
    public static final int m1301maxOfMd2H83M(int a, int... other) {
        Intrinsics.checkNotNullParameter(other, "other");
        int max = a;
        int iM273getSizeimpl = UIntArray.m273getSizeimpl(other);
        for (int i = 0; i < iM273getSizeimpl; i++) {
            int e = UIntArray.m272getpVg5ArA(other, i);
            max = UComparisonsKt.m1299maxOfJ1ME1BU(max, e);
        }
        return max;
    }

    /* JADX INFO: renamed from: maxOf-R03FKyM, reason: not valid java name */
    public static final long m1302maxOfR03FKyM(long a, long... other) {
        Intrinsics.checkNotNullParameter(other, "other");
        long max = a;
        int iM352getSizeimpl = ULongArray.m352getSizeimpl(other);
        for (int i = 0; i < iM352getSizeimpl; i++) {
            long e = ULongArray.m351getsVKNKU(other, i);
            max = UComparisonsKt.m1307maxOfeb3DHEI(max, e);
        }
        return max;
    }

    /* JADX INFO: renamed from: maxOf-Wr6uiD8, reason: not valid java name */
    public static final byte m1305maxOfWr6uiD8(byte a, byte... other) {
        Intrinsics.checkNotNullParameter(other, "other");
        byte max = a;
        int iM194getSizeimpl = UByteArray.m194getSizeimpl(other);
        for (int i = 0; i < iM194getSizeimpl; i++) {
            byte e = UByteArray.m193getw2LRezQ(other, i);
            max = UComparisonsKt.m1300maxOfKr8caGY(max, e);
        }
        return max;
    }

    /* JADX INFO: renamed from: maxOf-t1qELG4, reason: not valid java name */
    public static final short m1309maxOft1qELG4(short a, short... other) {
        Intrinsics.checkNotNullParameter(other, "other");
        short max = a;
        int iM457getSizeimpl = UShortArray.m457getSizeimpl(other);
        for (int i = 0; i < iM457getSizeimpl; i++) {
            short e = UShortArray.m456getMh2AYeg(other, i);
            max = UComparisonsKt.m1298maxOf5PvTz6A(max, e);
        }
        return max;
    }

    /* JADX INFO: renamed from: minOf-J1ME1BU, reason: not valid java name */
    public static final int m1311minOfJ1ME1BU(int a, int b) {
        return Integer.compare(a ^ Integer.MIN_VALUE, b ^ Integer.MIN_VALUE) <= 0 ? a : b;
    }

    /* JADX INFO: renamed from: minOf-eb3DHEI, reason: not valid java name */
    public static final long m1319minOfeb3DHEI(long a, long b) {
        return Long.compare(a ^ Long.MIN_VALUE, b ^ Long.MIN_VALUE) <= 0 ? a : b;
    }

    /* JADX INFO: renamed from: minOf-Kr8caGY, reason: not valid java name */
    public static final byte m1312minOfKr8caGY(byte a, byte b) {
        return Intrinsics.compare(a & UByte.MAX_VALUE, b & UByte.MAX_VALUE) <= 0 ? a : b;
    }

    /* JADX INFO: renamed from: minOf-5PvTz6A, reason: not valid java name */
    public static final short m1310minOf5PvTz6A(short a, short b) {
        return Intrinsics.compare(a & UShort.MAX_VALUE, 65535 & b) <= 0 ? a : b;
    }

    /* JADX INFO: renamed from: minOf-WZ9TVnA, reason: not valid java name */
    private static final int m1316minOfWZ9TVnA(int a, int b, int c) {
        return UComparisonsKt.m1311minOfJ1ME1BU(a, UComparisonsKt.m1311minOfJ1ME1BU(b, c));
    }

    /* JADX INFO: renamed from: minOf-sambcqE, reason: not valid java name */
    private static final long m1320minOfsambcqE(long a, long b, long c) {
        return UComparisonsKt.m1319minOfeb3DHEI(a, UComparisonsKt.m1319minOfeb3DHEI(b, c));
    }

    /* JADX INFO: renamed from: minOf-b33U2AM, reason: not valid java name */
    private static final byte m1318minOfb33U2AM(byte a, byte b, byte c) {
        return UComparisonsKt.m1312minOfKr8caGY(a, UComparisonsKt.m1312minOfKr8caGY(b, c));
    }

    /* JADX INFO: renamed from: minOf-VKSA0NQ, reason: not valid java name */
    private static final short m1315minOfVKSA0NQ(short a, short b, short c) {
        return UComparisonsKt.m1310minOf5PvTz6A(a, UComparisonsKt.m1310minOf5PvTz6A(b, c));
    }

    /* JADX INFO: renamed from: minOf-Md2H83M, reason: not valid java name */
    public static final int m1313minOfMd2H83M(int a, int... other) {
        Intrinsics.checkNotNullParameter(other, "other");
        int min = a;
        int iM273getSizeimpl = UIntArray.m273getSizeimpl(other);
        for (int i = 0; i < iM273getSizeimpl; i++) {
            int e = UIntArray.m272getpVg5ArA(other, i);
            min = UComparisonsKt.m1311minOfJ1ME1BU(min, e);
        }
        return min;
    }

    /* JADX INFO: renamed from: minOf-R03FKyM, reason: not valid java name */
    public static final long m1314minOfR03FKyM(long a, long... other) {
        Intrinsics.checkNotNullParameter(other, "other");
        long min = a;
        int iM352getSizeimpl = ULongArray.m352getSizeimpl(other);
        for (int i = 0; i < iM352getSizeimpl; i++) {
            long e = ULongArray.m351getsVKNKU(other, i);
            min = UComparisonsKt.m1319minOfeb3DHEI(min, e);
        }
        return min;
    }

    /* JADX INFO: renamed from: minOf-Wr6uiD8, reason: not valid java name */
    public static final byte m1317minOfWr6uiD8(byte a, byte... other) {
        Intrinsics.checkNotNullParameter(other, "other");
        byte min = a;
        int iM194getSizeimpl = UByteArray.m194getSizeimpl(other);
        for (int i = 0; i < iM194getSizeimpl; i++) {
            byte e = UByteArray.m193getw2LRezQ(other, i);
            min = UComparisonsKt.m1312minOfKr8caGY(min, e);
        }
        return min;
    }

    /* JADX INFO: renamed from: minOf-t1qELG4, reason: not valid java name */
    public static final short m1321minOft1qELG4(short a, short... other) {
        Intrinsics.checkNotNullParameter(other, "other");
        short min = a;
        int iM457getSizeimpl = UShortArray.m457getSizeimpl(other);
        for (int i = 0; i < iM457getSizeimpl; i++) {
            short e = UShortArray.m456getMh2AYeg(other, i);
            min = UComparisonsKt.m1310minOf5PvTz6A(min, e);
        }
        return min;
    }
}
