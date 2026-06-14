package com.google.android.gms.measurement.internal;

import android.app.Application;
import android.content.Context;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.os.Bundle;
import android.text.TextUtils;
import android.util.Pair;
import com.google.android.gms.common.internal.Preconditions;
import com.google.android.gms.common.util.Clock;
import com.google.android.gms.common.util.DefaultClock;
import java.net.URL;
import java.util.concurrent.atomic.AtomicInteger;
import org.checkerframework.dataflow.qual.Pure;
import org.checkerframework.dataflow.qual.SideEffectFree;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-impl@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzfu implements zzgp {
    private static volatile zzfu zzd;
    private zzee zzA;
    private zzfe zzB;
    private Boolean zzD;
    private long zzE;
    private volatile Boolean zzF;
    private volatile boolean zzG;
    private int zzH;
    protected Boolean zza;
    protected Boolean zzb;
    final long zzc;
    private final Context zze;
    private final String zzf;
    private final String zzg;
    private final String zzh;
    private final boolean zzi;
    private final zzz zzj;
    private final zzae zzk;
    private final zzfb zzl;
    private final zzem zzm;
    private final zzfr zzn;
    private final zzjz zzo;
    private final zzku zzp;
    private final zzeh zzq;
    private final Clock zzr;
    private final zzik zzs;
    private final zzhw zzt;
    private final zzd zzu;
    private final zzia zzv;
    private final String zzw;
    private zzeg zzx;
    private zzjk zzy;
    private zzam zzz;
    private boolean zzC = false;
    private final AtomicInteger zzI = new AtomicInteger(0);

    zzfu(zzgw zzgwVar) {
        Bundle bundle;
        Preconditions.checkNotNull(zzgwVar);
        zzz zzzVar = new zzz(zzgwVar.zza);
        this.zzj = zzzVar;
        zzdy.zza = zzzVar;
        Context context = zzgwVar.zza;
        this.zze = context;
        this.zzf = zzgwVar.zzb;
        this.zzg = zzgwVar.zzc;
        this.zzh = zzgwVar.zzd;
        this.zzi = zzgwVar.zzh;
        this.zzF = zzgwVar.zze;
        this.zzw = zzgwVar.zzj;
        this.zzG = true;
        com.google.android.gms.internal.measurement.zzcl zzclVar = zzgwVar.zzg;
        if (zzclVar != null && (bundle = zzclVar.zzg) != null) {
            Object obj = bundle.get("measurementEnabled");
            if (obj instanceof Boolean) {
                this.zza = (Boolean) obj;
            }
            Object obj2 = zzclVar.zzg.get("measurementDeactivated");
            if (obj2 instanceof Boolean) {
                this.zzb = (Boolean) obj2;
            }
        }
        com.google.android.gms.internal.measurement.zzht.zzb(context);
        Clock defaultClock = DefaultClock.getInstance();
        this.zzr = defaultClock;
        Long l = zzgwVar.zzi;
        this.zzc = l != null ? l.longValue() : defaultClock.currentTimeMillis();
        this.zzk = new zzae(this);
        zzfb zzfbVar = new zzfb(this);
        zzfbVar.zzx();
        this.zzl = zzfbVar;
        zzem zzemVar = new zzem(this);
        zzemVar.zzx();
        this.zzm = zzemVar;
        zzku zzkuVar = new zzku(this);
        zzkuVar.zzx();
        this.zzp = zzkuVar;
        zzeh zzehVar = new zzeh(this);
        zzehVar.zzx();
        this.zzq = zzehVar;
        this.zzu = new zzd(this);
        zzik zzikVar = new zzik(this);
        zzikVar.zzc();
        this.zzs = zzikVar;
        zzhw zzhwVar = new zzhw(this);
        zzhwVar.zzc();
        this.zzt = zzhwVar;
        zzjz zzjzVar = new zzjz(this);
        zzjzVar.zzc();
        this.zzo = zzjzVar;
        zzia zziaVar = new zzia(this);
        zziaVar.zzx();
        this.zzv = zziaVar;
        zzfr zzfrVar = new zzfr(this);
        zzfrVar.zzx();
        this.zzn = zzfrVar;
        com.google.android.gms.internal.measurement.zzcl zzclVar2 = zzgwVar.zzg;
        boolean z = zzclVar2 == null || zzclVar2.zzb == 0;
        if (context.getApplicationContext() instanceof Application) {
            zzhw zzhwVarZzk = zzk();
            if (zzhwVarZzk.zzs.zze.getApplicationContext() instanceof Application) {
                Application application = (Application) zzhwVarZzk.zzs.zze.getApplicationContext();
                if (zzhwVarZzk.zza == null) {
                    zzhwVarZzk.zza = new zzhv(zzhwVarZzk, null);
                }
                if (z) {
                    application.unregisterActivityLifecycleCallbacks(zzhwVarZzk.zza);
                    application.registerActivityLifecycleCallbacks(zzhwVarZzk.zza);
                    zzhwVarZzk.zzs.zzau().zzk().zza("Registered activity lifecycle callback");
                }
            }
        } else {
            zzau().zze().zza("Application context is not an Application");
        }
        zzfrVar.zzh(new zzft(this, zzgwVar));
    }

    public static zzfu zzC(Context context, com.google.android.gms.internal.measurement.zzcl zzclVar, Long l) {
        Bundle bundle;
        if (zzclVar != null && (zzclVar.zze == null || zzclVar.zzf == null)) {
            zzclVar = new com.google.android.gms.internal.measurement.zzcl(zzclVar.zza, zzclVar.zzb, zzclVar.zzc, zzclVar.zzd, null, null, zzclVar.zzg, null);
        }
        Preconditions.checkNotNull(context);
        Preconditions.checkNotNull(context.getApplicationContext());
        if (zzd == null) {
            synchronized (zzfu.class) {
                if (zzd == null) {
                    zzd = new zzfu(new zzgw(context, zzclVar, l));
                }
            }
        } else if (zzclVar != null && (bundle = zzclVar.zzg) != null && bundle.containsKey("dataCollectionDefaultEnabled")) {
            Preconditions.checkNotNull(zzd);
            zzd.zzF = Boolean.valueOf(zzclVar.zzg.getBoolean("dataCollectionDefaultEnabled"));
        }
        Preconditions.checkNotNull(zzd);
        return zzd;
    }

    static /* synthetic */ void zzO(zzfu zzfuVar, zzgw zzgwVar) {
        zzfuVar.zzav().zzg();
        zzfuVar.zzk.zzb();
        zzam zzamVar = new zzam(zzfuVar);
        zzamVar.zzx();
        zzfuVar.zzz = zzamVar;
        zzee zzeeVar = new zzee(zzfuVar, zzgwVar.zzf);
        zzeeVar.zzc();
        zzfuVar.zzA = zzeeVar;
        zzeg zzegVar = new zzeg(zzfuVar);
        zzegVar.zzc();
        zzfuVar.zzx = zzegVar;
        zzjk zzjkVar = new zzjk(zzfuVar);
        zzjkVar.zzc();
        zzfuVar.zzy = zzjkVar;
        zzfuVar.zzp.zzy();
        zzfuVar.zzl.zzy();
        zzfuVar.zzB = new zzfe(zzfuVar);
        zzfuVar.zzA.zzd();
        zzek zzekVarZzi = zzfuVar.zzau().zzi();
        zzfuVar.zzk.zzf();
        zzekVarZzi.zzb("App measurement initialized, version", 42004L);
        zzfuVar.zzau().zzi().zza("To enable debug logging run: adb shell setprop log.tag.FA VERBOSE");
        String strZzi = zzeeVar.zzi();
        if (TextUtils.isEmpty(zzfuVar.zzf)) {
            if (zzfuVar.zzl().zzT(strZzi)) {
                zzfuVar.zzau().zzi().zza("Faster debug mode event logging enabled. To disable, run:\n  adb shell setprop debug.firebase.analytics.app .none.");
            } else {
                zzek zzekVarZzi2 = zzfuVar.zzau().zzi();
                String strValueOf = String.valueOf(strZzi);
                zzekVarZzi2.zza(strValueOf.length() != 0 ? "To enable faster debug mode event logging run:\n  adb shell setprop debug.firebase.analytics.app ".concat(strValueOf) : new String("To enable faster debug mode event logging run:\n  adb shell setprop debug.firebase.analytics.app "));
            }
        }
        zzfuVar.zzau().zzj().zza("Debug-level message logging enabled");
        if (zzfuVar.zzH != zzfuVar.zzI.get()) {
            zzfuVar.zzau().zzb().zzc("Not all components initialized", Integer.valueOf(zzfuVar.zzH), Integer.valueOf(zzfuVar.zzI.get()));
        }
        zzfuVar.zzC = true;
    }

    static final void zzP() {
        throw new IllegalStateException("Unexpected call on client side");
    }

    private static final void zzQ(zzgn zzgnVar) {
        if (zzgnVar == null) {
            throw new IllegalStateException("Component not created");
        }
    }

    private static final void zzR(zzf zzfVar) {
        if (zzfVar == null) {
            throw new IllegalStateException("Component not created");
        }
        if (zzfVar.zza()) {
            return;
        }
        String strValueOf = String.valueOf(zzfVar.getClass());
        StringBuilder sb = new StringBuilder(String.valueOf(strValueOf).length() + 27);
        sb.append("Component not initialized: ");
        sb.append(strValueOf);
        throw new IllegalStateException(sb.toString());
    }

    private static final void zzS(zzgo zzgoVar) {
        if (zzgoVar == null) {
            throw new IllegalStateException("Component not created");
        }
        if (zzgoVar.zzu()) {
            return;
        }
        String strValueOf = String.valueOf(zzgoVar.getClass());
        StringBuilder sb = new StringBuilder(String.valueOf(strValueOf).length() + 27);
        sb.append("Component not initialized: ");
        sb.append(strValueOf);
        throw new IllegalStateException(sb.toString());
    }

    @Pure
    public final zzee zzA() {
        zzR(this.zzA);
        return this.zzA;
    }

    @Pure
    public final zzd zzB() {
        zzd zzdVar = this.zzu;
        if (zzdVar != null) {
            return zzdVar;
        }
        throw new IllegalStateException("Component not created");
    }

    final void zzD(boolean z) {
        this.zzF = Boolean.valueOf(z);
    }

    public final boolean zzE() {
        return this.zzF != null && this.zzF.booleanValue();
    }

    public final boolean zzF() {
        return zzG() == 0;
    }

    public final int zzG() {
        zzav().zzg();
        if (this.zzk.zzr()) {
            return 1;
        }
        Boolean bool = this.zzb;
        if (bool != null && bool.booleanValue()) {
            return 2;
        }
        zzav().zzg();
        if (!this.zzG) {
            return 8;
        }
        Boolean boolZzf = zzd().zzf();
        if (boolZzf != null) {
            return boolZzf.booleanValue() ? 0 : 3;
        }
        zzae zzaeVar = this.zzk;
        zzz zzzVar = zzaeVar.zzs.zzj;
        Boolean boolZzp = zzaeVar.zzp("firebase_analytics_collection_enabled");
        if (boolZzp != null) {
            return boolZzp.booleanValue() ? 0 : 4;
        }
        Boolean bool2 = this.zza;
        return bool2 != null ? bool2.booleanValue() ? 0 : 5 : (!this.zzk.zzn(null, zzea.zzS) || this.zzF == null || this.zzF.booleanValue()) ? 0 : 7;
    }

    public final void zzH(boolean z) {
        zzav().zzg();
        this.zzG = z;
    }

    public final boolean zzI() {
        zzav().zzg();
        return this.zzG;
    }

    final void zzJ() {
        this.zzH++;
    }

    final void zzK() {
        this.zzI.incrementAndGet();
    }

    /* JADX WARN: Removed duplicated region for block: B:26:0x007a  */
    /* JADX WARN: Removed duplicated region for block: B:30:0x0089  */
    /*
        Code decompiled incorrectly, please refer to instructions dump.
        To view partially-correct code enable 'Show inconsistent code' option in preferences
    */
    protected final boolean zzL() {
        /*
            Method dump skipped, instruction units count: 210
            To view this dump change 'Code comments level' option to 'DEBUG'
        */
        throw new UnsupportedOperationException("Method not decompiled: com.google.android.gms.measurement.internal.zzfu.zzL():boolean");
    }

    public final void zzM() {
        zzav().zzg();
        zzS(zzo());
        String strZzi = zzA().zzi();
        Pair<String, Boolean> pairZzb = zzd().zzb(strZzi);
        if (!this.zzk.zzs() || ((Boolean) pairZzb.second).booleanValue() || TextUtils.isEmpty((CharSequence) pairZzb.first)) {
            zzau().zzj().zza("ADID unavailable to retrieve Deferred Deep Link. Skipping");
            return;
        }
        zzia zziaVarZzo = zzo();
        zziaVarZzo.zzv();
        ConnectivityManager connectivityManager = (ConnectivityManager) zziaVarZzo.zzs.zze.getSystemService("connectivity");
        NetworkInfo activeNetworkInfo = null;
        if (connectivityManager != null) {
            try {
                activeNetworkInfo = connectivityManager.getActiveNetworkInfo();
            } catch (SecurityException e) {
            }
        }
        if (activeNetworkInfo == null || !activeNetworkInfo.isConnected()) {
            zzau().zze().zza("Network is not available for Deferred Deep Link request. Skipping");
            return;
        }
        zzku zzkuVarZzl = zzl();
        zzA().zzs.zzk.zzf();
        URL urlZzal = zzkuVarZzl.zzal(42004L, strZzi, (String) pairZzb.first, zzd().zzn.zza() - 1);
        if (urlZzal != null) {
            zzia zziaVarZzo2 = zzo();
            zzfs zzfsVar = new zzfs(this);
            zziaVarZzo2.zzg();
            zziaVarZzo2.zzv();
            Preconditions.checkNotNull(urlZzal);
            Preconditions.checkNotNull(zzfsVar);
            zziaVarZzo2.zzs.zzav().zzk(new zzhz(zziaVarZzo2, strZzi, urlZzal, null, null, zzfsVar, null));
        }
    }

    /* JADX WARN: Removed duplicated region for block: B:31:0x00bb  */
    /*
        Code decompiled incorrectly, please refer to instructions dump.
        To view partially-correct code enable 'Show inconsistent code' option in preferences
    */
    protected final void zza(com.google.android.gms.internal.measurement.zzcl r10) {
        /*
            Method dump skipped, instruction units count: 857
            To view this dump change 'Code comments level' option to 'DEBUG'
        */
        throw new UnsupportedOperationException("Method not decompiled: com.google.android.gms.measurement.internal.zzfu.zza(com.google.android.gms.internal.measurement.zzcl):void");
    }

    @Override // com.google.android.gms.measurement.internal.zzgp
    @Pure
    public final zzz zzat() {
        return this.zzj;
    }

    @Override // com.google.android.gms.measurement.internal.zzgp
    @Pure
    public final zzem zzau() {
        zzS(this.zzm);
        return this.zzm;
    }

    @Override // com.google.android.gms.measurement.internal.zzgp
    @Pure
    public final zzfr zzav() {
        zzS(this.zzn);
        return this.zzn;
    }

    @Override // com.google.android.gms.measurement.internal.zzgp
    @Pure
    public final Context zzax() {
        return this.zze;
    }

    @Override // com.google.android.gms.measurement.internal.zzgp
    @Pure
    public final Clock zzay() {
        return this.zzr;
    }

    @Pure
    public final zzae zzc() {
        return this.zzk;
    }

    @Pure
    public final zzfb zzd() {
        zzQ(this.zzl);
        return this.zzl;
    }

    public final zzem zzf() {
        zzem zzemVar = this.zzm;
        if (zzemVar == null || !zzemVar.zzu()) {
            return null;
        }
        return this.zzm;
    }

    @Pure
    public final zzjz zzh() {
        zzR(this.zzo);
        return this.zzo;
    }

    @SideEffectFree
    public final zzfe zzi() {
        return this.zzB;
    }

    @SideEffectFree
    final zzfr zzj() {
        return this.zzn;
    }

    @Pure
    public final zzhw zzk() {
        zzR(this.zzt);
        return this.zzt;
    }

    @Pure
    public final zzku zzl() {
        zzQ(this.zzp);
        return this.zzp;
    }

    @Pure
    public final zzeh zzm() {
        zzQ(this.zzq);
        return this.zzq;
    }

    @Pure
    public final zzeg zzn() {
        zzR(this.zzx);
        return this.zzx;
    }

    @Pure
    public final zzia zzo() {
        zzS(this.zzv);
        return this.zzv;
    }

    @Pure
    public final boolean zzq() {
        return TextUtils.isEmpty(this.zzf);
    }

    @Pure
    public final String zzr() {
        return this.zzf;
    }

    @Pure
    public final String zzs() {
        return this.zzg;
    }

    @Pure
    public final String zzt() {
        return this.zzh;
    }

    @Pure
    public final boolean zzu() {
        return this.zzi;
    }

    @Pure
    public final String zzv() {
        return this.zzw;
    }

    @Pure
    public final zzik zzx() {
        zzR(this.zzs);
        return this.zzs;
    }

    @Pure
    public final zzjk zzy() {
        zzR(this.zzy);
        return this.zzy;
    }

    @Pure
    public final zzam zzz() {
        zzS(this.zzz);
        return this.zzz;
    }

    /* JADX WARN: Removed duplicated region for block: B:12:0x001c  */
    /*
        Code decompiled incorrectly, please refer to instructions dump.
        To view partially-correct code enable 'Show inconsistent code' option in preferences
    */
    final /* synthetic */ void zzN(java.lang.String r7, int r8, java.lang.Throwable r9, byte[] r10, java.util.Map r11) {
        /*
            Method dump skipped, instruction units count: 294
            To view this dump change 'Code comments level' option to 'DEBUG'
        */
        throw new UnsupportedOperationException("Method not decompiled: com.google.android.gms.measurement.internal.zzfu.zzN(java.lang.String, int, java.lang.Throwable, byte[], java.util.Map):void");
    }
}
