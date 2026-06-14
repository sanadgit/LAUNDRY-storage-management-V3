package com.google.android.gms.internal.p001firebaseauthapi;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzada implements zzaei {
    private static final zzada zza = new zzada();

    private zzada() {
    }

    public static zzada zza() {
        return zza;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzaei
    public final zzaeh zzb(Class cls) {
        if (!zzadf.class.isAssignableFrom(cls)) {
            throw new IllegalArgumentException("Unsupported message type: ".concat(String.valueOf(cls.getName())));
        }
        try {
            return (zzaeh) zzadf.zzv(cls.asSubclass(zzadf.class)).zzj(3, null, null);
        } catch (Exception e) {
            throw new RuntimeException("Unable to get message info for ".concat(String.valueOf(cls.getName())), e);
        }
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzaei
    public final boolean zzc(Class cls) {
        return zzadf.class.isAssignableFrom(cls);
    }
}
