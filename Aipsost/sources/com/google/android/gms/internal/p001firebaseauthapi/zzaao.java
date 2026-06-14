package com.google.android.gms.internal.p001firebaseauthapi;

import com.google.android.gms.common.internal.Preconditions;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzaao implements zzxm {
    private String zza;
    private String zzb;
    private String zzc;
    private String zzd;
    private String zze;
    private String zzf;
    private final zzaaw zzg = new zzaaw(null);
    private final zzaaw zzh = new zzaaw(null);
    private String zzi;

    /* JADX WARN: Can't fix incorrect switch cases order, some code will duplicate */
    /* JADX WARN: Removed duplicated region for block: B:27:0x0085  */
    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzxm
    /*
        Code decompiled incorrectly, please refer to instructions dump.
        To view partially-correct code enable 'Show inconsistent code' option in preferences
    */
    public final java.lang.String zza() throws org.json.JSONException {
        /*
            Method dump skipped, instruction units count: 272
            To view this dump change 'Code comments level' option to 'DEBUG'
        */
        throw new UnsupportedOperationException("Method not decompiled: com.google.android.gms.internal.p001firebaseauthapi.zzaao.zza():java.lang.String");
    }

    public final zzaao zzb(String str) {
        Preconditions.checkNotEmpty(str);
        this.zzh.zzb().add(str);
        return this;
    }

    public final zzaao zzc(String str) {
        if (str == null) {
            this.zzg.zzb().add("DISPLAY_NAME");
        } else {
            this.zzb = str;
        }
        return this;
    }

    public final zzaao zzd(String str) {
        if (str == null) {
            this.zzg.zzb().add("EMAIL");
        } else {
            this.zzc = str;
        }
        return this;
    }

    public final zzaao zze(String str) {
        this.zza = Preconditions.checkNotEmpty(str);
        return this;
    }

    public final zzaao zzf(String str) {
        this.zze = Preconditions.checkNotEmpty(str);
        return this;
    }

    public final zzaao zzg(String str) {
        if (str == null) {
            this.zzg.zzb().add("PASSWORD");
        } else {
            this.zzd = str;
        }
        return this;
    }

    public final zzaao zzh(String str) {
        if (str == null) {
            this.zzg.zzb().add("PHOTO_URL");
        } else {
            this.zzf = str;
        }
        return this;
    }

    public final zzaao zzi(String str) {
        this.zzi = str;
        return this;
    }

    public final String zzj() {
        return this.zzb;
    }

    public final String zzk() {
        return this.zzc;
    }

    public final String zzl() {
        return this.zzd;
    }

    public final String zzm() {
        return this.zzf;
    }

    public final boolean zzn(String str) {
        Preconditions.checkNotEmpty(str);
        return this.zzg.zzb().contains(str);
    }
}
