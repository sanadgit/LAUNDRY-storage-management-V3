package com.google.android.gms.measurement.internal;

import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.ResolveInfo;
import android.os.Bundle;
import android.os.RemoteException;
import android.util.Pair;
import com.google.android.gms.common.internal.Preconditions;
import com.google.android.gms.common.internal.safeparcel.AbstractSafeParcelable;
import com.google.android.gms.common.stats.ConnectionTracker;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.concurrent.atomic.AtomicReference;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-impl@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzjk extends zzf {
    private final zzjj zza;
    private zzed zzb;
    private volatile Boolean zzc;
    private final zzal zzd;
    private final zzka zze;
    private final List<Runnable> zzf;
    private final zzal zzg;

    protected zzjk(zzfu zzfuVar) {
        super(zzfuVar);
        this.zzf = new ArrayList();
        this.zze = new zzka(zzfuVar.zzay());
        this.zza = new zzjj(this);
        this.zzd = new zziu(this, zzfuVar);
        this.zzg = new zziw(this, zzfuVar);
    }

    static /* synthetic */ void zzJ(zzjk zzjkVar, ComponentName componentName) {
        zzjkVar.zzg();
        if (zzjkVar.zzb != null) {
            zzjkVar.zzb = null;
            zzjkVar.zzs.zzau().zzk().zzb("Disconnected from device MeasurementService", componentName);
            zzjkVar.zzg();
            zzjkVar.zzB();
        }
    }

    static /* synthetic */ zzed zzK(zzjk zzjkVar, zzed zzedVar) {
        zzjkVar.zzb = null;
        return null;
    }

    private final boolean zzO() {
        this.zzs.zzat();
        return true;
    }

    /* JADX INFO: Access modifiers changed from: private */
    public final void zzP() {
        zzg();
        this.zze.zza();
        zzal zzalVar = this.zzd;
        this.zzs.zzc();
        zzalVar.zzb(zzea.zzI.zzb(null).longValue());
    }

    private final void zzQ(Runnable runnable) throws IllegalStateException {
        zzg();
        if (zzh()) {
            runnable.run();
            return;
        }
        int size = this.zzf.size();
        this.zzs.zzc();
        if (size >= 1000) {
            this.zzs.zzau().zzb().zza("Discarding data. Max runnable queue size reached");
            return;
        }
        this.zzf.add(runnable);
        this.zzg.zzb(60000L);
        zzB();
    }

    /* JADX INFO: Access modifiers changed from: private */
    public final void zzR() {
        zzg();
        this.zzs.zzau().zzk().zzb("Processing queued up service tasks", Integer.valueOf(this.zzf.size()));
        Iterator<Runnable> it = this.zzf.iterator();
        while (it.hasNext()) {
            try {
                it.next().run();
            } catch (RuntimeException e) {
                this.zzs.zzau().zzb().zzb("Task exception while flushing queue", e);
            }
        }
        this.zzf.clear();
        this.zzg.zzd();
    }

    private final zzp zzS(boolean z) {
        Pair<String, Long> pairZzb;
        this.zzs.zzat();
        zzee zzeeVarZzA = this.zzs.zzA();
        String string = null;
        if (z) {
            zzem zzemVarZzau = this.zzs.zzau();
            if (zzemVarZzau.zzs.zzd().zzb != null && (pairZzb = zzemVarZzau.zzs.zzd().zzb.zzb()) != null && pairZzb != zzfb.zza) {
                String strValueOf = String.valueOf(pairZzb.second);
                String str = (String) pairZzb.first;
                StringBuilder sb = new StringBuilder(String.valueOf(strValueOf).length() + 1 + String.valueOf(str).length());
                sb.append(strValueOf);
                sb.append(":");
                sb.append(str);
                string = sb.toString();
            }
        }
        return zzeeVarZzA.zzh(string);
    }

    public final void zzA(Bundle bundle) {
        zzg();
        zzb();
        zzQ(new zzit(this, zzS(false), bundle));
    }

    final void zzB() {
        zzg();
        zzb();
        if (zzh()) {
            return;
        }
        if (zzD()) {
            this.zza.zzc();
            return;
        }
        if (this.zzs.zzc().zzy()) {
            return;
        }
        this.zzs.zzat();
        List<ResolveInfo> listQueryIntentServices = this.zzs.zzax().getPackageManager().queryIntentServices(new Intent().setClassName(this.zzs.zzax(), "com.google.android.gms.measurement.AppMeasurementService"), 65536);
        if (listQueryIntentServices == null || listQueryIntentServices.size() <= 0) {
            this.zzs.zzau().zzb().zza("Unable to use remote or local measurement implementation. Please register the AppMeasurementService service in the app manifest");
            return;
        }
        Intent intent = new Intent("com.google.android.gms.measurement.START");
        Context contextZzax = this.zzs.zzax();
        this.zzs.zzat();
        intent.setComponent(new ComponentName(contextZzax, "com.google.android.gms.measurement.AppMeasurementService"));
        this.zza.zza(intent);
    }

    final Boolean zzC() {
        return this.zzc;
    }

    final boolean zzD() {
        zzg();
        zzb();
        if (this.zzc == null) {
            zzg();
            zzb();
            zzfb zzfbVarZzd = this.zzs.zzd();
            zzfbVarZzd.zzg();
            boolean z = false;
            Boolean boolValueOf = !zzfbVarZzd.zzd().contains("use_service") ? null : Boolean.valueOf(zzfbVarZzd.zzd().getBoolean("use_service", false));
            if (boolValueOf == null || !boolValueOf.booleanValue()) {
                this.zzs.zzat();
                if (this.zzs.zzA().zzn() != 1) {
                    this.zzs.zzau().zzk().zza("Checking service availability");
                    int iZzaa = this.zzs.zzl().zzaa(12451000);
                    switch (iZzaa) {
                        case 0:
                            this.zzs.zzau().zzk().zza("Service available");
                            z = true;
                            break;
                        case 1:
                            this.zzs.zzau().zzk().zza("Service missing");
                            break;
                        case 2:
                            this.zzs.zzau().zzj().zza("Service container out of date");
                            if (this.zzs.zzl().zzZ() >= 17443) {
                                z = boolValueOf == null;
                                z = false;
                            }
                            break;
                        case 3:
                            this.zzs.zzau().zze().zza("Service disabled");
                            z = false;
                            break;
                        case 9:
                            this.zzs.zzau().zze().zza("Service invalid");
                            z = false;
                            break;
                        case 18:
                            this.zzs.zzau().zze().zza("Service updating");
                            z = true;
                            break;
                        default:
                            this.zzs.zzau().zze().zzb("Unexpected service status", Integer.valueOf(iZzaa));
                            z = false;
                            break;
                    }
                } else {
                    z = true;
                }
                if (!z && this.zzs.zzc().zzy()) {
                    this.zzs.zzau().zzb().zza("No way to upload. Consider using the full version of Analytics");
                } else if (z) {
                    zzfb zzfbVarZzd2 = this.zzs.zzd();
                    zzfbVarZzd2.zzg();
                    SharedPreferences.Editor editorEdit = zzfbVarZzd2.zzd().edit();
                    editorEdit.putBoolean("use_service", z);
                    editorEdit.apply();
                }
                z = z;
            }
            this.zzc = Boolean.valueOf(z);
        }
        return this.zzc.booleanValue();
    }

    protected final void zzE(zzed zzedVar) {
        zzg();
        Preconditions.checkNotNull(zzedVar);
        this.zzb = zzedVar;
        zzP();
        zzR();
    }

    public final void zzF() {
        zzg();
        zzb();
        this.zza.zzb();
        try {
            ConnectionTracker.getInstance().unbindService(this.zzs.zzax(), this.zza);
        } catch (IllegalArgumentException e) {
        } catch (IllegalStateException e2) {
        }
        this.zzb = null;
    }

    public final void zzG(com.google.android.gms.internal.measurement.zzcf zzcfVar, zzas zzasVar, String str) {
        zzg();
        zzb();
        if (this.zzs.zzl().zzaa(12451000) == 0) {
            zzQ(new zziv(this, zzasVar, str, zzcfVar));
        } else {
            this.zzs.zzau().zze().zza("Not bundling data. Service unavailable or out of date");
            this.zzs.zzl().zzag(zzcfVar, new byte[0]);
        }
    }

    final boolean zzH() {
        zzg();
        zzb();
        return !zzD() || this.zzs.zzl().zzZ() >= zzea.zzau.zzb(null).intValue();
    }

    @Override // com.google.android.gms.measurement.internal.zzf
    protected final boolean zze() {
        return false;
    }

    public final boolean zzh() {
        zzg();
        zzb();
        return this.zzb != null;
    }

    protected final void zzi() {
        zzg();
        zzb();
        zzQ(new zzix(this, zzS(true)));
    }

    protected final void zzj(boolean z) {
        zzg();
        zzb();
        if (z) {
            zzO();
            this.zzs.zzn().zzh();
        }
        if (zzH()) {
            zzQ(new zziy(this, zzS(false)));
        }
    }

    final void zzk(zzed zzedVar, AbstractSafeParcelable abstractSafeParcelable, zzp zzpVar) {
        int size;
        zzg();
        zzb();
        zzO();
        this.zzs.zzc();
        int i = 0;
        int i2 = 100;
        while (i < 1001 && i2 == 100) {
            ArrayList arrayList = new ArrayList();
            List<AbstractSafeParcelable> listZzl = this.zzs.zzn().zzl(100);
            if (listZzl != null) {
                arrayList.addAll(listZzl);
                size = listZzl.size();
            } else {
                size = 0;
            }
            if (abstractSafeParcelable != null && size < 100) {
                arrayList.add(abstractSafeParcelable);
            }
            int size2 = arrayList.size();
            for (int i3 = 0; i3 < size2; i3++) {
                AbstractSafeParcelable abstractSafeParcelable2 = (AbstractSafeParcelable) arrayList.get(i3);
                if (abstractSafeParcelable2 instanceof zzas) {
                    try {
                        zzedVar.zzd((zzas) abstractSafeParcelable2, zzpVar);
                    } catch (RemoteException e) {
                        this.zzs.zzau().zzb().zzb("Failed to send event to the service", e);
                    }
                } else if (abstractSafeParcelable2 instanceof zzkq) {
                    try {
                        zzedVar.zze((zzkq) abstractSafeParcelable2, zzpVar);
                    } catch (RemoteException e2) {
                        this.zzs.zzau().zzb().zzb("Failed to send user property to the service", e2);
                    }
                } else if (abstractSafeParcelable2 instanceof zzaa) {
                    try {
                        zzedVar.zzm((zzaa) abstractSafeParcelable2, zzpVar);
                    } catch (RemoteException e3) {
                        this.zzs.zzau().zzb().zzb("Failed to send conditional user property to the service", e3);
                    }
                } else {
                    this.zzs.zzau().zzb().zza("Discarding data. Unrecognized parcel type.");
                }
            }
            i++;
            i2 = size;
        }
    }

    protected final void zzl(zzas zzasVar, String str) {
        Preconditions.checkNotNull(zzasVar);
        zzg();
        zzb();
        zzO();
        zzQ(new zziz(this, true, zzS(true), this.zzs.zzn().zzi(zzasVar), zzasVar, str));
    }

    protected final void zzm(zzaa zzaaVar) {
        Preconditions.checkNotNull(zzaaVar);
        zzg();
        zzb();
        this.zzs.zzat();
        zzQ(new zzja(this, true, zzS(true), this.zzs.zzn().zzk(zzaaVar), new zzaa(zzaaVar), zzaaVar));
    }

    protected final void zzn(AtomicReference<List<zzaa>> atomicReference, String str, String str2, String str3) {
        zzg();
        zzb();
        zzQ(new zzjb(this, atomicReference, null, str2, str3, zzS(false)));
    }

    protected final void zzo(com.google.android.gms.internal.measurement.zzcf zzcfVar, String str, String str2) {
        zzg();
        zzb();
        zzQ(new zzjc(this, str, str2, zzS(false), zzcfVar));
    }

    protected final void zzq(AtomicReference<List<zzkq>> atomicReference, String str, String str2, String str3, boolean z) {
        zzg();
        zzb();
        zzQ(new zzjd(this, atomicReference, null, str2, str3, zzS(false), z));
    }

    protected final void zzr(com.google.android.gms.internal.measurement.zzcf zzcfVar, String str, String str2, boolean z) {
        zzg();
        zzb();
        zzQ(new zzil(this, str, str2, zzS(false), z, zzcfVar));
    }

    protected final void zzs(zzkq zzkqVar) {
        zzg();
        zzb();
        zzO();
        zzQ(new zzim(this, zzS(true), this.zzs.zzn().zzj(zzkqVar), zzkqVar));
    }

    protected final void zzt(AtomicReference<List<zzkq>> atomicReference, boolean z) {
        zzg();
        zzb();
        zzQ(new zzin(this, atomicReference, zzS(false), z));
    }

    protected final void zzu() {
        zzg();
        zzb();
        zzp zzpVarZzS = zzS(false);
        zzO();
        this.zzs.zzn().zzh();
        zzQ(new zzio(this, zzpVarZzS));
    }

    public final void zzv(AtomicReference<String> atomicReference) {
        zzg();
        zzb();
        zzQ(new zzip(this, atomicReference, zzS(false)));
    }

    public final void zzx(com.google.android.gms.internal.measurement.zzcf zzcfVar) {
        zzg();
        zzb();
        zzQ(new zziq(this, zzS(false), zzcfVar));
    }

    protected final void zzy() {
        zzg();
        zzb();
        zzp zzpVarZzS = zzS(true);
        this.zzs.zzn().zzm();
        zzQ(new zzir(this, zzpVarZzS));
    }

    protected final void zzz(zzid zzidVar) {
        zzg();
        zzb();
        zzQ(new zzis(this, zzidVar));
    }
}
