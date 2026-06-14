package com.google.android.gms.internal.p001firebaseauthapi;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzabw extends zzabz {
    private final int zzc;

    zzabw(byte[] bArr, int i, int i2) {
        super(bArr);
        zzl(0, i2, bArr.length);
        this.zzc = i2;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzabz, com.google.android.gms.internal.p001firebaseauthapi.zzacc
    final byte zzb(int i) {
        return this.zza[i];
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzabz
    protected final int zzc() {
        return 0;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzabz, com.google.android.gms.internal.p001firebaseauthapi.zzacc
    public final int zzd() {
        return this.zzc;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzabz, com.google.android.gms.internal.p001firebaseauthapi.zzacc
    protected final void zze(byte[] bArr, int i, int i2, int i3) {
        System.arraycopy(this.zza, 0, bArr, 0, i3);
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzabz, com.google.android.gms.internal.p001firebaseauthapi.zzacc
    public final byte zza(int i) {
        int i2 = this.zzc;
        if (((i2 - (i + 1)) | i) >= 0) {
            return this.zza[i];
        }
        if (i < 0) {
            throw new ArrayIndexOutOfBoundsException("Index < 0: " + i);
        }
        throw new ArrayIndexOutOfBoundsException("Index > length: " + i + ", " + i2);
    }
}
