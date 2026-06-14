package com.google.android.gms.measurement.internal;

import android.content.ContentValues;
import android.database.sqlite.SQLiteException;
import android.os.Binder;
import android.os.Bundle;
import android.text.TextUtils;
import com.google.android.gms.common.GooglePlayServicesUtilLight;
import com.google.android.gms.common.GoogleSignatureVerifier;
import com.google.android.gms.common.internal.Preconditions;
import com.google.android.gms.common.util.UidVerifier;
import com.google.android.gms.internal.measurement.zzpt;
import com.google.firebase.messaging.Constants;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.concurrent.ExecutionException;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzgm extends zzec {
    private final zzkn zza;
    private Boolean zzb;
    private String zzc;

    public zzgm(zzkn zzknVar, String str) {
        Preconditions.checkNotNull(zzknVar);
        this.zza = zzknVar;
        this.zzc = null;
    }

    private final void zzA(zzp zzpVar, boolean z) {
        Preconditions.checkNotNull(zzpVar);
        Preconditions.checkNotEmpty(zzpVar.zza);
        zzB(zzpVar.zza, false);
        this.zza.zzq().zzA(zzpVar.zzb, zzpVar.zzq, zzpVar.zzu);
    }

    private final void zzB(String str, boolean z) {
        if (TextUtils.isEmpty(str)) {
            this.zza.zzau().zzb().zza("Measurement Service called without app package");
            throw new SecurityException("Measurement Service called without app package");
        }
        if (z) {
            try {
                if (this.zzb == null) {
                    boolean z2 = "com.google.android.gms".equals(this.zzc) || UidVerifier.isGooglePlayServicesUid(this.zza.zzax(), Binder.getCallingUid()) || GoogleSignatureVerifier.getInstance(this.zza.zzax()).isUidGoogleSigned(Binder.getCallingUid());
                    this.zzb = Boolean.valueOf(z2);
                }
                if (this.zzb.booleanValue()) {
                    return;
                }
            } catch (SecurityException e) {
                this.zza.zzau().zzb().zzb("Measurement Service called with invalid calling package. appId", zzem.zzl(str));
                throw e;
            }
        }
        if (this.zzc == null && GooglePlayServicesUtilLight.uidHasPackageName(this.zza.zzax(), Binder.getCallingUid(), str)) {
            this.zzc = str;
        }
        if (str.equals(this.zzc)) {
        } else {
            throw new SecurityException(String.format("Unknown calling package name '%s'.", str));
        }
    }

    /* JADX INFO: Access modifiers changed from: private */
    public final void zzz(zzas zzasVar, zzp zzpVar) {
        this.zza.zzG();
        this.zza.zzy(zzasVar, zzpVar);
    }

    final void zzb(zzas zzasVar, zzp zzpVar) {
        if (!this.zza.zzf().zzh(zzpVar.zza)) {
            zzz(zzasVar, zzpVar);
            return;
        }
        this.zza.zzau().zzk().zzb("EES config found for", zzpVar.zza);
        zzfl zzflVarZzf = this.zza.zzf();
        String str = zzpVar.zza;
        zzpt.zzb();
        com.google.android.gms.internal.measurement.zzc zzcVar = null;
        if (zzflVarZzf.zzs.zzc().zzn(null, zzea.zzaD) && !TextUtils.isEmpty(str)) {
            zzcVar = zzflVarZzf.zza.get(str);
        }
        if (zzcVar == null) {
            this.zza.zzau().zzk().zzb("EES not loaded for", zzpVar.zza);
            zzz(zzasVar, zzpVar);
            return;
        }
        try {
            Bundle bundleZzf = zzasVar.zzb.zzf();
            HashMap map = new HashMap();
            for (String str2 : bundleZzf.keySet()) {
                Object obj = bundleZzf.get(str2);
                if (obj != null) {
                    map.put(str2, obj);
                }
            }
            String strZza = zzgr.zza(zzasVar.zza);
            if (strZza == null) {
                strZza = zzasVar.zza;
            }
            if (zzcVar.zzb(new com.google.android.gms.internal.measurement.zzaa(strZza, zzasVar.zzd, map))) {
                if (zzcVar.zzc()) {
                    this.zza.zzau().zzk().zzb("EES edited event", zzasVar.zza);
                    zzz(zzkp.zzx(zzcVar.zze().zzc()), zzpVar);
                } else {
                    zzz(zzasVar, zzpVar);
                }
                if (zzcVar.zzd()) {
                    for (com.google.android.gms.internal.measurement.zzaa zzaaVar : zzcVar.zze().zzf()) {
                        this.zza.zzau().zzk().zzb("EES logging created event", zzaaVar.zzb());
                        zzz(zzkp.zzx(zzaaVar), zzpVar);
                    }
                    return;
                }
                return;
            }
        } catch (com.google.android.gms.internal.measurement.zzd e) {
            this.zza.zzau().zzb().zzc("EES error. appId, eventName", zzpVar.zzb, zzasVar.zza);
        }
        this.zza.zzau().zzk().zzb("EES was not applied to event", zzasVar.zza);
        zzz(zzasVar, zzpVar);
    }

    final zzas zzc(zzas zzasVar, zzp zzpVar) {
        zzaq zzaqVar;
        if (Constants.ScionAnalytics.EVENT_FIREBASE_CAMPAIGN.equals(zzasVar.zza) && (zzaqVar = zzasVar.zzb) != null && zzaqVar.zze() != 0) {
            String strZzd = zzasVar.zzb.zzd("_cis");
            if ("referrer broadcast".equals(strZzd) || "referrer API".equals(strZzd)) {
                this.zza.zzau().zzi().zzb("Event has been filtered ", zzasVar.toString());
                return new zzas("_cmpx", zzasVar.zzb, zzasVar.zzc, zzasVar.zzd);
            }
        }
        return zzasVar;
    }

    @Override // com.google.android.gms.measurement.internal.zzed
    public final void zzd(zzas zzasVar, zzp zzpVar) {
        Preconditions.checkNotNull(zzasVar);
        zzA(zzpVar, false);
        zzv(new zzgf(this, zzasVar, zzpVar));
    }

    @Override // com.google.android.gms.measurement.internal.zzed
    public final void zze(zzkq zzkqVar, zzp zzpVar) {
        Preconditions.checkNotNull(zzkqVar);
        zzA(zzpVar, false);
        zzv(new zzgi(this, zzkqVar, zzpVar));
    }

    @Override // com.google.android.gms.measurement.internal.zzed
    public final void zzf(zzp zzpVar) {
        zzA(zzpVar, false);
        zzv(new zzgk(this, zzpVar));
    }

    @Override // com.google.android.gms.measurement.internal.zzed
    public final void zzg(zzas zzasVar, String str, String str2) {
        Preconditions.checkNotNull(zzasVar);
        Preconditions.checkNotEmpty(str);
        zzB(str, true);
        zzv(new zzgg(this, zzasVar, str));
    }

    @Override // com.google.android.gms.measurement.internal.zzed
    public final void zzh(zzp zzpVar) {
        zzA(zzpVar, false);
        zzv(new zzgd(this, zzpVar));
    }

    @Override // com.google.android.gms.measurement.internal.zzed
    public final List<zzkq> zzi(zzp zzpVar, boolean z) {
        zzA(zzpVar, false);
        String str = zzpVar.zza;
        Preconditions.checkNotNull(str);
        try {
            List<zzks> list = (List) this.zza.zzav().zze(new zzgj(this, str)).get();
            ArrayList arrayList = new ArrayList(list.size());
            for (zzks zzksVar : list) {
                if (z || !zzku.zzR(zzksVar.zzc)) {
                    arrayList.add(new zzkq(zzksVar));
                }
            }
            return arrayList;
        } catch (InterruptedException | ExecutionException e) {
            this.zza.zzau().zzb().zzc("Failed to get user properties. appId", zzem.zzl(zzpVar.zza), e);
            return null;
        }
    }

    @Override // com.google.android.gms.measurement.internal.zzed
    public final byte[] zzj(zzas zzasVar, String str) {
        Preconditions.checkNotEmpty(str);
        Preconditions.checkNotNull(zzasVar);
        zzB(str, true);
        this.zza.zzau().zzj().zzb("Log and bundle. event", this.zza.zzo().zzc(zzasVar.zza));
        long jNanoTime = this.zza.zzay().nanoTime() / 1000000;
        try {
            byte[] bArr = (byte[]) this.zza.zzav().zzf(new zzgh(this, zzasVar, str)).get();
            if (bArr == null) {
                this.zza.zzau().zzb().zzb("Log and bundle returned null. appId", zzem.zzl(str));
                bArr = new byte[0];
            }
            this.zza.zzau().zzj().zzd("Log and bundle processed. event, size, time_ms", this.zza.zzo().zzc(zzasVar.zza), Integer.valueOf(bArr.length), Long.valueOf((this.zza.zzay().nanoTime() / 1000000) - jNanoTime));
            return bArr;
        } catch (InterruptedException | ExecutionException e) {
            this.zza.zzau().zzb().zzd("Failed to log and bundle. appId, event, error", zzem.zzl(str), this.zza.zzo().zzc(zzasVar.zza), e);
            return null;
        }
    }

    @Override // com.google.android.gms.measurement.internal.zzed
    public final void zzk(long j, String str, String str2, String str3) {
        zzv(new zzgl(this, str2, str3, str, j));
    }

    @Override // com.google.android.gms.measurement.internal.zzed
    public final String zzl(zzp zzpVar) {
        zzA(zzpVar, false);
        return this.zza.zzU(zzpVar);
    }

    @Override // com.google.android.gms.measurement.internal.zzed
    public final void zzm(zzaa zzaaVar, zzp zzpVar) {
        Preconditions.checkNotNull(zzaaVar);
        Preconditions.checkNotNull(zzaaVar.zzc);
        zzA(zzpVar, false);
        zzaa zzaaVar2 = new zzaa(zzaaVar);
        zzaaVar2.zza = zzpVar.zza;
        zzv(new zzfw(this, zzaaVar2, zzpVar));
    }

    @Override // com.google.android.gms.measurement.internal.zzed
    public final void zzn(zzaa zzaaVar) {
        Preconditions.checkNotNull(zzaaVar);
        Preconditions.checkNotNull(zzaaVar.zzc);
        Preconditions.checkNotEmpty(zzaaVar.zza);
        zzB(zzaaVar.zza, true);
        zzv(new zzfx(this, new zzaa(zzaaVar)));
    }

    @Override // com.google.android.gms.measurement.internal.zzed
    public final List<zzkq> zzo(String str, String str2, boolean z, zzp zzpVar) {
        zzA(zzpVar, false);
        String str3 = zzpVar.zza;
        Preconditions.checkNotNull(str3);
        try {
            List<zzks> list = (List) this.zza.zzav().zze(new zzfy(this, str3, str, str2)).get();
            ArrayList arrayList = new ArrayList(list.size());
            for (zzks zzksVar : list) {
                if (z || !zzku.zzR(zzksVar.zzc)) {
                    arrayList.add(new zzkq(zzksVar));
                }
            }
            return arrayList;
        } catch (InterruptedException | ExecutionException e) {
            this.zza.zzau().zzb().zzc("Failed to query user properties. appId", zzem.zzl(zzpVar.zza), e);
            return Collections.emptyList();
        }
    }

    @Override // com.google.android.gms.measurement.internal.zzed
    public final List<zzkq> zzp(String str, String str2, String str3, boolean z) {
        zzB(str, true);
        try {
            List<zzks> list = (List) this.zza.zzav().zze(new zzfz(this, str, str2, str3)).get();
            ArrayList arrayList = new ArrayList(list.size());
            for (zzks zzksVar : list) {
                if (z || !zzku.zzR(zzksVar.zzc)) {
                    arrayList.add(new zzkq(zzksVar));
                }
            }
            return arrayList;
        } catch (InterruptedException | ExecutionException e) {
            this.zza.zzau().zzb().zzc("Failed to get user properties as. appId", zzem.zzl(str), e);
            return Collections.emptyList();
        }
    }

    @Override // com.google.android.gms.measurement.internal.zzed
    public final List<zzaa> zzq(String str, String str2, zzp zzpVar) {
        zzA(zzpVar, false);
        String str3 = zzpVar.zza;
        Preconditions.checkNotNull(str3);
        try {
            return (List) this.zza.zzav().zze(new zzga(this, str3, str, str2)).get();
        } catch (InterruptedException | ExecutionException e) {
            this.zza.zzau().zzb().zzb("Failed to get conditional user properties", e);
            return Collections.emptyList();
        }
    }

    @Override // com.google.android.gms.measurement.internal.zzed
    public final List<zzaa> zzr(String str, String str2, String str3) {
        zzB(str, true);
        try {
            return (List) this.zza.zzav().zze(new zzgb(this, str, str2, str3)).get();
        } catch (InterruptedException | ExecutionException e) {
            this.zza.zzau().zzb().zzb("Failed to get conditional user properties as", e);
            return Collections.emptyList();
        }
    }

    @Override // com.google.android.gms.measurement.internal.zzed
    public final void zzs(zzp zzpVar) {
        Preconditions.checkNotEmpty(zzpVar.zza);
        zzB(zzpVar.zza, false);
        zzv(new zzgc(this, zzpVar));
    }

    @Override // com.google.android.gms.measurement.internal.zzed
    public final void zzt(final Bundle bundle, zzp zzpVar) {
        zzA(zzpVar, false);
        final String str = zzpVar.zza;
        Preconditions.checkNotNull(str);
        zzv(new Runnable(this, str, bundle) { // from class: com.google.android.gms.measurement.internal.zzfv
            private final zzgm zza;
            private final String zzb;
            private final Bundle zzc;

            {
                this.zza = this;
                this.zzb = str;
                this.zzc = bundle;
            }

            @Override // java.lang.Runnable
            public final void run() {
                this.zza.zzw(this.zzb, this.zzc);
            }
        });
    }

    @Override // com.google.android.gms.measurement.internal.zzed
    public final void zzu(zzp zzpVar) {
        Preconditions.checkNotEmpty(zzpVar.zza);
        Preconditions.checkNotNull(zzpVar.zzv);
        zzge zzgeVar = new zzge(this, zzpVar);
        Preconditions.checkNotNull(zzgeVar);
        if (this.zza.zzav().zzd()) {
            zzgeVar.run();
        } else {
            this.zza.zzav().zzj(zzgeVar);
        }
    }

    final void zzv(Runnable runnable) {
        Preconditions.checkNotNull(runnable);
        if (this.zza.zzav().zzd()) {
            runnable.run();
        } else {
            this.zza.zzav().zzh(runnable);
        }
    }

    final /* synthetic */ void zzw(String str, Bundle bundle) {
        zzai zzaiVarZzi = this.zza.zzi();
        zzaiVarZzi.zzg();
        zzaiVarZzi.zzZ();
        byte[] bArrZzbp = zzaiVarZzi.zzf.zzm().zzf(new zzan(zzaiVarZzi.zzs, "", str, "dep", 0L, 0L, bundle)).zzbp();
        zzaiVarZzi.zzs.zzau().zzk().zzc("Saving default event parameters, appId, data size", zzaiVarZzi.zzs.zzm().zzc(str), Integer.valueOf(bArrZzbp.length));
        ContentValues contentValues = new ContentValues();
        contentValues.put("app_id", str);
        contentValues.put("parameters", bArrZzbp);
        try {
            if (zzaiVarZzi.zze().insertWithOnConflict("default_event_params", null, contentValues, 5) == -1) {
                zzaiVarZzi.zzs.zzau().zzb().zzb("Failed to insert default event parameters (got -1). appId", zzem.zzl(str));
            }
        } catch (SQLiteException e) {
            zzaiVarZzi.zzs.zzau().zzb().zzc("Error storing default event parameters. appId", zzem.zzl(str), e);
        }
    }
}
