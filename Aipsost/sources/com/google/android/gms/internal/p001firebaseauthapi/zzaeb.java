package com.google.android.gms.internal.p001firebaseauthapi;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzaeb implements zzaei {
    private final zzaei[] zza;

    zzaeb(zzaei... zzaeiVarArr) {
        this.zza = zzaeiVarArr;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzaei
    public final zzaeh zzb(Class cls) {
        zzaei[] zzaeiVarArr = this.zza;
        for (int i = 0; i < 2; i++) {
            zzaei zzaeiVar = zzaeiVarArr[i];
            if (zzaeiVar.zzc(cls)) {
                return zzaeiVar.zzb(cls);
            }
        }
        throw new UnsupportedOperationException("No factory is available for message type: ".concat(String.valueOf(cls.getName())));
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzaei
    public final boolean zzc(Class cls) {
        zzaei[] zzaeiVarArr = this.zza;
        for (int i = 0; i < 2; i++) {
            if (zzaeiVarArr[i].zzc(cls)) {
                return true;
            }
        }
        return false;
    }
}
