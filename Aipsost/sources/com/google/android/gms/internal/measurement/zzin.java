package com.google.android.gms.internal.measurement;

import com.google.android.gms.internal.measurement.zzin;
import com.google.android.gms.internal.measurement.zzio;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-base@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public abstract class zzin<MessageType extends zzio<MessageType, BuilderType>, BuilderType extends zzin<MessageType, BuilderType>> implements zzlh {
    @Override // 
    public abstract BuilderType zzaq();

    public BuilderType zzar(byte[] bArr, int i, int i2) throws zzkn {
        throw null;
    }

    public BuilderType zzas(byte[] bArr, int i, int i2, zzjp zzjpVar) throws zzkn {
        throw null;
    }

    protected abstract BuilderType zzat(MessageType messagetype);

    @Override // com.google.android.gms.internal.measurement.zzlh
    public final /* bridge */ /* synthetic */ zzlh zzau(zzli zzliVar) {
        if (zzbL().getClass().isInstance(zzliVar)) {
            return zzat((zzio) zzliVar);
        }
        throw new IllegalArgumentException("mergeFrom(MessageLite) can only merge messages of the same type.");
    }

    @Override // com.google.android.gms.internal.measurement.zzlh
    public final /* bridge */ /* synthetic */ zzlh zzav(byte[] bArr, zzjp zzjpVar) throws zzkn {
        return zzas(bArr, 0, bArr.length, zzjpVar);
    }

    @Override // com.google.android.gms.internal.measurement.zzlh
    public final /* bridge */ /* synthetic */ zzlh zzaw(byte[] bArr) throws zzkn {
        return zzar(bArr, 0, bArr.length);
    }
}
