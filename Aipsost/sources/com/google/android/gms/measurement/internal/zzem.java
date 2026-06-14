package com.google.android.gms.measurement.internal;

import android.text.TextUtils;
import android.util.Log;
import com.google.android.gms.common.internal.Preconditions;
import org.checkerframework.checker.nullness.qual.EnsuresNonNull;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-impl@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzem extends zzgo {
    private char zza;
    private long zzb;
    private String zzc;
    private final zzek zzd;
    private final zzek zze;
    private final zzek zzf;
    private final zzek zzg;
    private final zzek zzh;
    private final zzek zzi;
    private final zzek zzj;
    private final zzek zzk;
    private final zzek zzl;

    zzem(zzfu zzfuVar) {
        super(zzfuVar);
        this.zza = (char) 0;
        this.zzb = -1L;
        this.zzd = new zzek(this, 6, false, false);
        this.zze = new zzek(this, 6, true, false);
        this.zzf = new zzek(this, 6, false, true);
        this.zzg = new zzek(this, 5, false, false);
        this.zzh = new zzek(this, 5, true, false);
        this.zzi = new zzek(this, 5, false, true);
        this.zzj = new zzek(this, 4, false, false);
        this.zzk = new zzek(this, 3, false, false);
        this.zzl = new zzek(this, 2, false, false);
    }

    protected static Object zzl(String str) {
        if (str == null) {
            return null;
        }
        return new zzel(str);
    }

    static String zzo(boolean z, String str, Object obj, Object obj2, Object obj3) {
        String str2 = "";
        if (str == null) {
            str = "";
        }
        String strZzp = zzp(z, obj);
        String strZzp2 = zzp(z, obj2);
        String strZzp3 = zzp(z, obj3);
        StringBuilder sb = new StringBuilder();
        if (!TextUtils.isEmpty(str)) {
            sb.append(str);
            str2 = ": ";
        }
        String str3 = ", ";
        if (!TextUtils.isEmpty(strZzp)) {
            sb.append(str2);
            sb.append(strZzp);
            str2 = ", ";
        }
        if (TextUtils.isEmpty(strZzp2)) {
            str3 = str2;
        } else {
            sb.append(str2);
            sb.append(strZzp2);
        }
        if (!TextUtils.isEmpty(strZzp3)) {
            sb.append(str3);
            sb.append(strZzp3);
        }
        return sb.toString();
    }

    static String zzp(boolean z, Object obj) {
        String className;
        if (obj == null) {
            return "";
        }
        if (obj instanceof Integer) {
            obj = Long.valueOf(((Integer) obj).intValue());
        }
        int i = 0;
        if (obj instanceof Long) {
            if (!z) {
                return String.valueOf(obj);
            }
            Long l = (Long) obj;
            if (Math.abs(l.longValue()) < 100) {
                return String.valueOf(obj);
            }
            String str = String.valueOf(obj).charAt(0) == '-' ? "-" : "";
            String strValueOf = String.valueOf(Math.abs(l.longValue()));
            long jRound = Math.round(Math.pow(10.0d, strValueOf.length() - 1));
            long jRound2 = Math.round(Math.pow(10.0d, strValueOf.length()) - 1.0d);
            StringBuilder sb = new StringBuilder(str.length() + 43 + str.length());
            sb.append(str);
            sb.append(jRound);
            sb.append("...");
            sb.append(str);
            sb.append(jRound2);
            return sb.toString();
        }
        if (obj instanceof Boolean) {
            return String.valueOf(obj);
        }
        if (!(obj instanceof Throwable)) {
            return obj instanceof zzel ? ((zzel) obj).zza : z ? "-" : String.valueOf(obj);
        }
        Throwable th = (Throwable) obj;
        StringBuilder sb2 = new StringBuilder(z ? th.getClass().getName() : th.toString());
        String strZzz = zzz(zzfu.class.getCanonicalName());
        StackTraceElement[] stackTrace = th.getStackTrace();
        int length = stackTrace.length;
        while (true) {
            if (i >= length) {
                break;
            }
            StackTraceElement stackTraceElement = stackTrace[i];
            if (!stackTraceElement.isNativeMethod() && (className = stackTraceElement.getClassName()) != null && zzz(className).equals(strZzz)) {
                sb2.append(": ");
                sb2.append(stackTraceElement);
                break;
            }
            i++;
        }
        return sb2.toString();
    }

    static /* synthetic */ long zzt(zzem zzemVar, long j) {
        zzemVar.zzb = 42004L;
        return 42004L;
    }

    private static String zzz(String str) {
        if (TextUtils.isEmpty(str)) {
            return "";
        }
        int iLastIndexOf = str.lastIndexOf(46);
        return iLastIndexOf == -1 ? str : str.substring(0, iLastIndexOf);
    }

    @Override // com.google.android.gms.measurement.internal.zzgo
    protected final boolean zza() {
        return false;
    }

    public final zzek zzb() {
        return this.zzd;
    }

    public final zzek zzc() {
        return this.zze;
    }

    public final zzek zzd() {
        return this.zzf;
    }

    public final zzek zze() {
        return this.zzg;
    }

    public final zzek zzf() {
        return this.zzh;
    }

    public final zzek zzh() {
        return this.zzi;
    }

    public final zzek zzi() {
        return this.zzj;
    }

    public final zzek zzj() {
        return this.zzk;
    }

    public final zzek zzk() {
        return this.zzl;
    }

    protected final void zzm(int i, boolean z, boolean z2, String str, Object obj, Object obj2, Object obj3) {
        if (!z && Log.isLoggable(zzn(), i)) {
            Log.println(i, zzn(), zzo(false, str, obj, obj2, obj3));
        }
        if (z2 || i < 5) {
            return;
        }
        Preconditions.checkNotNull(str);
        zzfr zzfrVarZzj = this.zzs.zzj();
        if (zzfrVarZzj == null) {
            Log.println(6, zzn(), "Scheduler not set. Not logging error/warn");
        } else if (zzfrVarZzj.zzu()) {
            zzfrVarZzj.zzh(new zzej(this, i >= 9 ? 8 : i, str, obj, obj2, obj3));
        } else {
            Log.println(6, zzn(), "Scheduler not initialized. Not logging error/warn");
        }
    }

    @EnsuresNonNull({"logTagDoNotUseDirectly"})
    protected final String zzn() {
        String str;
        synchronized (this) {
            if (this.zzc == null) {
                if (this.zzs.zzt() != null) {
                    this.zzc = this.zzs.zzt();
                } else {
                    this.zzc = this.zzs.zzc().zzb();
                }
            }
            Preconditions.checkNotNull(this.zzc);
            str = this.zzc;
        }
        return str;
    }
}
