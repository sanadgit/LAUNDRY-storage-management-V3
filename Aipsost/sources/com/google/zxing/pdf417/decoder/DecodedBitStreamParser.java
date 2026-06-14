package com.google.zxing.pdf417.decoder;

import androidx.constraintlayout.widget.ConstraintLayout;
import com.google.zxing.FormatException;
import com.google.zxing.common.CharacterSetECI;
import com.google.zxing.common.DecoderResult;
import com.google.zxing.pdf417.PDF417ResultMetadata;
import java.io.ByteArrayOutputStream;
import java.math.BigInteger;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;

/* JADX INFO: loaded from: classes11.dex */
final class DecodedBitStreamParser {
    private static final int AL = 28;
    private static final int AS = 27;
    private static final int BEGIN_MACRO_PDF417_CONTROL_BLOCK = 928;
    private static final int BEGIN_MACRO_PDF417_OPTIONAL_FIELD = 923;
    private static final int BYTE_COMPACTION_MODE_LATCH = 901;
    private static final int BYTE_COMPACTION_MODE_LATCH_6 = 924;
    private static final int ECI_CHARSET = 927;
    private static final int ECI_GENERAL_PURPOSE = 926;
    private static final int ECI_USER_DEFINED = 925;
    private static final BigInteger[] EXP900;
    private static final int LL = 27;
    private static final int MACRO_PDF417_TERMINATOR = 922;
    private static final int MAX_NUMERIC_CODEWORDS = 15;
    private static final int ML = 28;
    private static final int MODE_SHIFT_TO_BYTE_COMPACTION_MODE = 913;
    private static final int NUMBER_OF_SEQUENCE_CODEWORDS = 2;
    private static final int NUMERIC_COMPACTION_MODE_LATCH = 902;
    private static final int PAL = 29;
    private static final int PL = 25;
    private static final int PS = 29;
    private static final int TEXT_COMPACTION_MODE_LATCH = 900;
    private static final char[] PUNCT_CHARS = ";<>@[\\]_`~!\r\t,:\n-.$/\"|*()?{}'".toCharArray();
    private static final char[] MIXED_CHARS = "0123456789&\r\t,:#-.$/+%*=^".toCharArray();

    private enum Mode {
        ALPHA,
        LOWER,
        MIXED,
        PUNCT,
        ALPHA_SHIFT,
        PUNCT_SHIFT
    }

    static {
        BigInteger[] bigIntegerArr = new BigInteger[16];
        EXP900 = bigIntegerArr;
        bigIntegerArr[0] = BigInteger.ONE;
        BigInteger nineHundred = BigInteger.valueOf(900L);
        bigIntegerArr[1] = nineHundred;
        int i = 2;
        while (true) {
            BigInteger[] bigIntegerArr2 = EXP900;
            if (i < bigIntegerArr2.length) {
                bigIntegerArr2[i] = bigIntegerArr2[i - 1].multiply(nineHundred);
                i++;
            } else {
                return;
            }
        }
    }

    private DecodedBitStreamParser() {
    }

    static DecoderResult decode(int[] iArr, String str) throws FormatException {
        int iTextCompaction;
        StringBuilder sb = new StringBuilder(iArr.length << 1);
        Charset charsetForName = StandardCharsets.ISO_8859_1;
        int i = iArr[1];
        PDF417ResultMetadata pDF417ResultMetadata = new PDF417ResultMetadata();
        int i2 = 2;
        while (i2 < iArr[0]) {
            switch (i) {
                case TEXT_COMPACTION_MODE_LATCH /* 900 */:
                    iTextCompaction = textCompaction(iArr, i2, sb);
                    break;
                case BYTE_COMPACTION_MODE_LATCH /* 901 */:
                case BYTE_COMPACTION_MODE_LATCH_6 /* 924 */:
                    iTextCompaction = byteCompaction(i, iArr, charsetForName, i2, sb);
                    break;
                case NUMERIC_COMPACTION_MODE_LATCH /* 902 */:
                    iTextCompaction = numericCompaction(iArr, i2, sb);
                    break;
                case MODE_SHIFT_TO_BYTE_COMPACTION_MODE /* 913 */:
                    iTextCompaction = i2 + 1;
                    sb.append((char) iArr[i2]);
                    break;
                case MACRO_PDF417_TERMINATOR /* 922 */:
                case BEGIN_MACRO_PDF417_OPTIONAL_FIELD /* 923 */:
                    throw FormatException.getFormatInstance();
                case ECI_USER_DEFINED /* 925 */:
                    iTextCompaction = i2 + 1;
                    break;
                case ECI_GENERAL_PURPOSE /* 926 */:
                    iTextCompaction = i2 + 2;
                    break;
                case ECI_CHARSET /* 927 */:
                    iTextCompaction = i2 + 1;
                    charsetForName = Charset.forName(CharacterSetECI.getCharacterSetECIByValue(iArr[i2]).name());
                    break;
                case 928:
                    iTextCompaction = decodeMacroBlock(iArr, i2, pDF417ResultMetadata);
                    break;
                default:
                    iTextCompaction = textCompaction(iArr, i2 - 1, sb);
                    break;
            }
            if (iTextCompaction < iArr.length) {
                i2 = iTextCompaction + 1;
                i = iArr[iTextCompaction];
            } else {
                throw FormatException.getFormatInstance();
            }
        }
        if (sb.length() == 0) {
            throw FormatException.getFormatInstance();
        }
        DecoderResult decoderResult = new DecoderResult(null, sb.toString(), null, str);
        decoderResult.setOther(pDF417ResultMetadata);
        return decoderResult;
    }

