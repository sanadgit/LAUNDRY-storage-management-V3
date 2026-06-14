package com.google.android.gms.internal.p001firebaseauthapi;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzaeg {
    private static final zzaef zza;
    private static final zzaef zzb;

    static {
        zzaef zzaefVar;
        try {
            zzaefVar = (zzaef) Class.forName("com.google.protobuf.MapFieldSchemaFull").getDeclaredConstructor(new Class[0]).newInstance(new Object[0]);
        } catch (Exception e) {
            zzaefVar = null;
        }
        zza = zzaefVar;
        zzb = new zzaef();
    }

    static zzaef zza() {
        return zza;
    }

    static zzaef zzb() {
        return zzb;
    }
}
