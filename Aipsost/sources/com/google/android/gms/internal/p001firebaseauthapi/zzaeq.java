package com.google.android.gms.internal.p001firebaseauthapi;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzaeq {
    private static final zzaep zza;
    private static final zzaep zzb;

    static {
        zzaep zzaepVar;
        try {
            zzaepVar = (zzaep) Class.forName("com.google.protobuf.NewInstanceSchemaFull").getDeclaredConstructor(new Class[0]).newInstance(new Object[0]);
        } catch (Exception e) {
            zzaepVar = null;
        }
        zza = zzaepVar;
        zzb = new zzaep();
    }

    static zzaep zza() {
        return zza;
    }

    static zzaep zzb() {
        return zzb;
    }
}
