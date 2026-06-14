package com.google.android.gms.internal.p001firebaseauthapi;

import java.nio.ByteBuffer;
import java.security.GeneralSecurityException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzbp {
    private final Class zza;
    private zzbq zzc;
    private ConcurrentMap zzb = new ConcurrentHashMap();
    private zzjc zzd = zzjc.zza;

    /* synthetic */ zzbp(Class cls, zzbo zzboVar) {
        this.zza = cls;
    }

    private final zzbp zze(Object obj, zzoe zzoeVar, boolean z) throws GeneralSecurityException {
        byte[] bArrArray;
        if (this.zzb == null) {
            throw new IllegalStateException("addPrimitive cannot be called after build");
        }
        if (zzoeVar.zzk() != 3) {
            throw new GeneralSecurityException("only ENABLED key is allowed");
        }
        ConcurrentMap concurrentMap = this.zzb;
        Integer numValueOf = Integer.valueOf(zzoeVar.zza());
        if (zzoeVar.zze() == zzoy.RAW) {
            numValueOf = null;
        }
        zzaw zzawVarZza = zzgn.zzb().zza(zzgy.zza(zzoeVar.zzb().zzf(), zzoeVar.zzb().zze(), zzoeVar.zzb().zzb(), zzoeVar.zze(), numValueOf), zzca.zza());
        switch (zzoeVar.zze().ordinal()) {
            case 1:
                bArrArray = ByteBuffer.allocate(5).put((byte) 1).putInt(zzoeVar.zza()).array();
                break;
            case 2:
            case 4:
                bArrArray = ByteBuffer.allocate(5).put((byte) 0).putInt(zzoeVar.zza()).array();
                break;
            case 3:
                bArrArray = zzas.zza;
                break;
            default:
                throw new GeneralSecurityException("unknown output prefix type");
        }
        zzbq zzbqVar = new zzbq(obj, bArrArray, zzoeVar.zzk(), zzoeVar.zze(), zzoeVar.zza(), zzawVarZza);
        ArrayList arrayList = new ArrayList();
        arrayList.add(zzbqVar);
        zzbs zzbsVar = new zzbs(zzbqVar.zzf(), null);
        List list = (List) concurrentMap.put(zzbsVar, Collections.unmodifiableList(arrayList));
        if (list != null) {
            ArrayList arrayList2 = new ArrayList();
            arrayList2.addAll(list);
            arrayList2.add(zzbqVar);
            concurrentMap.put(zzbsVar, Collections.unmodifiableList(arrayList2));
        }
        if (z) {
            if (this.zzc != null) {
                throw new IllegalStateException("you cannot set two primary primitives");
            }
            this.zzc = zzbqVar;
        }
        return this;
    }

    public final zzbp zza(Object obj, zzoe zzoeVar) throws GeneralSecurityException {
        zze(obj, zzoeVar, true);
        return this;
    }

    public final zzbp zzb(Object obj, zzoe zzoeVar) throws GeneralSecurityException {
        zze(obj, zzoeVar, false);
        return this;
    }

    public final zzbp zzc(zzjc zzjcVar) {
        if (this.zzb == null) {
            throw new IllegalStateException("setAnnotations cannot be called after build");
        }
        this.zzd = zzjcVar;
        return this;
    }

    public final zzbu zzd() throws GeneralSecurityException {
        ConcurrentMap concurrentMap = this.zzb;
        if (concurrentMap == null) {
            throw new IllegalStateException("build cannot be called twice");
        }
        zzbu zzbuVar = new zzbu(concurrentMap, this.zzc, this.zzd, this.zza, null);
        this.zzb = null;
        return zzbuVar;
    }
}