    private static int decodeMacroBlock(int[] codewords, int codeIndex, PDF417ResultMetadata resultMetadata) throws FormatException {
        if (codeIndex + 2 > codewords[0]) {
            throw FormatException.getFormatInstance();
        }
        int[] segmentIndexArray = new int[2];
        int i = 0;
        while (i < 2) {
            segmentIndexArray[i] = codewords[codeIndex];
            i++;
            codeIndex++;
        }
        resultMetadata.setSegmentIndex(Integer.parseInt(decodeBase900toBase10(segmentIndexArray, 2)));
        StringBuilder fileId = new StringBuilder();
        int codeIndex2 = textCompaction(codewords, codeIndex, fileId);
        resultMetadata.setFileId(fileId.toString());
        switch (codewords[codeIndex2]) {
            case MACRO_PDF417_TERMINATOR /* 922 */:
                resultMetadata.setLastSegment(true);
                return codeIndex2 + 1;
            case BEGIN_MACRO_PDF417_OPTIONAL_FIELD /* 923 */:
                int codeIndex3 = codeIndex2 + 1;
                int[] additionalOptionCodeWords = new int[codewords[0] - codeIndex3];
                int additionalOptionCodeWordsIndex = 0;
                boolean end = false;
                while (codeIndex3 < codewords[0] && !end) {
                    int codeIndex4 = codeIndex3 + 1;
                    int code = codewords[codeIndex3];
                    if (code < TEXT_COMPACTION_MODE_LATCH) {
                        additionalOptionCodeWords[additionalOptionCodeWordsIndex] = code;
                        additionalOptionCodeWordsIndex++;
                        codeIndex3 = codeIndex4;
                    } else {
                        switch (code) {
                            case MACRO_PDF417_TERMINATOR /* 922 */:
                                resultMetadata.setLastSegment(true);
                                codeIndex3 = codeIndex4 + 1;
                                end = true;
                                break;
                            default:
                                throw FormatException.getFormatInstance();
                        }
                    }
                }
                resultMetadata.setOptionalData(Arrays.copyOf(additionalOptionCodeWords, additionalOptionCodeWordsIndex));
                return codeIndex3;
            default:
                return codeIndex2;
        }
    }

    private static int textCompaction(int[] codewords, int codeIndex, StringBuilder result) {
        int[] textCompactionData = new int[(codewords[0] - codeIndex) << 1];
        int[] byteCompactionData = new int[(codewords[0] - codeIndex) << 1];
        int index = 0;
        boolean end = false;
        while (codeIndex < codewords[0] && !end) {
            int codeIndex2 = codeIndex + 1;
            int code = codewords[codeIndex];
            if (code < TEXT_COMPACTION_MODE_LATCH) {
                textCompactionData[index] = code / 30;
                textCompactionData[index + 1] = code % 30;
                index += 2;
                codeIndex = codeIndex2;
            } else {
                switch (code) {
                    case TEXT_COMPACTION_MODE_LATCH /* 900 */:
                        textCompactionData[index] = TEXT_COMPACTION_MODE_LATCH;
                        index++;
                        codeIndex = codeIndex2;
                        break;
                    case BYTE_COMPACTION_MODE_LATCH /* 901 */:
                    case NUMERIC_COMPACTION_MODE_LATCH /* 902 */:
                    case MACRO_PDF417_TERMINATOR /* 922 */:
                    case BEGIN_MACRO_PDF417_OPTIONAL_FIELD /* 923 */:
                    case BYTE_COMPACTION_MODE_LATCH_6 /* 924 */:
                    case 928:
                        codeIndex = codeIndex2 - 1;
                        end = true;
                        break;
                    case MODE_SHIFT_TO_BYTE_COMPACTION_MODE /* 913 */:
                        textCompactionData[index] = MODE_SHIFT_TO_BYTE_COMPACTION_MODE;
                        codeIndex = codeIndex2 + 1;
                        byteCompactionData[index] = codewords[codeIndex2];
                        index++;
                        break;
                    default:
                        codeIndex = codeIndex2;
                        break;
                }
            }
        }
        decodeTextCompaction(textCompactionData, byteCompactionData, index, result);
        return codeIndex;
    }

