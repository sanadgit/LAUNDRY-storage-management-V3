package com.google.android.datatransport.cct;

import com.bumptech.glide.load.Key;
import com.google.android.datatransport.Encoding;
import com.google.android.datatransport.runtime.EncodedDestination;
import java.nio.charset.Charset;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;
import java.util.regex.Pattern;

/* JADX INFO: loaded from: classes.dex */
public final class CCTDestination implements EncodedDestination {
    private static final String DEFAULT_API_KEY;
    static final String DEFAULT_END_POINT;
    static final String DESTINATION_NAME = "cct";
    private static final String EXTRAS_DELIMITER = "\\";
    private static final String EXTRAS_VERSION_MARKER = "1$";
    public static final CCTDestination INSTANCE;
    static final String LEGACY_END_POINT;
    public static final CCTDestination LEGACY_INSTANCE;
    private static final Set<Encoding> SUPPORTED_ENCODINGS;
    private final String apiKey;
    private final String endPoint;

    static {
        String strMergeStrings = StringMerger.mergeStrings("hts/frbslgiggolai.o/0clgbthfra=snpoo", "tp:/ieaeogn.ogepscmvc/o/ac?omtjo_rt3");
        DEFAULT_END_POINT = strMergeStrings;
        String strMergeStrings2 = StringMerger.mergeStrings("hts/frbslgigp.ogepscmv/ieo/eaybtho", "tp:/ieaeogn-agolai.o/1frlglgc/aclg");
        LEGACY_END_POINT = strMergeStrings2;
        String strMergeStrings3 = StringMerger.mergeStrings("AzSCki82AwsLzKd5O8zo", "IayckHiZRO1EFl1aGoK");
        DEFAULT_API_KEY = strMergeStrings3;
        SUPPORTED_ENCODINGS = Collections.unmodifiableSet(new HashSet(Arrays.asList(Encoding.of("proto"), Encoding.of("json"))));
        INSTANCE = new CCTDestination(strMergeStrings, null);
        LEGACY_INSTANCE = new CCTDestination(strMergeStrings2, strMergeStrings3);
    }

    public CCTDestination(String endPoint, String apiKey) {
        this.endPoint = endPoint;
        this.apiKey = apiKey;
    }

    @Override // com.google.android.datatransport.runtime.Destination
    public String getName() {
        return DESTINATION_NAME;
    }

    @Override // com.google.android.datatransport.runtime.Destination
    public byte[] getExtras() {
        return asByteArray();
    }

    @Override // com.google.android.datatransport.runtime.EncodedDestination
    public Set<Encoding> getSupportedEncodings() {
        return SUPPORTED_ENCODINGS;
    }

    public String getAPIKey() {
        return this.apiKey;
    }

    public String getEndPoint() {
        return this.endPoint;
    }

    public byte[] asByteArray() {
        String str = this.apiKey;
        if (str == null && this.endPoint == null) {
            return null;
        }
        Object[] objArr = new Object[4];
        objArr[0] = EXTRAS_VERSION_MARKER;
        objArr[1] = this.endPoint;
        objArr[2] = EXTRAS_DELIMITER;
        if (str == null) {
            str = "";
        }
        objArr[3] = str;
        String buffer = String.format("%s%s%s%s", objArr);
        return buffer.getBytes(Charset.forName(Key.STRING_CHARSET_NAME));
    }

    public static CCTDestination fromByteArray(byte[] a) {
        String buffer = new String(a, Charset.forName(Key.STRING_CHARSET_NAME));
        if (!buffer.startsWith(EXTRAS_VERSION_MARKER)) {
            throw new IllegalArgumentException("Version marker missing from extras");
        }
        String[] fields = buffer.substring(EXTRAS_VERSION_MARKER.length()).split(Pattern.quote(EXTRAS_DELIMITER), 2);
        if (fields.length != 2) {
            throw new IllegalArgumentException("Extra is not a valid encoded LegacyFlgDestination");
        }
        String endPoint = fields[0];
        if (endPoint.isEmpty()) {
            throw new IllegalArgumentException("Missing endpoint in CCTDestination extras");
        }
        String apiKey = fields[1];
        return new CCTDestination(endPoint, apiKey.isEmpty() ? null : apiKey);
    }

    static byte[] encodeString(String s) {
        return s.getBytes(Charset.forName(Key.STRING_CHARSET_NAME));
    }

    static String decodeExtras(byte[] a) {
        return new String(a, Charset.forName(Key.STRING_CHARSET_NAME));
    }
}
