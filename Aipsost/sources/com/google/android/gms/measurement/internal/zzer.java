package com.google.android.gms.measurement.internal;

import com.google.android.gms.common.internal.Preconditions;
import java.net.URL;
import java.util.Map;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzer implements Runnable {
    final /* synthetic */ zzes zza;
    private final URL zzb;
    private final byte[] zzc;
    private final zzep zzd;
    private final String zze;
    private final Map<String, String> zzf;

    public zzer(zzes zzesVar, String str, URL url, byte[] bArr, Map<String, String> map, zzep zzepVar) {
        this.zza = zzesVar;
        Preconditions.checkNotEmpty(str);
        Preconditions.checkNotNull(url);
        Preconditions.checkNotNull(zzepVar);
        this.zzb = url;
        this.zzc = bArr;
        this.zzd = zzepVar;
        this.zze = str;
        this.zzf = map;
    }

    /* JADX WARN: Removed duplicated region for block: B:64:0x0112  */
    /* JADX WARN: Removed duplicated region for block: B:75:0x0152  */
    /* JADX WARN: Removed duplicated region for block: B:77:0x0136 A[EXC_TOP_SPLITTER, SYNTHETIC] */
    /* JADX WARN: Removed duplicated region for block: B:79:0x00f6 A[EXC_TOP_SPLITTER, SYNTHETIC] */
    @Override // java.lang.Runnable
    /*
        Code decompiled incorrectly, please refer to instructions dump.
        To view partially-correct code enable 'Show inconsistent code' option in preferences
    */
    public final void run() throws java.lang.Throwable {
        /*
            Method dump skipped, instruction units count: 363
            To view this dump change 'Code comments level' option to 'DEBUG'
        */
        throw new UnsupportedOperationException("Method not decompiled: com.google.android.gms.measurement.internal.zzer.run():void");
    }
}
