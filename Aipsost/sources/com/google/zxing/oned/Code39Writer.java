package com.google.zxing.oned;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.WriterException;
import com.google.zxing.common.BitMatrix;
import java.util.Map;
import kotlin.text.Typography;

/* JADX INFO: loaded from: classes11.dex */
public final class Code39Writer extends OneDimensionalCodeWriter {
    @Override // com.google.zxing.oned.OneDimensionalCodeWriter, com.google.zxing.Writer
    public BitMatrix encode(String contents, BarcodeFormat format, int width, int height, Map<EncodeHintType, ?> hints) throws WriterException {
        if (format != BarcodeFormat.CODE_39) {
            throw new IllegalArgumentException("Can only encode CODE_39, but got " + format);
        }
        return super.encode(contents, format, width, height, hints);
    }

    @Override // com.google.zxing.oned.OneDimensionalCodeWriter
    public boolean[] encode(String str) {
        int length = str.length();
        if (length > 80) {
            throw new IllegalArgumentException("Requested contents should be less than 80 digits long, but got " + length);
        }
        int i = 0;
        while (true) {
            if (i >= length) {
                break;
            }
            if ("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ-. $/+%".indexOf(str.charAt(i)) >= 0) {
                i++;
            } else {
                str = tryToConvertToExtendedMode(str);
                length = str.length();
                if (length > 80) {
                    throw new IllegalArgumentException("Requested contents should be less than 80 digits long, but got " + length + " (extended full ASCII mode)");
                }
            }
        }
        int[] iArr = new int[9];
        int i2 = length + 25;
        for (int i3 = 0; i3 < length; i3++) {
            toIntArray(Code39Reader.CHARACTER_ENCODINGS["0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ-. $/+%".indexOf(str.charAt(i3))], iArr);
            for (int i4 = 0; i4 < 9; i4++) {
                i2 += iArr[i4];
            }
        }
        boolean[] zArr = new boolean[i2];
        toIntArray(148, iArr);
        int iAppendPattern = appendPattern(zArr, 0, iArr, true);
        int[] iArr2 = {1};
        int iAppendPattern2 = iAppendPattern + appendPattern(zArr, iAppendPattern, iArr2, false);
        for (int i5 = 0; i5 < length; i5++) {
            toIntArray(Code39Reader.CHARACTER_ENCODINGS["0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ-. $/+%".indexOf(str.charAt(i5))], iArr);
            int iAppendPattern3 = iAppendPattern2 + appendPattern(zArr, iAppendPattern2, iArr, true);
            iAppendPattern2 = iAppendPattern3 + appendPattern(zArr, iAppendPattern3, iArr2, false);
        }
        toIntArray(148, iArr);
        appendPattern(zArr, iAppendPattern2, iArr, true);
        return zArr;
    }

    private static void toIntArray(int a, int[] toReturn) {
        for (int i = 0; i < 9; i++) {
            int i2 = 1;
            int temp = (1 << (8 - i)) & a;
            if (temp != 0) {
                i2 = 2;
            }
            toReturn[i] = i2;
        }
    }

    private static String tryToConvertToExtendedMode(String contents) {
        int length = contents.length();
        StringBuilder extendedContent = new StringBuilder();
        for (int i = 0; i < length; i++) {
            char character = contents.charAt(i);
            switch (character) {
                case 0:
                    extendedContent.append("%U");
                    break;
                case ' ':
                case '-':
                case '.':
                    extendedContent.append(character);
                    break;
                case '@':
                    extendedContent.append("%V");
                    break;
                case '`':
                    extendedContent.append("%W");
                    break;
                default:
                    if (character <= 0 || character >= 27) {
                        if (character <= 26 || character >= ' ') {
                            if ((character > ' ' && character < '-') || character == '/' || character == ':') {
                                extendedContent.append('/');
                                extendedContent.append((char) ((character - '!') + 65));
                            } else if (character <= '/' || character >= ':') {
                                if (character > ':' && character < '@') {
                                    extendedContent.append('%');
                                    extendedContent.append((char) ((character - ';') + 70));
                                } else if (character <= '@' || character >= '[') {
                                    if (character > 'Z' && character < '`') {
                                        extendedContent.append('%');
                                        extendedContent.append((char) ((character - '[') + 75));
                                    } else if (character <= '`' || character >= '{') {
                                        if (character > 'z' && character < 128) {
                                            extendedContent.append('%');
                                            extendedContent.append((char) ((character - '{') + 80));
                                        } else {
                                            throw new IllegalArgumentException("Requested content contains a non-encodable character: '" + contents.charAt(i) + "'");
                                        }
                                    } else {
                                        extendedContent.append('+');
                                        extendedContent.append((char) ((character - 'a') + 65));
                                    }
                                } else {
                                    extendedContent.append((char) ((character - 'A') + 65));
                                }
                            } else {
                                extendedContent.append((char) ((character - '0') + 48));
                            }
                        } else {
                            extendedContent.append('%');
                            extendedContent.append((char) ((character - 27) + 65));
                        }
                    } else {
                        extendedContent.append(Typography.dollar);
                        extendedContent.append((char) ((character - 1) + 65));
                    }
                    break;
            }
        }
        return extendedContent.toString();
    }
}
