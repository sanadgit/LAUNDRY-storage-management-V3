package androidx.browser.trusted;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.DataInputStream;
import java.io.DataOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

/* JADX INFO: loaded from: classes.dex */
final class TokenContents {
    private final byte[] mContents;
    private List<byte[]> mFingerprints;
    private String mPackageName;

    static TokenContents deserialize(byte[] serialized) {
        return new TokenContents(serialized);
    }

    private TokenContents(byte[] contents) {
        this.mContents = contents;
    }

    static TokenContents create(String packageName, List<byte[]> fingerprints) throws IOException {
        return new TokenContents(createToken(packageName, fingerprints), packageName, fingerprints);
    }

    private TokenContents(byte[] contents, String packageName, List<byte[]> fingerprints) {
        this.mContents = contents;
        this.mPackageName = packageName;
        this.mFingerprints = new ArrayList(fingerprints.size());
        for (byte[] fingerprint : fingerprints) {
            this.mFingerprints.add(Arrays.copyOf(fingerprint, fingerprint.length));
        }
    }

    public String getPackageName() throws IOException {
        parseIfNeeded();
        String str = this.mPackageName;
        if (str == null) {
            throw new IllegalStateException();
        }
        return str;
    }

    public int getFingerprintCount() throws IOException {
        parseIfNeeded();
        List<byte[]> list = this.mFingerprints;
        if (list == null) {
            throw new IllegalStateException();
        }
        return list.size();
    }

    public byte[] getFingerprint(int i) throws IOException {
        parseIfNeeded();
        List<byte[]> list = this.mFingerprints;
        if (list == null) {
            throw new IllegalStateException();
        }
        return Arrays.copyOf(list.get(i), this.mFingerprints.get(i).length);
    }

    public byte[] serialize() {
        byte[] bArr = this.mContents;
        return Arrays.copyOf(bArr, bArr.length);
    }

    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        TokenContents that = (TokenContents) o;
        return Arrays.equals(this.mContents, that.mContents);
    }

    public int hashCode() {
        return Arrays.hashCode(this.mContents);
    }

    private static byte[] createToken(String packageName, List<byte[]> fingerprints) throws IOException {
        Collections.sort(fingerprints, new Comparator() { // from class: androidx.browser.trusted.TokenContents$$ExternalSyntheticLambda0
            @Override // java.util.Comparator
            public final int compare(Object obj, Object obj2) {
                return TokenContents.compareByteArrays((byte[]) obj, (byte[]) obj2);
            }
        });
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        DataOutputStream writer = new DataOutputStream(baos);
        writer.writeUTF(packageName);
        writer.writeInt(fingerprints.size());
        for (byte[] fingerprint : fingerprints) {
            writer.writeInt(fingerprint.length);
            writer.write(fingerprint);
        }
        writer.flush();
        return baos.toByteArray();
    }

    /* JADX INFO: Access modifiers changed from: private */
    public static int compareByteArrays(byte[] a, byte[] b) {
        if (a == b) {
            return 0;
        }
        if (a == null) {
            return -1;
        }
        if (b == null) {
            return 1;
        }
        for (int i = 0; i < Math.min(a.length, b.length); i++) {
            if (a[i] != b[i]) {
                return a[i] - b[i];
            }
        }
        int i2 = a.length;
        if (i2 != b.length) {
            return a.length - b.length;
        }
        return 0;
    }

    private void parseIfNeeded() throws IOException {
        if (this.mPackageName != null) {
            return;
        }
        DataInputStream reader = new DataInputStream(new ByteArrayInputStream(this.mContents));
        this.mPackageName = reader.readUTF();
        int numFingerprints = reader.readInt();
        this.mFingerprints = new ArrayList(numFingerprints);
        for (int i = 0; i < numFingerprints; i++) {
            int size = reader.readInt();
            byte[] fingerprint = new byte[size];
            int bytesRead = reader.read(fingerprint);
            if (bytesRead != size) {
                throw new IllegalStateException("Could not read fingerprint");
            }
            this.mFingerprints.add(fingerprint);
        }
    }
}
