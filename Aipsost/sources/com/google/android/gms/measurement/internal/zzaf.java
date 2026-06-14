package com.google.android.gms.measurement.internal;

import android.os.Bundle;
import androidx.constraintlayout.widget.ConstraintLayout;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-impl@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzaf {
    public static final zzaf zza = new zzaf(null, null);
    private final Boolean zzb;
    private final Boolean zzc;

    public zzaf(Boolean bool, Boolean bool2) {
        this.zzb = bool;
        this.zzc = bool2;
    }

    public static String zza(Bundle bundle) {
        String string = bundle.getString("ad_storage");
        if (string != null && zzo(string) == null) {
            return string;
        }
        String string2 = bundle.getString("analytics_storage");
        if (string2 == null || zzo(string2) != null) {
            return null;
        }
        return string2;
    }

    public static zzaf zzb(Bundle bundle) {
        return bundle == null ? zza : new zzaf(zzo(bundle.getString("ad_storage")), zzo(bundle.getString("analytics_storage")));
    }

    public static zzaf zzc(String str) {
        Boolean boolZzp;
        Boolean bool = null;
        if (str != null) {
            Boolean boolZzp2 = str.length() >= 3 ? zzp(str.charAt(2)) : null;
            if (str.length() >= 4) {
                boolZzp = zzp(str.charAt(3));
                bool = boolZzp2;
            } else {
                boolZzp = null;
                bool = boolZzp2;
            }
        } else {
            boolZzp = null;
        }
        return new zzaf(bool, boolZzp);
    }

    static Boolean zzj(Boolean bool, Boolean bool2) {
        if (bool == null) {
            return bool2;
        }
        if (bool2 == null) {
            return bool;
        }
        boolean z = false;
        if (bool.booleanValue() && bool2.booleanValue()) {
            z = true;
        }
        return Boolean.valueOf(z);
    }

    public static boolean zzm(int i, int i2) {
        return i <= i2;
    }

    static final int zzn(Boolean bool) {
        if (bool == null) {
            return 0;
        }
        return bool.booleanValue() ? 1 : 2;
    }

    private static Boolean zzo(String str) {
        if (str == null) {
            return null;
        }
        if (str.equals("granted")) {
            return Boolean.TRUE;
        }
        if (str.equals("denied")) {
            return Boolean.FALSE;
        }
        return null;
    }

    private static Boolean zzp(char c) {
        switch (c) {
            case '-':
                return null;
            case '.':
            case '/':
            default:
                return null;
            case ConstraintLayout.LayoutParams.Table.LAYOUT_CONSTRAINT_VERTICAL_CHAINSTYLE /* 48 */:
                return Boolean.FALSE;
            case ConstraintLayout.LayoutParams.Table.LAYOUT_EDITOR_ABSOLUTEX /* 49 */:
                return Boolean.TRUE;
        }
    }

    private static final char zzq(Boolean bool) {
        if (bool == null) {
            return '-';
        }
        return bool.booleanValue() ? '1' : '0';
    }

    public final boolean equals(Object obj) {
        if (!(obj instanceof zzaf)) {
            return false;
        }
        zzaf zzafVar = (zzaf) obj;
        return zzn(this.zzb) == zzn(zzafVar.zzb) && zzn(this.zzc) == zzn(zzafVar.zzc);
    }

    public final int hashCode() {
        return ((zzn(this.zzb) + 527) * 31) + zzn(this.zzc);
    }

    public final String toString() {
        StringBuilder sb = new StringBuilder("ConsentSettings: ");
        sb.append("adStorage=");
        Boolean bool = this.zzb;
        if (bool == null) {
            sb.append("uninitialized");
        } else {
            sb.append(true != bool.booleanValue() ? "denied" : "granted");
        }
        sb.append(", analyticsStorage=");
        Boolean bool2 = this.zzc;
        if (bool2 == null) {
            sb.append("uninitialized");
        } else {
            sb.append(true == bool2.booleanValue() ? "granted" : "denied");
        }
        return sb.toString();
    }

    public final String zzd() {
        return "G1" + zzq(this.zzb) + zzq(this.zzc);
    }

    public final Boolean zze() {
        return this.zzb;
    }

    public final boolean zzf() {
        Boolean bool = this.zzb;
        return bool == null || bool.booleanValue();
    }

    public final Boolean zzg() {
        return this.zzc;
    }

    public final boolean zzh() {
        Boolean bool = this.zzc;
        return bool == null || bool.booleanValue();
    }

    public final boolean zzi(zzaf zzafVar) {
        if (this.zzb != Boolean.FALSE || zzafVar.zzb == Boolean.FALSE) {
            return this.zzc == Boolean.FALSE && zzafVar.zzc != Boolean.FALSE;
        }
        return true;
    }

    public final zzaf zzk(zzaf zzafVar) {
        return new zzaf(zzj(this.zzb, zzafVar.zzb), zzj(this.zzc, zzafVar.zzc));
    }

    public final zzaf zzl(zzaf zzafVar) {
        Boolean bool = this.zzb;
        if (bool == null) {
            bool = zzafVar.zzb;
        }
        Boolean bool2 = this.zzc;
        if (bool2 == null) {
            bool2 = zzafVar.zzc;
        }
        return new zzaf(bool, bool2);
    }
}
