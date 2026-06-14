package com.google.android.gms.internal.p001firebaseauthapi;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzaeu implements zzaeh {
    private final zzaek zza;
    private final String zzb;
    private final Object[] zzc;
    private final int zzd;

    zzaeu(zzaek zzaekVar, String str, Object[] objArr) {
        this.zza = zzaekVar;
        this.zzb = str;
        this.zzc = objArr;
        char cCharAt = str.charAt(0);
        if (cCharAt < 55296) {
            this.zzd = cCharAt;
            return;
        }
        int i = cCharAt & 8191;
        int i2 = 13;
        int i3 = 1;
        while (true) {
            int i4 = i3 + 1;
            char cCharAt2 = str.charAt(i3);
            if (cCharAt2 < 55296) {
                this.zzd = i | (cCharAt2 << i2);
                return;
            } else {
                i |= (cCharAt2 & 8191) << i2;
                i2 += 13;
                i3 = i4;
            }
        }
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzaeh
    public final zzaek zza() {
        return this.zza;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzaeh
    public final boolean zzb() {
        return (this.zzd & 2) == 2;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzaeh
    public final int zzc() {
        return (this.zzd & 1) == 1 ? 1 : 2;
    }

    final String zzd() {
        return this.zzb;
    }

    final Object[] zze() {
        return this.zzc;
    }
}