    private static void decodeTextCompaction(int[] textCompactionData, int[] byteCompactionData, int length, StringBuilder result) {
        Mode subMode = Mode.ALPHA;
        Mode priorToShiftMode = Mode.ALPHA;
        for (int i = 0; i < length; i++) {
            int subModeCh = textCompactionData[i];
            char ch = 0;
            switch (AnonymousClass1.$SwitchMap$com$google$zxing$pdf417$decoder$DecodedBitStreamParser$Mode[subMode.ordinal()]) {
                case 1:
                    if (subModeCh < 26) {
                        ch = (char) (subModeCh + 65);
                        break;
                    } else {
                        switch (subModeCh) {
                            case 26:
                                ch = ' ';
                                break;
                            case 27:
                                subMode = Mode.LOWER;
                                break;
                            case 28:
                                subMode = Mode.MIXED;
                                break;
                            case ConstraintLayout.LayoutParams.Table.LAYOUT_CONSTRAINT_HORIZONTAL_BIAS /* 29 */:
                                priorToShiftMode = subMode;
                                subMode = Mode.PUNCT_SHIFT;
                                break;
                            case TEXT_COMPACTION_MODE_LATCH /* 900 */:
                                subMode = Mode.ALPHA;
                                break;
                            case MODE_SHIFT_TO_BYTE_COMPACTION_MODE /* 913 */:
                                result.append((char) byteCompactionData[i]);
                                break;
                        }
                    }
                    break;
                case 2:
                    if (subModeCh < 26) {
                        ch = (char) (subModeCh + 97);
                        break;
                    } else {
                        switch (subModeCh) {
                            case 26:
                                ch = ' ';
                                break;
                            case 27:
                                priorToShiftMode = subMode;
                                subMode = Mode.ALPHA_SHIFT;
                                break;
                            case 28:
                                subMode = Mode.MIXED;
                                break;
                            case ConstraintLayout.LayoutParams.Table.LAYOUT_CONSTRAINT_HORIZONTAL_BIAS /* 29 */:
                                priorToShiftMode = subMode;
                                subMode = Mode.PUNCT_SHIFT;
                                break;
                            case TEXT_COMPACTION_MODE_LATCH /* 900 */:
                                subMode = Mode.ALPHA;
                                break;
                            case MODE_SHIFT_TO_BYTE_COMPACTION_MODE /* 913 */:
                                result.append((char) byteCompactionData[i]);
                                break;
                        }
                    }
                    break;
                case 3:
                    if (subModeCh < 25) {
                        ch = MIXED_CHARS[subModeCh];
                        break;
                    } else {
                        switch (subModeCh) {
                            case 25:
                                subMode = Mode.PUNCT;
                                break;
                            case 26:
                                ch = ' ';
                                break;
                            case 27:
                                subMode = Mode.LOWER;
                                break;
                            case 28:
                                subMode = Mode.ALPHA;
                                break;
                            case ConstraintLayout.LayoutParams.Table.LAYOUT_CONSTRAINT_HORIZONTAL_BIAS /* 29 */:
                                priorToShiftMode = subMode;
                                subMode = Mode.PUNCT_SHIFT;
                                break;
                            case TEXT_COMPACTION_MODE_LATCH /* 900 */:
                                subMode = Mode.ALPHA;
                                break;
                            case MODE_SHIFT_TO_BYTE_COMPACTION_MODE /* 913 */:
                                result.append((char) byteCompactionData[i]);
                                break;
                        }
                    }
                    break;
                case 4:
                    if (subModeCh < 29) {
                        ch = PUNCT_CHARS[subModeCh];
                        break;
                    } else {
                        switch (subModeCh) {
                            case ConstraintLayout.LayoutParams.Table.LAYOUT_CONSTRAINT_HORIZONTAL_BIAS /* 29 */:
                                subMode = Mode.ALPHA;
                                break;
                            case TEXT_COMPACTION_MODE_LATCH /* 900 */:
                                subMode = Mode.ALPHA;
                                break;
                            case MODE_SHIFT_TO_BYTE_COMPACTION_MODE /* 913 */:
                                result.append((char) byteCompactionData[i]);
                                break;
                        }
                    }
                    break;
                case 5:
                    subMode = priorToShiftMode;
                    if (subModeCh < 26) {
                        ch = (char) (subModeCh + 65);
                        break;
                    } else {
                        switch (subModeCh) {
                            case 26:
                                ch = ' ';
                                break;
                            case TEXT_COMPACTION_MODE_LATCH /* 900 */:
                                subMode = Mode.ALPHA;
                                break;
                        }
                    }
                    break;
                case 6:
                    subMode = priorToShiftMode;
                    if (subModeCh < 29) {
                        ch = PUNCT_CHARS[subModeCh];
                        break;
                    } else {
                        switch (subModeCh) {
                            case ConstraintLayout.LayoutParams.Table.LAYOUT_CONSTRAINT_HORIZONTAL_BIAS /* 29 */:
                                subMode = Mode.ALPHA;
                                break;
                            case TEXT_COMPACTION_MODE_LATCH /* 900 */:
                                subMode = Mode.ALPHA;
                                break;
                            case MODE_SHIFT_TO_BYTE_COMPACTION_MODE /* 913 */:
                                result.append((char) byteCompactionData[i]);
                                break;
                        }
                    }
                    break;
            }
            if (ch != 0) {
                result.append(ch);
            }
        }
    }

