package com.google.android.gms.internal.measurement;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzfa extends zzkd<zzfa, zzez> implements zzlj {
    private static final zzfa zzi;
    private int zza;
    private String zze = "";
    private boolean zzf;
    private boolean zzg;
    private int zzh;

    static {
        zzfa zzfaVar = new zzfa();
        zzi = zzfaVar;
        zzkd.zzby(zzfa.class, zzfaVar);
    }

    private zzfa() {
    }

    static /* synthetic */ void zzg(zzfa zzfaVar, String str) {
        str.getClass();
        zzfaVar.zza |= 1;
        zzfaVar.zze = str;
    }

    public final String zza() {
        return this.zze;
    }

    public final boolean zzb() {
        return this.zzf;
    }

    public final boolean zzc() {
        return this.zzg;
    }

    public final boolean zzd() {
        return (this.zza & 8) != 0;
    }

    public final int zze() {
        return this.zzh;
    }

    @Override // com.google.android.gms.internal.measurement.zzkd
    protected final Object zzl(int i, Object obj, Object obj2) {
        zzey zzeyVar = null;
        switch (i - 1) {
            case 0:
                return (byte) 1;
            case 1:
            default:
                return null;
            case 2:
                return zzbz(zzi, "\u0001\u0004\u0000\u0001\u0001\u0004\u0004\u0000\u0000\u0000\u0001ဈ\u0000\u0002ဇ\u0001\u0003ဇ\u0002\u0004င\u0003", new Object[]{"zza", "zze", "zzf", "zzg", "zzh"});
            case 3:
                return new zzfa();
            case 4:
                return new zzez(zzeyVar);
            case 5:
                return zzi;
        }
    }
}
