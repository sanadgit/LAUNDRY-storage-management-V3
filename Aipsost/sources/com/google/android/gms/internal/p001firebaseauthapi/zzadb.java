package com.google.android.gms.internal.p001firebaseauthapi;

import com.google.android.gms.internal.p001firebaseauthapi.zzadb;
import com.google.android.gms.internal.p001firebaseauthapi.zzadf;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public class zzadb<MessageType extends zzadf<MessageType, BuilderType>, BuilderType extends zzadb<MessageType, BuilderType>> extends zzabl<MessageType, BuilderType> {
    protected zzadf zza;
    private final zzadf zzb;

    protected zzadb(MessageType messagetype) {
        this.zzb = messagetype;
        if (messagetype.zzK()) {
            throw new IllegalArgumentException("Default instance must be immutable.");
        }
        this.zza = messagetype.zzw();
    }

    private static void zza(Object obj, Object obj2) {
        zzaes.zza().zzb(obj.getClass()).zzg(obj, obj2);
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzael
    public final /* synthetic */ zzaek zzL() {
        throw null;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzabl
    /* JADX INFO: renamed from: zzg, reason: merged with bridge method [inline-methods] */
    public final zzadb clone() {
        zzadb zzadbVar = (zzadb) this.zzb.zzj(5, null, null);
        zzadbVar.zza = zzk();
        return zzadbVar;
    }

    public final zzadb zzh(zzadf zzadfVar) {
        if (!this.zzb.equals(zzadfVar)) {
            if (!this.zza.zzK()) {
                zzn();
            }
            zza(this.zza, zzadfVar);
        }
        return this;
    }

    public final MessageType zzi() {
        MessageType messagetype = (MessageType) zzk();
        if (messagetype.zzJ()) {
            return messagetype;
        }
        throw new zzafm(messagetype);
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzaej
    /* JADX INFO: renamed from: zzj, reason: merged with bridge method [inline-methods] */
    public MessageType zzk() {
        if (!this.zza.zzK()) {
            return (MessageType) this.zza;
        }
        this.zza.zzE();
        return (MessageType) this.zza;
    }

    protected final void zzm() {
        if (this.zza.zzK()) {
            return;
        }
        zzn();
    }

    protected void zzn() {
        zzadf zzadfVarZzw = this.zzb.zzw();
        zza(zzadfVarZzw, this.zza);
        this.zza = zzadfVarZzw;
    }
}
