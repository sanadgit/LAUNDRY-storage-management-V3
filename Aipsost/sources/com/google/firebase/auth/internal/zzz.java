package com.google.firebase.auth.internal;

import android.os.Parcel;
import android.os.Parcelable;
import com.google.android.gms.common.internal.safeparcel.SafeParcelWriter;
import com.google.firebase.auth.FirebaseUserMetadata;
import org.json.JSONException;
import org.json.JSONObject;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzz implements FirebaseUserMetadata {
    public static final Parcelable.Creator<zzz> CREATOR = new zzaa();
    private final long zza;
    private final long zzb;

    public zzz(long j, long j2) {
        this.zza = j;
        this.zzb = j2;
    }

    @Override // android.os.Parcelable
    public final int describeContents() {
        return 0;
    }

    @Override // com.google.firebase.auth.FirebaseUserMetadata
    public final long getCreationTimestamp() {
        return this.zzb;
    }

    @Override // com.google.firebase.auth.FirebaseUserMetadata
    public final long getLastSignInTimestamp() {
        return this.zza;
    }

    @Override // android.os.Parcelable
    public final void writeToParcel(Parcel parcel, int i) {
        int iBeginObjectHeader = SafeParcelWriter.beginObjectHeader(parcel);
        SafeParcelWriter.writeLong(parcel, 1, this.zza);
        SafeParcelWriter.writeLong(parcel, 2, this.zzb);
        SafeParcelWriter.finishObjectHeader(parcel, iBeginObjectHeader);
    }

    public final JSONObject zza() {
        JSONObject jSONObject = new JSONObject();
        try {
            jSONObject.put("lastSignInTimestamp", this.zza);
            jSONObject.put("creationTimestamp", this.zzb);
        } catch (JSONException e) {
        }
        return jSONObject;
    }
}
