package com.google.android.gms.internal.p001firebaseauthapi;

import java.io.IOException;
import java.io.OutputStream;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzaq implements zzbj {
    private final OutputStream zza;

    private zzaq(OutputStream outputStream) {
        this.zza = outputStream;
    }

    public static zzbj zza(OutputStream outputStream) {
        return new zzaq(outputStream);
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzbj
    public final void zzb(zzmo zzmoVar) throws IOException {
        throw null;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzbj
    public final void zzc(zzof zzofVar) throws IOException {
        try {
            zzofVar.zzp(this.zza);
        } finally {
            this.zza.close();
        }
    }
}