    /* JADX INFO: renamed from: com.google.zxing.pdf417.decoder.DecodedBitStreamParser$1, reason: invalid class name */
    static /* synthetic */ class AnonymousClass1 {
        static final /* synthetic */ int[] $SwitchMap$com$google$zxing$pdf417$decoder$DecodedBitStreamParser$Mode;

        static {
            int[] iArr = new int[Mode.values().length];
            $SwitchMap$com$google$zxing$pdf417$decoder$DecodedBitStreamParser$Mode = iArr;
            try {
                iArr[Mode.ALPHA.ordinal()] = 1;
            } catch (NoSuchFieldError e) {
            }
            try {
                $SwitchMap$com$google$zxing$pdf417$decoder$DecodedBitStreamParser$Mode[Mode.LOWER.ordinal()] = 2;
            } catch (NoSuchFieldError e2) {
            }
            try {
                $SwitchMap$com$google$zxing$pdf417$decoder$DecodedBitStreamParser$Mode[Mode.MIXED.ordinal()] = 3;
            } catch (NoSuchFieldError e3) {
            }
            try {
                $SwitchMap$com$google$zxing$pdf417$decoder$DecodedBitStreamParser$Mode[Mode.PUNCT.ordinal()] = 4;
            } catch (NoSuchFieldError e4) {
            }
            try {
                $SwitchMap$com$google$zxing$pdf417$decoder$DecodedBitStreamParser$Mode[Mode.ALPHA_SHIFT.ordinal()] = 5;
            } catch (NoSuchFieldError e5) {
            }
            try {
                $SwitchMap$com$google$zxing$pdf417$decoder$DecodedBitStreamParser$Mode[Mode.PUNCT_SHIFT.ordinal()] = 6;
            } catch (NoSuchFieldError e6) {
            }
        }
    }

