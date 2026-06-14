package com.google.android.gms.internal.p001firebaseauthapi;

import com.google.android.gms.internal.p001firebaseauthapi.zzabl;
import com.google.android.gms.internal.p001firebaseauthapi.zzabm;
import java.io.IOException;
import java.io.OutputStream;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public abstract class zzabm<MessageType extends zzabm<MessageType, BuilderType>, BuilderType extends zzabl<MessageType, BuilderType>> implements zzaek {
    protected int zza = 0;

    int zzn(zzaew zzaewVar) {
        throw null;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzaek
    public final zzacc zzo() {
        try {
            int iZzs = zzs();
            zzacc zzaccVar = zzacc.zzb;
            byte[] bArr = new byte[iZzs];
            zzacn zzacnVarZzG = zzacn.zzG(bArr);
            zzI(zzacnVarZzG);
            zzacnVarZzG.zzI();
            return new zzabz(bArr);
        } catch (IOException e) {
            throw new RuntimeException("Serializing " + getClass().getName() + " to a ByteString threw an IOException (should never happen).", e);
        }
    }

    public final void zzp(OutputStream outputStream) throws IOException {
        zzacn zzacnVarZzH = zzacn.zzH(outputStream, zzacn.zzB(zzs()));
        zzI(zzacnVarZzH);
        zzacnVarZzH.zzN();
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzaek
    public final byte[] zzq() {
        try {
            byte[] bArr = new byte[zzs()];
            zzacn zzacnVarZzG = zzacn.zzG(bArr);
            zzI(zzacnVarZzG);
            zzacnVarZzG.zzI();
            return bArr;
        } catch (IOException e) {
            throw new RuntimeException("Serializing " + getClass().getName() + " to a byte array threw an IOException (should never happen).", e);
        }
    }
}
