package com.google.android.gms.internal.measurement;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-base@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzjs {
    private static final zzjq<?> zza = new zzjr();
    private static final zzjq<?> zzb;

    static {
        zzjq<?> zzjqVar;
        try {
            zzjqVar = (zzjq) Class.forName("com.google.protobuf.ExtensionSchemaFull").getDeclaredConstructor(new Class[0]).newInstance(new Object[0]);
        } catch (Exception e) {
            zzjqVar = null;
        }
        zzb = zzjqVar;
    }

    static zzjq<?> zza() {
        return zza;
    }

    static zzjq<?> zzb() {
        zzjq<?> zzjqVar = zzb;
        if (zzjqVar != null) {
            return zzjqVar;
        }
        throw new IllegalStateException("Protobuf runtime is not correctly loaded.");
    }
}
