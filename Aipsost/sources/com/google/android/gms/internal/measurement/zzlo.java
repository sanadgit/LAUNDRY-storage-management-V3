package com.google.android.gms.internal.measurement;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-base@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzlo {
    private static final zzln zza;
    private static final zzln zzb;

    static {
        zzln zzlnVar;
        try {
            zzlnVar = (zzln) Class.forName("com.google.protobuf.NewInstanceSchemaFull").getDeclaredConstructor(new Class[0]).newInstance(new Object[0]);
        } catch (Exception e) {
            zzlnVar = null;
        }
        zza = zzlnVar;
        zzb = new zzln();
    }

    static zzln zza() {
        return zza;
    }

    static zzln zzb() {
        return zzb;
    }
}
