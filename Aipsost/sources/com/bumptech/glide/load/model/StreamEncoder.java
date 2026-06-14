package com.bumptech.glide.load.model;

import com.bumptech.glide.load.Encoder;
import com.bumptech.glide.load.engine.bitmap_recycle.ArrayPool;
import java.io.InputStream;

/* JADX INFO: loaded from: classes.dex */
public class StreamEncoder implements Encoder<InputStream> {
    private static final String TAG = "StreamEncoder";
    private final ArrayPool byteArrayPool;

    public StreamEncoder(ArrayPool byteArrayPool) {
        this.byteArrayPool = byteArrayPool;
    }

    /* JADX WARN: Can't wrap try/catch for region: R(8:(2:36|3)|(4:4|(1:6)(1:41)|24|25)|7|8|39|9|24|25) */
    @Override // com.bumptech.glide.load.Encoder
    /*
        Code decompiled incorrectly, please refer to instructions dump.
        To view partially-correct code enable 'Show inconsistent code' option in preferences
    */
    public boolean encode(java.io.InputStream r8, java.io.File r9, com.bumptech.glide.load.Options r10) {
        /*
            r7 = this;
            java.lang.String r0 = "StreamEncoder"
            com.bumptech.glide.load.engine.bitmap_recycle.ArrayPool r1 = r7.byteArrayPool
            r2 = 65536(0x10000, float:9.1835E-41)
            java.lang.Class<byte[]> r3 = byte[].class
            java.lang.Object r1 = r1.get(r2, r3)
            byte[] r1 = (byte[]) r1
            r2 = 0
            r3 = 0
            java.io.FileOutputStream r4 = new java.io.FileOutputStream     // Catch: java.lang.Throwable -> L2e java.io.IOException -> L30
            r4.<init>(r9)     // Catch: java.lang.Throwable -> L2e java.io.IOException -> L30
            r3 = r4
        L16:
            int r4 = r8.read(r1)     // Catch: java.lang.Throwable -> L2e java.io.IOException -> L30
            r5 = r4
            r6 = -1
            if (r4 == r6) goto L23
            r4 = 0
            r3.write(r1, r4, r5)     // Catch: java.lang.Throwable -> L2e java.io.IOException -> L30
            goto L16
        L23:
            r3.close()     // Catch: java.lang.Throwable -> L2e java.io.IOException -> L30
            r2 = 1
            r3.close()     // Catch: java.io.IOException -> L2c
            goto L42
        L2c:
            r0 = move-exception
            goto L44
        L2e:
            r0 = move-exception
            goto L4b
        L30:
            r4 = move-exception
            r5 = 3
            boolean r5 = android.util.Log.isLoggable(r0, r5)     // Catch: java.lang.Throwable -> L2e
            if (r5 == 0) goto L3d
            java.lang.String r5 = "Failed to encode data onto the OutputStream"
            android.util.Log.d(r0, r5, r4)     // Catch: java.lang.Throwable -> L2e
        L3d:
            if (r3 == 0) goto L44
            r3.close()     // Catch: java.io.IOException -> L43
        L42:
            goto L44
        L43:
            r0 = move-exception
        L44:
            com.bumptech.glide.load.engine.bitmap_recycle.ArrayPool r0 = r7.byteArrayPool
            r0.put(r1)
            return r2
        L4b:
            if (r3 == 0) goto L52
            r3.close()     // Catch: java.io.IOException -> L51
            goto L52
        L51:
            r4 = move-exception
        L52:
            com.bumptech.glide.load.engine.bitmap_recycle.ArrayPool r4 = r7.byteArrayPool
            r4.put(r1)
            throw r0
        */
        throw new UnsupportedOperationException("Method not decompiled: com.bumptech.glide.load.model.StreamEncoder.encode(java.io.InputStream, java.io.File, com.bumptech.glide.load.Options):boolean");
    }
}
