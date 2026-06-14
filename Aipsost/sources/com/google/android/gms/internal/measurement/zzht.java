package com.google.android.gms.internal.measurement;

import android.content.Context;
import android.net.Uri;
import android.os.Build;
import android.os.StrictMode;
import android.util.Log;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.Collection;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicReference;
import javax.annotation.Nullable;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-impl@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public abstract class zzht<T> {
    public static final /* synthetic */ int zzc = 0;
    private static final Object zzd = new Object();

    @Nullable
    private static volatile zzhs zze = null;
    private static volatile boolean zzf = false;
    private static final AtomicReference<Collection<zzht<?>>> zzg = new AtomicReference<>();
    private static final zzhv zzh = new zzhv(zzhm.zza);
    private static final AtomicInteger zzj = new AtomicInteger();
    final zzhr zza;
    final String zzb;
    private final T zzi;
    private volatile int zzk = -1;
    private volatile T zzl;
    private final boolean zzm;

    /* JADX WARN: Multi-variable type inference failed */
    /* synthetic */ zzht(zzhr zzhrVar, String str, Object obj, boolean z, zzhn zzhnVar) {
        if (zzhrVar.zzb == null) {
            throw new IllegalArgumentException("Must pass a valid SharedPreferences file name or ContentProvider URI");
        }
        this.zza = zzhrVar;
        this.zzb = str;
        this.zzi = obj;
        this.zzm = true;
    }

    @Deprecated
    public static void zzb(final Context context) {
        synchronized (zzd) {
            zzhs zzhsVar = zze;
            Context applicationContext = context.getApplicationContext();
            if (applicationContext != null) {
                context = applicationContext;
            }
            if (zzhsVar == null || zzhsVar.zza() != context) {
                zzha.zzd();
                zzhu.zzb();
                zzhh.zzc();
                zze = new zzgx(context, zzif.zza(new zzib(context) { // from class: com.google.android.gms.internal.measurement.zzhl
                    private final Context zza;

                    {
                        this.zza = context;
                    }

                    @Override // com.google.android.gms.internal.measurement.zzib
                    public final Object zza() {
                        zzhz zzhzVarZzc;
                        zzhz zzhzVarZzc2;
                        Context contextCreateDeviceProtectedStorageContext = this.zza;
                        int i = zzht.zzc;
                        String str = Build.TYPE;
                        String str2 = Build.TAGS;
                        if ((!str.equals("eng") && !str.equals("userdebug")) || (!str2.contains("dev-keys") && !str2.contains("test-keys"))) {
                            return zzhz.zzc();
                        }
                        if (zzgw.zza() && !contextCreateDeviceProtectedStorageContext.isDeviceProtectedStorage()) {
                            contextCreateDeviceProtectedStorageContext = contextCreateDeviceProtectedStorageContext.createDeviceProtectedStorageContext();
                        }
                        StrictMode.ThreadPolicy threadPolicyAllowThreadDiskReads = StrictMode.allowThreadDiskReads();
                        try {
                            StrictMode.allowThreadDiskWrites();
                            try {
                                File file = new File(contextCreateDeviceProtectedStorageContext.getDir("phenotype_hermetic", 0), "overrides.txt");
                                zzhzVarZzc = file.exists() ? zzhz.zzd(file) : zzhz.zzc();
                            } catch (RuntimeException e) {
                                Log.e("HermeticFileOverrides", "no data dir", e);
                                zzhzVarZzc = zzhz.zzc();
                            }
                            if (zzhzVarZzc.zza()) {
                                File file2 = (File) zzhzVarZzc.zzb();
                                try {
                                    BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(new FileInputStream(file2)));
                                    try {
                                        HashMap map = new HashMap();
                                        HashMap map2 = new HashMap();
                                        while (true) {
                                            String line = bufferedReader.readLine();
                                            if (line == null) {
                                                break;
                                            }
                                            String[] strArrSplit = line.split(" ", 3);
                                            if (strArrSplit.length != 3) {
                                                Log.e("HermeticFileOverrides", line.length() != 0 ? "Invalid: ".concat(line) : new String("Invalid: "));
                                            } else {
                                                String str3 = new String(strArrSplit[0]);
                                                String strDecode = Uri.decode(new String(strArrSplit[1]));
                                                String strDecode2 = (String) map2.get(strArrSplit[2]);
                                                if (strDecode2 == null) {
                                                    String str4 = new String(strArrSplit[2]);
                                                    strDecode2 = Uri.decode(str4);
                                                    if (strDecode2.length() < 1024 || strDecode2 == str4) {
                                                        map2.put(str4, strDecode2);
                                                    }
                                                }
                                                if (!map.containsKey(str3)) {
                                                    map.put(str3, new HashMap());
                                                }
                                                ((Map) map.get(str3)).put(strDecode, strDecode2);
                                            }
                                        }
                                        String strValueOf = String.valueOf(file2);
                                        StringBuilder sb = new StringBuilder(String.valueOf(strValueOf).length() + 7);
                                        sb.append("Parsed ");
                                        sb.append(strValueOf);
                                        Log.i("HermeticFileOverrides", sb.toString());
                                        zzhi zzhiVar = new zzhi(map);
                                        bufferedReader.close();
                                        zzhzVarZzc2 = zzhz.zzd(zzhiVar);
                                    } catch (Throwable th) {
                                        try {
                                            bufferedReader.close();
                                        } catch (Throwable th2) {
                                            zzim.zza(th, th2);
                                        }
                                        throw th;
                                    }
                                } catch (IOException e2) {
                                    throw new RuntimeException(e2);
                                }
                            } else {
                                zzhzVarZzc2 = zzhz.zzc();
                            }
                            return zzhzVarZzc2;
                        } finally {
                            StrictMode.setThreadPolicy(threadPolicyAllowThreadDiskReads);
                        }
                    }
                }));
                zzj.incrementAndGet();
            }
        }
    }

    static void zzc() {
        zzj.incrementAndGet();
    }

    abstract T zza(Object obj);

    public final String zzd() {
        String str = this.zza.zzd;
        return this.zzb;
    }

    public final T zze() {
        zzhe zzheVarZza;
        T tZza;
        Object objZze;
        if (!this.zzm && this.zzb == null) {
            throw new NullPointerException("flagName must not be null");
        }
        int i = zzj.get();
        if (this.zzk < i) {
            synchronized (this) {
                if (this.zzk < i) {
                    zzhs zzhsVar = zze;
                    if (zzhsVar == null) {
                        throw new IllegalStateException("Must call PhenotypeFlag.init() first");
                    }
                    zzhr zzhrVar = this.zza;
                    boolean z = zzhrVar.zzf;
                    boolean z2 = zzhrVar.zzg;
                    String strZzb = zzhh.zza(zzhsVar.zza()).zze("gms:phenotype:phenotype_flag:debug_bypass_phenotype");
                    if (strZzb == null || !zzgv.zzc.matcher(strZzb).matches()) {
                        if (this.zza.zzb == null) {
                            Context contextZza = zzhsVar.zza();
                            String str = this.zza.zza;
                            zzheVarZza = zzhu.zza(contextZza, null);
                        } else if (zzhj.zza(zzhsVar.zza(), this.zza.zzb)) {
                            boolean z3 = this.zza.zzh;
                            zzheVarZza = zzha.zza(zzhsVar.zza().getContentResolver(), this.zza.zzb);
                        } else {
                            zzheVarZza = null;
                        }
                        tZza = (zzheVarZza == null || (objZze = zzheVarZza.zze(zzd())) == null) ? null : zza(objZze);
                    } else {
                        if (Log.isLoggable("PhenotypeFlag", 3)) {
                            String strValueOf = String.valueOf(zzd());
                            Log.d("PhenotypeFlag", strValueOf.length() != 0 ? "Bypass reading Phenotype values for flag: ".concat(strValueOf) : new String("Bypass reading Phenotype values for flag: "));
                        }
                        tZza = null;
                    }
                    if (tZza == null) {
                        zzhr zzhrVar2 = this.zza;
                        boolean z4 = zzhrVar2.zze;
                        zzhy<Context, Boolean> zzhyVar = zzhrVar2.zzi;
                        zzhh zzhhVarZza = zzhh.zza(zzhsVar.zza());
                        zzhr zzhrVar3 = this.zza;
                        boolean z5 = zzhrVar3.zze;
                        String str2 = zzhrVar3.zzc;
                        String strZzb2 = zzhhVarZza.zze(this.zzb);
                        tZza = strZzb2 != null ? zza(strZzb2) : null;
                        if (tZza == null) {
                            tZza = this.zzi;
                        }
                    }
                    zzhz<zzhi> zzhzVarZza = zzhsVar.zzb().zza();
                    if (zzhzVarZza.zza()) {
                        zzhi zzhiVarZzb = zzhzVarZza.zzb();
                        zzhr zzhrVar4 = this.zza;
                        Uri uri = zzhrVar4.zzb;
                        String str3 = zzhrVar4.zza;
                        String strZza = zzhiVarZzb.zza(uri, null, zzhrVar4.zzd, this.zzb);
                        tZza = strZza == null ? this.zzi : zza(strZza);
                    }
                    this.zzl = tZza;
                    this.zzk = i;
                }
            }
        }
        return this.zzl;
    }
}
