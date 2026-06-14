package com.google.android.gms.internal.measurement;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-base@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzjy implements zzlg {
    private static final zzjy zza = new zzjy();

    private zzjy() {
    }

    public static zzjy zza() {
        return zza;
    }

    @Override // com.google.android.gms.internal.measurement.zzlg
    public final boolean zzb(Class<?> cls) {
        return zzkd.class.isAssignableFrom(cls);
    }

    @Override // com.google.android.gms.internal.measurement.zzlg
    public final zzlf zzc(Class<?> cls) {
        if (!zzkd.class.isAssignableFrom(cls)) {
            String strValueOf = String.valueOf(cls.getName());
            throw new IllegalArgumentException(strValueOf.length() != 0 ? "Unsupported message type: ".concat(strValueOf) : new String("Unsupported message type: "));
        }
        try {
            return (zzlf) zzkd.zzbx(cls.asSubclass(zzkd.class)).zzl(3, null, null);
        } catch (Exception e) {
            String strValueOf2 = String.valueOf(cls.getName());
            throw new RuntimeException(strValueOf2.length() != 0 ? "Unable to get message info for ".concat(strValueOf2) : new String("Unable to get message info for "), e);
        }
    }
}
