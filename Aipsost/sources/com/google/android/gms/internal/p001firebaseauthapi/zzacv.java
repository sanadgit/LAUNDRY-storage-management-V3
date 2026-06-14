package com.google.android.gms.internal.p001firebaseauthapi;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzacv {
    private static final zzact zza = new zzacu();
    private static final zzact zzb;

    static {
        zzact zzactVar;
        try {
            zzactVar = (zzact) Class.forName("com.google.protobuf.ExtensionSchemaFull").getDeclaredConstructor(new Class[0]).newInstance(new Object[0]);
        } catch (Exception e) {
            zzactVar = null;
        }
        zzb = zzactVar;
    }

    static zzact zza() {
        zzact zzactVar = zzb;
        if (zzactVar != null) {
            return zzactVar;
        }
        throw new IllegalStateException("Protobuf runtime is not correctly loaded.");
    }

    static zzact zzb() {
        return zza;
    }
}