    private static int byteCompaction(int i, int[] iArr, Charset charset, int i2, StringBuilder sb) {
        int i3;
        int i4;
        ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
        long j = 900;
        int i5 = 6;
        char c = 0;
        switch (i) {
            case BYTE_COMPACTION_MODE_LATCH /* 901 */:
                int[] iArr2 = new int[6];
                i3 = i2 + 1;
                int i6 = iArr[i2];
                boolean z = false;
                int i7 = 0;
                long j2 = 0;
                while (true) {
                    i4 = iArr[c];
                    if (i3 < i4 && !z) {
                        int i8 = i7 + 1;
                        iArr2[i7] = i6;
                        j2 = (j2 * 900) + ((long) i6);
                        int i9 = i3 + 1;
                        i6 = iArr[i3];
                        switch (i6) {
                            case TEXT_COMPACTION_MODE_LATCH /* 900 */:
                            case BYTE_COMPACTION_MODE_LATCH /* 901 */:
                            case NUMERIC_COMPACTION_MODE_LATCH /* 902 */:
                            case MACRO_PDF417_TERMINATOR /* 922 */:
                            case BEGIN_MACRO_PDF417_OPTIONAL_FIELD /* 923 */:
                            case BYTE_COMPACTION_MODE_LATCH_6 /* 924 */:
                            case 928:
                                i3 = i9 - 1;
                                i7 = i8;
                                c = 0;
                                z = true;
                                break;
                            default:
                                if (i8 % 5 != 0 || i8 <= 0) {
                                    i3 = i9;
                                    i7 = i8;
                                    i5 = 6;
                                    c = 0;
                                } else {
                                    int i10 = 0;
                                    while (i10 < i5) {
                                        byteArrayOutputStream.write((byte) (j2 >> ((5 - i10) * 8)));
                                        i10++;
                                        i9 = i9;
                                        i5 = 6;
                                    }
                                    i3 = i9;
                                    i5 = 6;
                                    c = 0;
                                    i7 = 0;
                                    j2 = 0;
                                }
                                break;
                        }
                    }
                }
                if (i3 == i4 && i6 < TEXT_COMPACTION_MODE_LATCH) {
                    iArr2[i7] = i6;
                    i7++;
                }
                for (int i11 = 0; i11 < i7; i11++) {
                    byteArrayOutputStream.write((byte) iArr2[i11]);
                }
                break;
            case BYTE_COMPACTION_MODE_LATCH_6 /* 924 */:
                int i12 = i2;
                boolean z2 = false;
                int i13 = 0;
                long j3 = 0;
                while (i12 < iArr[0] && !z2) {
                    int i14 = i12 + 1;
                    int i15 = iArr[i12];
                    if (i15 >= TEXT_COMPACTION_MODE_LATCH) {
                        switch (i15) {
                            case TEXT_COMPACTION_MODE_LATCH /* 900 */:
                            case BYTE_COMPACTION_MODE_LATCH /* 901 */:
                            case NUMERIC_COMPACTION_MODE_LATCH /* 902 */:
                            case MACRO_PDF417_TERMINATOR /* 922 */:
                            case BEGIN_MACRO_PDF417_OPTIONAL_FIELD /* 923 */:
                            case BYTE_COMPACTION_MODE_LATCH_6 /* 924 */:
                            case 928:
                                i12 = i14 - 1;
                                z2 = true;
                                break;
                            default:
                                i12 = i14;
                                break;
                        }
                    } else {
                        i13++;
                        j3 = (j3 * j) + ((long) i15);
                        i12 = i14;
                    }
                    if (i13 % 5 == 0 && i13 > 0) {
                        for (int i16 = 0; i16 < 6; i16++) {
                            byteArrayOutputStream.write((byte) (j3 >> ((5 - i16) * 8)));
                        }
                        i13 = 0;
                        j3 = 0;
                    }
                    j = 900;
                }
                i3 = i12;
                break;
            default:
                i3 = i2;
                break;
        }
        sb.append(new String(byteArrayOutputStream.toByteArray(), charset));
        return i3;
    }

    private static int numericCompaction(int[] codewords, int code, StringBuilder result) throws FormatException {
        int count = 0;
        boolean end = false;
        int[] numericCodewords = new int[15];
        while (code < codewords[0] && !end) {
            int codeIndex = code + 1;
            int code2 = codewords[code];
            if (codeIndex == codewords[0]) {
                end = true;
            }
            if (code2 < TEXT_COMPACTION_MODE_LATCH) {
                numericCodewords[count] = code2;
                count++;
            } else {
                switch (code2) {
                    case TEXT_COMPACTION_MODE_LATCH /* 900 */:
                    case BYTE_COMPACTION_MODE_LATCH /* 901 */:
                    case MACRO_PDF417_TERMINATOR /* 922 */:
                    case BEGIN_MACRO_PDF417_OPTIONAL_FIELD /* 923 */:
                    case BYTE_COMPACTION_MODE_LATCH_6 /* 924 */:
                    case 928:
                        codeIndex--;
                        end = true;
                        break;
                }
            }
            if ((count % 15 == 0 || code2 == NUMERIC_COMPACTION_MODE_LATCH || end) && count > 0) {
                result.append(decodeBase900toBase10(numericCodewords, count));
                count = 0;
            }
            code = codeIndex;
        }
        return code;
    }

    private static String decodeBase900toBase10(int[] codewords, int count) throws FormatException {
        BigInteger result = BigInteger.ZERO;
        for (int i = 0; i < count; i++) {
            result = result.add(EXP900[(count - i) - 1].multiply(BigInteger.valueOf(codewords[i])));
        }
        String resultString = result.toString();
        if (resultString.charAt(0) != '1') {
            throw FormatException.getFormatInstance();
        }
        return resultString.substring(1);
    }
}
