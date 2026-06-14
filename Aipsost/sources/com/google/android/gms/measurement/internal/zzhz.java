package com.google.android.gms.measurement.internal;

import com.google.android.gms.common.internal.Preconditions;
import java.net.URL;
import java.util.List;
import java.util.Map;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-impl@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzhz implements Runnable {
    final /* synthetic */ zzia zza;
    private final URL zzb;
    private final String zzc;
    private final zzfs zzd;

    public zzhz(zzia zziaVar, String str, URL url, byte[] bArr, Map map, zzfs zzfsVar, byte[] bArr2) {
        this.zza = zziaVar;
        Preconditions.checkNotEmpty(str);
        Preconditions.checkNotNull(url);
        Preconditions.checkNotNull(zzfsVar);
        this.zzb = url;
        this.zzd = zzfsVar;
        this.zzc = str;
    }

    private final void zzb(final int i, final Exception exc, final byte[] bArr, final Map<String, List<String>> map) {
        this.zza.zzs.zzav().zzh(new Runnable(this, i, exc, bArr, map) { // from class: com.google.android.gms.measurement.internal.zzhy
            private final zzhz zza;
            private final int zzb;
            private final Exception zzc;
            private final byte[] zzd;
            private final Map zze;

            {
                this.zza = this;
                this.zzb = i;
                this.zzc = exc;
                this.zzd = bArr;
                this.zze = map;
            }

            @Override // java.lang.Runnable
            public final void run() {
                this.zza.zza(this.zzb, this.zzc, this.zzd, this.zze);
            }
        });
    }

    /* JADX WARN: Removed duplicated region for block: B:41:0x0066  */
    /* JADX WARN: Removed duplicated region for block: B:47:0x0075  */
    @Override // java.lang.Runnable
    /*
        Code decompiled incorrectly, please refer to instructions dump.
        To view partially-correct code enable 'Show inconsistent code' option in preferences
    */
    public final void run() throws java.lang.Throwable {
        /*
            r9 = this;
            com.google.android.gms.measurement.internal.zzia r0 = r9.zza
            r0.zzaw()
            r0 = 0
            r1 = 0
            com.google.android.gms.measurement.internal.zzia r2 = r9.zza     // Catch: java.lang.Throwable -> L5f java.io.IOException -> L6e
            java.net.URL r3 = r9.zzb     // Catch: java.lang.Throwable -> L5f java.io.IOException -> L6e
            java.net.HttpURLConnection r2 = r2.zzd(r3)     // Catch: java.lang.Throwable -> L5f java.io.IOException -> L6e
            int r3 = r2.getResponseCode()     // Catch: java.lang.Throwable -> L55 java.io.IOException -> L5a
            java.util.Map r4 = r2.getHeaderFields()     // Catch: java.lang.Throwable -> L4f java.io.IOException -> L52
            java.io.ByteArrayOutputStream r5 = new java.io.ByteArrayOutputStream     // Catch: java.lang.Throwable -> L43
            r5.<init>()     // Catch: java.lang.Throwable -> L43
            java.io.InputStream r6 = r2.getInputStream()     // Catch: java.lang.Throwable -> L43
            r7 = 1024(0x400, float:1.435E-42)
            byte[] r7 = new byte[r7]     // Catch: java.lang.Throwable -> L41
        L24:
            int r8 = r6.read(r7)     // Catch: java.lang.Throwable -> L41
            if (r8 <= 0) goto L2e
            r5.write(r7, r0, r8)     // Catch: java.lang.Throwable -> L41
            goto L24
        L2e:
            byte[] r0 = r5.toByteArray()     // Catch: java.lang.Throwable -> L41
            if (r6 == 0) goto L37
            r6.close()     // Catch: java.lang.Throwable -> L4b java.io.IOException -> L4d
        L37:
            if (r2 == 0) goto L3c
            r2.disconnect()
        L3c:
            r9.zzb(r3, r1, r0, r4)
            return
        L41:
            r0 = move-exception
            goto L45
        L43:
            r0 = move-exception
            r6 = r1
        L45:
            if (r6 == 0) goto L4a
            r6.close()     // Catch: java.lang.Throwable -> L4b java.io.IOException -> L4d
        L4a:
            throw r0     // Catch: java.lang.Throwable -> L4b java.io.IOException -> L4d
        L4b:
            r0 = move-exception
            goto L64
        L4d:
            r0 = move-exception
            goto L73
        L4f:
            r0 = move-exception
            r4 = r1
            goto L64
        L52:
            r0 = move-exception
            r4 = r1
            goto L73
        L55:
            r3 = move-exception
            r4 = r1
            r0 = r3
            r3 = 0
            goto L64
        L5a:
            r3 = move-exception
            r4 = r1
            r0 = r3
            r3 = 0
            goto L73
        L5f:
            r2 = move-exception
            r4 = r1
            r0 = r2
            r3 = 0
            r2 = r4
        L64:
            if (r2 == 0) goto L69
            r2.disconnect()
        L69:
            r9.zzb(r3, r1, r1, r4)
            throw r0
        L6e:
            r2 = move-exception
            r4 = r1
            r0 = r2
            r3 = 0
            r2 = r4
        L73:
            if (r2 == 0) goto L78
            r2.disconnect()
        L78:
            r9.zzb(r3, r0, r1, r4)
            return
        */
        throw new UnsupportedOperationException("Method not decompiled: com.google.android.gms.measurement.internal.zzhz.run():void");
    }

    final /* synthetic */ void zza(int i, Exception exc, byte[] bArr, Map map) {
        this.zzd.zza(this.zzc, i, exc, bArr, map);
    }
}
