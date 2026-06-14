package com.google.android.gms.internal.measurement;

import android.content.Context;
import android.os.Bundle;
import android.util.Log;
import com.google.android.gms.common.internal.Preconditions;
import com.google.android.gms.dynamic.ObjectWrapper;
import com.google.android.gms.dynamite.DynamiteModule;
import com.google.android.gms.dynamite.descriptors.com.google.android.gms.measurement.dynamite.ModuleDescriptor;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-sdk-api@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzcx extends zzdt {
    final /* synthetic */ String zza;
    final /* synthetic */ String zzb;
    final /* synthetic */ Context zzc;
    final /* synthetic */ Bundle zzd;
    final /* synthetic */ zzee zze;

    /* JADX WARN: 'super' call moved to the top of the method (can break code semantics) */
    zzcx(zzee zzeeVar, String str, String str2, Context context, Bundle bundle) {
        super(zzeeVar, true);
        this.zze = zzeeVar;
        this.zza = str;
        this.zzb = str2;
        this.zzc = context;
        this.zzd = bundle;
    }

    @Override // com.google.android.gms.internal.measurement.zzdt
    public final void zza() {
        String str;
        String str2;
        String str3;
        try {
            zzee zzeeVar = this.zze;
            if (zzee.zzV(this.zza, this.zzb)) {
                str3 = this.zzb;
                str2 = this.zza;
                str = this.zze.zzd;
            } else {
                str = null;
                str2 = null;
                str3 = null;
            }
            Preconditions.checkNotNull(this.zzc);
            zzee zzeeVar2 = this.zze;
            zzeeVar2.zzj = zzeeVar2.zzc(this.zzc, true);
            if (this.zze.zzj == null) {
                Log.w(this.zze.zzd, "Failed to connect to measurement client.");
                return;
            }
            int localVersion = DynamiteModule.getLocalVersion(this.zzc, ModuleDescriptor.MODULE_ID);
            ((zzcc) Preconditions.checkNotNull(this.zze.zzj)).initialize(ObjectWrapper.wrap(this.zzc), new zzcl(42004L, Math.max(localVersion, r0), DynamiteModule.getRemoteVersion(this.zzc, ModuleDescriptor.MODULE_ID) < localVersion, str, str2, str3, this.zzd, com.google.android.gms.measurement.internal.zzfm.zza(this.zzc)), this.zzh);
        } catch (Exception e) {
            this.zze.zzT(e, true, false);
        }
    }
}
