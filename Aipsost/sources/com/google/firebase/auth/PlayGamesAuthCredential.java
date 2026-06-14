package com.google.firebase.auth;

import android.os.Parcel;
import android.os.Parcelable;
import com.google.android.gms.common.internal.Preconditions;
import com.google.android.gms.common.internal.safeparcel.SafeParcelWriter;
import com.google.android.gms.internal.p001firebaseauthapi.zzaay;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public class PlayGamesAuthCredential extends AuthCredential {
    public static final Parcelable.Creator<PlayGamesAuthCredential> CREATOR = new zzaj();
    private final String zza;

    PlayGamesAuthCredential(String str) {
        this.zza = Preconditions.checkNotEmpty(str);
    }

    public static zzaay zzb(PlayGamesAuthCredential playGamesAuthCredential, String str) {
        Preconditions.checkNotNull(playGamesAuthCredential);
        return new zzaay(null, null, playGamesAuthCredential.getProvider(), null, null, playGamesAuthCredential.zza, str, null, null);
    }

    @Override // com.google.firebase.auth.AuthCredential
    public String getProvider() {
        return "playgames.google.com";
    }

    @Override // com.google.firebase.auth.AuthCredential
    public String getSignInMethod() {
        return "playgames.google.com";
    }

    @Override // android.os.Parcelable
    public final void writeToParcel(Parcel parcel, int i) {
        int iBeginObjectHeader = SafeParcelWriter.beginObjectHeader(parcel);
        SafeParcelWriter.writeString(parcel, 1, this.zza, false);
        SafeParcelWriter.finishObjectHeader(parcel, iBeginObjectHeader);
    }

    @Override // com.google.firebase.auth.AuthCredential
    public final AuthCredential zza() {
        return new PlayGamesAuthCredential(this.zza);
    }
}
