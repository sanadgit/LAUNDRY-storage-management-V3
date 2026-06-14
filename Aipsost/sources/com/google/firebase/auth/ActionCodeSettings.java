package com.google.firebase.auth;

import android.os.Parcel;
import android.os.Parcelable;
import com.google.android.gms.common.internal.safeparcel.AbstractSafeParcelable;
import com.google.android.gms.common.internal.safeparcel.SafeParcelWriter;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public class ActionCodeSettings extends AbstractSafeParcelable {
    public static final Parcelable.Creator<ActionCodeSettings> CREATOR = new zzc();
    private final String zza;
    private final String zzb;
    private final String zzc;
    private final String zzd;
    private final boolean zze;
    private final String zzf;
    private final boolean zzg;
    private String zzh;
    private int zzi;
    private String zzj;

    /* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
    public static class Builder {
        private String zza;
        private String zzb;
        private String zzc;
        private boolean zzd;
        private String zze;
        private boolean zzf = false;
        private String zzg;

        private Builder() {
        }

        /* synthetic */ Builder(zza zzaVar) {
        }

        public ActionCodeSettings build() {
            if (this.zza != null) {
                return new ActionCodeSettings(this);
            }
            throw new IllegalArgumentException("Cannot build ActionCodeSettings with null URL. Call #setUrl(String) before calling build()");
        }

        public String getDynamicLinkDomain() {
            return this.zzg;
        }

        public boolean getHandleCodeInApp() {
            return this.zzf;
        }

        public String getIOSBundleId() {
            return this.zzb;
        }

        public String getUrl() {
            return this.zza;
        }

        public Builder setAndroidPackageName(String str, boolean z, String str2) {
            this.zzc = str;
            this.zzd = z;
            this.zze = str2;
            return this;
        }

        public Builder setDynamicLinkDomain(String str) {
            this.zzg = str;
            return this;
        }

        public Builder setHandleCodeInApp(boolean z) {
            this.zzf = z;
            return this;
        }

        public Builder setIOSBundleId(String str) {
            this.zzb = str;
            return this;
        }

        public Builder setUrl(String str) {
            this.zza = str;
            return this;
        }
    }

    private ActionCodeSettings(Builder builder) {
        this.zza = builder.zza;
        this.zzb = builder.zzb;
        this.zzc = null;
        this.zzd = builder.zzc;
        this.zze = builder.zzd;
        this.zzf = builder.zze;
        this.zzg = builder.zzf;
        this.zzj = builder.zzg;
    }

    public static Builder newBuilder() {
        return new Builder(null);
    }

    public static ActionCodeSettings zzb() {
        return new ActionCodeSettings(new Builder(null));
    }

    public boolean canHandleCodeInApp() {
        return this.zzg;
    }

    public boolean getAndroidInstallApp() {
        return this.zze;
    }

    public String getAndroidMinimumVersion() {
        return this.zzf;
    }

    public String getAndroidPackageName() {
        return this.zzd;
    }

    public String getIOSBundle() {
        return this.zzb;
    }

    public String getUrl() {
        return this.zza;
    }

    @Override // android.os.Parcelable
    public void writeToParcel(Parcel out, int i) {
        int iBeginObjectHeader = SafeParcelWriter.beginObjectHeader(out);
        SafeParcelWriter.writeString(out, 1, getUrl(), false);
        SafeParcelWriter.writeString(out, 2, getIOSBundle(), false);
        SafeParcelWriter.writeString(out, 3, this.zzc, false);
        SafeParcelWriter.writeString(out, 4, getAndroidPackageName(), false);
        SafeParcelWriter.writeBoolean(out, 5, getAndroidInstallApp());
        SafeParcelWriter.writeString(out, 6, getAndroidMinimumVersion(), false);
        SafeParcelWriter.writeBoolean(out, 7, canHandleCodeInApp());
        SafeParcelWriter.writeString(out, 8, this.zzh, false);
        SafeParcelWriter.writeInt(out, 9, this.zzi);
        SafeParcelWriter.writeString(out, 10, this.zzj, false);
        SafeParcelWriter.finishObjectHeader(out, iBeginObjectHeader);
    }

    public final int zza() {
        return this.zzi;
    }

    public final String zzc() {
        return this.zzj;
    }

    public final String zzd() {
        return this.zzc;
    }

    public final String zze() {
        return this.zzh;
    }

    public final void zzf(String str) {
        this.zzh = str;
    }

    public final void zzg(int i) {
        this.zzi = i;
    }

    ActionCodeSettings(String str, String str2, String str3, String str4, boolean z, String str5, boolean z2, String str6, int i, String str7) {
        this.zza = str;
        this.zzb = str2;
        this.zzc = str3;
        this.zzd = str4;
        this.zze = z;
        this.zzf = str5;
        this.zzg = z2;
        this.zzh = str6;
        this.zzi = i;
        this.zzj = str7;
    }
}
