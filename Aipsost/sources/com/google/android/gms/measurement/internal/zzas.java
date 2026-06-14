package com.google.android.gms.measurement.internal;

import android.os.Parcel;
import android.os.Parcelable;
import com.google.android.gms.common.internal.Preconditions;
import com.google.android.gms.common.internal.safeparcel.AbstractSafeParcelable;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-impl@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzas extends AbstractSafeParcelable {
    public static final Parcelable.Creator<zzas> CREATOR = new zzat();
    public final String zza;
    public final zzaq zzb;
    public final String zzc;
    public final long zzd;

    zzas(zzas zzasVar, long j) {
        Preconditions.checkNotNull(zzasVar);
        this.zza = zzasVar.zza;
        this.zzb = zzasVar.zzb;
        this.zzc = zzasVar.zzc;
        this.zzd = j;
    }

    public final String toString() {
        String str = this.zzc;
        String str2 = this.zza;
        String strValueOf = String.valueOf(this.zzb);
        int length = String.valueOf(str).length();
        StringBuilder sb = new StringBuilder(length + 21 + String.valueOf(str2).length() + String.valueOf(strValueOf).length());
        sb.append("origin=");
        sb.append(str);
        sb.append(",name=");
        sb.append(str2);
        sb.append(",params=");
        sb.append(strValueOf);
        return sb.toString();
    }

    @Override // android.os.Parcelable
    public final void writeToParcel(Parcel parcel, int i) {
        zzat.zza(this, parcel, i);
    }

    public zzas(String str, zzaq zzaqVar, String str2, long j) {
        this.zza = str;
        this.zzb = zzaqVar;
        this.zzc = str2;
        this.zzd = j;
    }
}
