package com.google.android.gms.internal.p001firebaseauthapi;

import android.os.Parcel;
import android.os.Parcelable;
import com.google.android.gms.common.internal.safeparcel.AbstractSafeParcelable;
import com.google.android.gms.common.internal.safeparcel.SafeParcelWriter;
import com.google.android.gms.common.util.Strings;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzaaw extends AbstractSafeParcelable {
    public static final Parcelable.Creator<zzaaw> CREATOR = new zzaax();
    public final int zza;
    private List zzb;

    public zzaaw() {
        this(null);
    }

    public static zzaaw zza(zzaaw zzaawVar) {
        return new zzaaw(zzaawVar.zzb);
    }

    @Override // android.os.Parcelable
    public final void writeToParcel(Parcel parcel, int i) {
        int iBeginObjectHeader = SafeParcelWriter.beginObjectHeader(parcel);
        SafeParcelWriter.writeInt(parcel, 1, this.zza);
        SafeParcelWriter.writeStringList(parcel, 2, this.zzb, false);
        SafeParcelWriter.finishObjectHeader(parcel, iBeginObjectHeader);
    }

    public final List zzb() {
        return this.zzb;
    }

    zzaaw(int i, List list) {
        this.zza = i;
        if (list == null || list.isEmpty()) {
            this.zzb = Collections.emptyList();
            return;
        }
        for (int i2 = 0; i2 < list.size(); i2++) {
            list.set(i2, Strings.emptyToNull((String) list.get(i2)));
        }
        this.zzb = Collections.unmodifiableList(list);
    }

    public zzaaw(List list) {
        this.zza = 1;
        this.zzb = new ArrayList();
        if (list == null || list.isEmpty()) {
            return;
        }
        this.zzb.addAll(list);
    }
}
