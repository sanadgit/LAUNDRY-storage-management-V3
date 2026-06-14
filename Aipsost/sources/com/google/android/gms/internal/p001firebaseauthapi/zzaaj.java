package com.google.android.gms.internal.p001firebaseauthapi;

import android.os.Parcel;
import android.os.Parcelable;
import com.google.android.gms.common.internal.safeparcel.AbstractSafeParcelable;
import com.google.android.gms.common.internal.safeparcel.SafeParcelWriter;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzaaj extends AbstractSafeParcelable implements zzxn<zzaaj> {
    private String zzb;
    private String zzc;
    private String zzd;
    private zzaac zze;
    private static final String zza = zzaaj.class.getSimpleName();
    public static final Parcelable.Creator<zzaaj> CREATOR = new zzaak();

    public zzaaj() {
    }

    @Override // android.os.Parcelable
    public final void writeToParcel(Parcel parcel, int i) {
        int iBeginObjectHeader = SafeParcelWriter.beginObjectHeader(parcel);
        SafeParcelWriter.writeString(parcel, 2, this.zzb, false);
        SafeParcelWriter.writeString(parcel, 3, this.zzc, false);
        SafeParcelWriter.writeString(parcel, 4, this.zzd, false);
        SafeParcelWriter.writeParcelable(parcel, 5, this.zze, i, false);
        SafeParcelWriter.finishObjectHeader(parcel, iBeginObjectHeader);
    }

    /* JADX WARN: Can't fix incorrect switch cases order, some code will duplicate */
    /* JADX WARN: Removed duplicated region for block: B:36:0x0089  */
    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzxn
    /*
        Code decompiled incorrectly, please refer to instructions dump.
        To view partially-correct code enable 'Show inconsistent code' option in preferences
    */
    public final /* bridge */ /* synthetic */ com.google.android.gms.internal.p001firebaseauthapi.zzxn zza(java.lang.String r12) throws com.google.android.gms.internal.p001firebaseauthapi.zzvg {
        /*
            Method dump skipped, instruction units count: 236
            To view this dump change 'Code comments level' option to 'DEBUG'
        */
        throw new UnsupportedOperationException("Method not decompiled: com.google.android.gms.internal.p001firebaseauthapi.zzaaj.zza(java.lang.String):com.google.android.gms.internal.firebase-auth-api.zzxn");
    }

    public final zzaac zzb() {
        return this.zze;
    }

    public final String zzc() {
        return this.zzb;
    }

    public final String zzd() {
        return this.zzc;
    }

    public final String zze() {
        return this.zzd;
    }

    public final boolean zzf() {
        return this.zzb != null;
    }

    public final boolean zzg() {
        return this.zze != null;
    }

    public final boolean zzh() {
        return this.zzc != null;
    }

    public final boolean zzi() {
        return this.zzd != null;
    }

    zzaaj(String str, String str2, String str3, zzaac zzaacVar) {
        this.zzb = str;
        this.zzc = str2;
        this.zzd = str3;
        this.zze = zzaacVar;
    }
}
