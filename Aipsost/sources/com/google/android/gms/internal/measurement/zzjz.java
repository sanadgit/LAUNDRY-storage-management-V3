package com.google.android.gms.internal.measurement;

import com.google.android.gms.internal.measurement.zzjz;
import com.google.android.gms.internal.measurement.zzkd;
import java.io.IOException;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-base@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public class zzjz<MessageType extends zzkd<MessageType, BuilderType>, BuilderType extends zzjz<MessageType, BuilderType>> extends zzin<MessageType, BuilderType> {
    protected MessageType zza;
    protected boolean zzb = false;
    private final MessageType zzc;

    protected zzjz(MessageType messagetype) {
        this.zzc = messagetype;
        this.zza = (MessageType) messagetype.zzl(4, null, null);
    }

    private static final void zza(MessageType messagetype, MessageType messagetype2) {
        zzlq.zza().zzb(messagetype.getClass()).zzd(messagetype, messagetype2);
    }

    public final MessageType zzaA() {
        MessageType messagetype = (MessageType) zzaD();
        boolean zBooleanValue = Boolean.TRUE.booleanValue();
        boolean z = true;
        byte bByteValue = ((Byte) messagetype.zzl(1, null, null)).byteValue();
        if (bByteValue != 1) {
            if (bByteValue == 0) {
                z = false;
            } else {
                boolean zZzj = zzlq.zza().zzb(messagetype.getClass()).zzj(messagetype);
                if (zBooleanValue) {
                    messagetype.zzl(2, true != zZzj ? null : messagetype, null);
                }
                z = zZzj;
            }
        }
        if (z) {
            return messagetype;
        }
        throw new zzmg(messagetype);
    }

    public final BuilderType zzaB(MessageType messagetype) {
        if (this.zzb) {
            zzax();
            this.zzb = false;
        }
        zza(this.zza, messagetype);
        return this;
    }

    public final BuilderType zzaC(byte[] bArr, int i, int i2, zzjp zzjpVar) throws zzkn {
        if (this.zzb) {
            zzax();
            this.zzb = false;
        }
        try {
            zzlq.zza().zzb(this.zza.getClass()).zzh(this.zza, bArr, 0, i2, new zzir(zzjpVar));
            return this;
        } catch (zzkn e) {
            throw e;
        } catch (IOException e2) {
            throw new RuntimeException("Reading from byte array should not throw IOException.", e2);
        } catch (IndexOutOfBoundsException e3) {
            throw zzkn.zza();
        }
    }

    @Override // com.google.android.gms.internal.measurement.zzin
    public final /* bridge */ /* synthetic */ zzin zzar(byte[] bArr, int i, int i2) throws zzkn {
        zzaC(bArr, 0, i2, zzjp.zza());
        return this;
    }

    @Override // com.google.android.gms.internal.measurement.zzin
    public final /* bridge */ /* synthetic */ zzin zzas(byte[] bArr, int i, int i2, zzjp zzjpVar) throws zzkn {
        zzaC(bArr, 0, i2, zzjpVar);
        return this;
    }

    @Override // com.google.android.gms.internal.measurement.zzin
    protected final /* bridge */ /* synthetic */ zzin zzat(zzio zzioVar) {
        zzaB((zzkd) zzioVar);
        return this;
    }

    protected void zzax() {
        MessageType messagetype = (MessageType) this.zza.zzl(4, null, null);
        zza(messagetype, this.zza);
        this.zza = messagetype;
    }

    /* JADX WARN: Multi-variable type inference failed */
    @Override // com.google.android.gms.internal.measurement.zzin
    /* JADX INFO: renamed from: zzay, reason: merged with bridge method [inline-methods] and merged with bridge method [inline-methods] */
    public final BuilderType zzaq() {
        BuilderType buildertype = (BuilderType) this.zzc.zzl(5, null, null);
        buildertype.zzaB(zzaD());
        return buildertype;
    }

    @Override // com.google.android.gms.internal.measurement.zzlh
    /* JADX INFO: renamed from: zzaz, reason: merged with bridge method [inline-methods] */
    public MessageType zzaD() {
        if (this.zzb) {
            return this.zza;
        }
        MessageType messagetype = this.zza;
        zzlq.zza().zzb(messagetype.getClass()).zzi(messagetype);
        this.zzb = true;
        return this.zza;
    }

    @Override // com.google.android.gms.internal.measurement.zzlj
    public final /* bridge */ /* synthetic */ zzli zzbL() {
        return this.zzc;
    }
}
