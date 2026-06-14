package com.google.android.gms.internal.p001firebaseauthapi;

import android.os.Parcel;
import android.os.Parcelable;
import com.google.android.gms.common.internal.safeparcel.AbstractSafeParcelable;
import com.google.android.gms.common.internal.safeparcel.SafeParcelWriter;
import com.google.firebase.auth.ActionCodeSettings;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzsc extends AbstractSafeParcelable {
    public static final Parcelable.Creator<zzsc> CREATOR = new zzsd();
    private final String zza;
    private final ActionCodeSettings zzb;

    public zzsc(String str, ActionCodeSettings actionCodeSettings) {
        this.zza = str;
        this.zzb = actionCodeSettings;
    }

    @Override // android.os.Parcelable
    public final void writeToParcel(Parcel parcel, int i) {
        int iBeginObjectHeader = SafeParcelWriter.beginObjectHeader(parcel);
        SafeParcelWriter.writeString(parcel, 1, this.zza, false);
        SafeParcelWriter.writeParcelable(parcel, 2, this.zzb, i, false);
        SafeParcelWriter.finishObjectHeader(parcel, iBeginObjectHeader);
    }

    public final ActionCodeSettings zza() {
        return this.zzb;
    }

    public final String zzb() {
        return this.zza;
    }
}
