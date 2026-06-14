package com.google.firebase.auth;

import android.os.Parcel;
import android.os.Parcelable;
import android.text.TextUtils;
import com.google.android.gms.common.internal.Preconditions;
import com.google.android.gms.common.internal.safeparcel.SafeParcelWriter;
import com.google.android.gms.internal.p001firebaseauthapi.zzaay;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zze extends OAuthCredential {
    public static final Parcelable.Creator<zze> CREATOR = new zzf();
    private final String zza;
    private final String zzb;
    private final String zzc;
    private final zzaay zzd;
    private final String zze;
    private final String zzf;
    private final String zzg;

    zze(String str, String str2, String str3, zzaay zzaayVar, String str4, String str5, String str6) {
        this.zza = com.google.android.gms.internal.p001firebaseauthapi.zzag.zzc(str);
        this.zzb = str2;
        this.zzc = str3;
        this.zzd = zzaayVar;
        this.zze = str4;
        this.zzf = str5;
        this.zzg = str6;
    }

    public static zze zzb(zzaay zzaayVar) {
        Preconditions.checkNotNull(zzaayVar, "Must specify a non-null webSignInCredential");
        return new zze(null, null, null, zzaayVar, null, null, null);
    }

    public static zze zzc(String str, String str2, String str3, String str4, String str5) {
        Preconditions.checkNotEmpty(str, "Must specify a non-empty providerId");
        if (TextUtils.isEmpty(str2) && TextUtils.isEmpty(str3)) {
            throw new IllegalArgumentException("Must specify an idToken or an accessToken.");
        }
        return new zze(str, str2, str3, null, str4, str5, null);
    }

    public static zzaay zzd(zze zzeVar, String str) {
        Preconditions.checkNotNull(zzeVar);
        zzaay zzaayVar = zzeVar.zzd;
        return zzaayVar != null ? zzaayVar : new zzaay(zzeVar.zzb, zzeVar.zzc, zzeVar.zza, null, zzeVar.zzf, null, str, zzeVar.zze, zzeVar.zzg);
    }

    @Override // com.google.firebase.auth.OAuthCredential
    public final String getAccessToken() {
        return this.zzc;
    }

    @Override // com.google.firebase.auth.OAuthCredential
    public final String getIdToken() {
        return this.zzb;
    }

    @Override // com.google.firebase.auth.AuthCredential
    public final String getProvider() {
        return this.zza;
    }

    @Override // com.google.firebase.auth.OAuthCredential
    public final String getSecret() {
        return this.zzf;
    }

    @Override // com.google.firebase.auth.AuthCredential
    public final String getSignInMethod() {
        return this.zza;
    }

    @Override // android.os.Parcelable
    public final void writeToParcel(Parcel parcel, int i) {
        int iBeginObjectHeader = SafeParcelWriter.beginObjectHeader(parcel);
        SafeParcelWriter.writeString(parcel, 1, this.zza, false);
        SafeParcelWriter.writeString(parcel, 2, this.zzb, false);
        SafeParcelWriter.writeString(parcel, 3, this.zzc, false);
        SafeParcelWriter.writeParcelable(parcel, 4, this.zzd, i, false);
        SafeParcelWriter.writeString(parcel, 5, this.zze, false);
        SafeParcelWriter.writeString(parcel, 6, this.zzf, false);
        SafeParcelWriter.writeString(parcel, 7, this.zzg, false);
        SafeParcelWriter.finishObjectHeader(parcel, iBeginObjectHeader);
    }

    @Override // com.google.firebase.auth.AuthCredential
    public final AuthCredential zza() {
        return new zze(this.zza, this.zzb, this.zzc, this.zzd, this.zze, this.zzf, this.zzg);
    }
}
