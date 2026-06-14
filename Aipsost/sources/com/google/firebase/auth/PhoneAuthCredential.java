package com.google.firebase.auth;

import android.os.Parcel;
import android.os.Parcelable;
import android.text.TextUtils;
import com.google.android.gms.common.internal.Preconditions;
import com.google.android.gms.common.internal.safeparcel.SafeParcelWriter;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public class PhoneAuthCredential extends AuthCredential implements Cloneable {
    public static final Parcelable.Creator<PhoneAuthCredential> CREATOR = new zzag();
    private String zza;
    private String zzb;
    private boolean zzc;
    private String zzd;
    private boolean zze;
    private String zzf;
    private String zzg;

    PhoneAuthCredential(String str, String str2, boolean z, String str3, boolean z2, String str4, String str5) {
        boolean z3 = true;
        if ((!z || TextUtils.isEmpty(str3) || !TextUtils.isEmpty(str5)) && ((!z || !TextUtils.isEmpty(str3) || TextUtils.isEmpty(str5)) && ((TextUtils.isEmpty(str) || TextUtils.isEmpty(str2)) && (TextUtils.isEmpty(str3) || TextUtils.isEmpty(str4))))) {
            z3 = false;
        }
        Preconditions.checkArgument(z3, "Cannot create PhoneAuthCredential without either verificationProof, sessionInfo, temporary proof, or enrollment ID.");
        this.zza = str;
        this.zzb = str2;
        this.zzc = z;
        this.zzd = str3;
        this.zze = z2;
        this.zzf = str4;
        this.zzg = str5;
    }

    public static PhoneAuthCredential zzc(String str, String str2) {
        return new PhoneAuthCredential(str, str2, false, null, true, null, null);
    }

    public static PhoneAuthCredential zzd(String str, String str2) {
        return new PhoneAuthCredential(null, null, false, str, true, str2, null);
    }

    @Override // com.google.firebase.auth.AuthCredential
    public String getProvider() {
        return "phone";
    }

    @Override // com.google.firebase.auth.AuthCredential
    public String getSignInMethod() {
        return "phone";
    }

    public String getSmsCode() {
        return this.zzb;
    }

    @Override // android.os.Parcelable
    public final void writeToParcel(Parcel parcel, int i) {
        int iBeginObjectHeader = SafeParcelWriter.beginObjectHeader(parcel);
        SafeParcelWriter.writeString(parcel, 1, this.zza, false);
        SafeParcelWriter.writeString(parcel, 2, getSmsCode(), false);
        SafeParcelWriter.writeBoolean(parcel, 3, this.zzc);
        SafeParcelWriter.writeString(parcel, 4, this.zzd, false);
        SafeParcelWriter.writeBoolean(parcel, 5, this.zze);
        SafeParcelWriter.writeString(parcel, 6, this.zzf, false);
        SafeParcelWriter.writeString(parcel, 7, this.zzg, false);
        SafeParcelWriter.finishObjectHeader(parcel, iBeginObjectHeader);
    }

    @Override // com.google.firebase.auth.AuthCredential
    public final AuthCredential zza() {
        return clone();
    }

    /* JADX INFO: renamed from: zzb, reason: merged with bridge method [inline-methods] */
    public final PhoneAuthCredential clone() {
        return new PhoneAuthCredential(this.zza, getSmsCode(), this.zzc, this.zzd, this.zze, this.zzf, this.zzg);
    }

    public final PhoneAuthCredential zze(boolean z) {
        this.zze = false;
        return this;
    }

    public final String zzf() {
        return this.zzd;
    }

    public final String zzg() {
        return this.zza;
    }

    public final String zzh() {
        return this.zzf;
    }

    public final boolean zzi() {
        return this.zze;
    }
}
